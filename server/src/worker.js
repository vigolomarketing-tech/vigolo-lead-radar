// 2GTech3D Lead Radar - Backend / Proxy (Cloudflare Worker)
// Protege keys de Google Places + OpenAI y expone endpoints para el frontend.

const HIGH_INTENT = [
  'metalurgica','metalmecanica','carpinteria','muebleria','carteleria',
  'constructora','fabrica','autopartista','matriceria','diseno industrial',
  'escuela tecnica','universidad tecnica','taller industrial','corte laser',
  'grabado laser','acero inoxidable','aluminio','muebles','cocinas','aberturas',
  'estructuras',
]

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data, env, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(env) })
    try {
      if (url.pathname === '/health') {
        return json({
          ok: true,
          places: Boolean(env.GOOGLE_PLACES_API_KEY),
          openai: Boolean(env.OPENAI_API_KEY),
        }, env)
      }
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, env, 405)
      const body = await request.json().catch(() => ({}))

      if (url.pathname === '/places/search') return json(await placesSearch(body, env), env)
      if (url.pathname === '/ai/analyze') return json(await aiAnalyze(body, env), env)
      if (url.pathname === '/ai/message') return json(await aiMessage(body, env), env)
      if (url.pathname === '/ai/messages') return json(await aiMessages(body, env), env)
      if (url.pathname === '/ai/advisor') return json(await aiAdvisor(body, env), env)

      return json({ error: 'Not found' }, env, 404)
    } catch (err) {
      return json({ error: String(err?.message || err) }, env, 500)
    }
  },
}

async function placesSearch(params, env) {
  if (!env.GOOGLE_PLACES_API_KEY) throw new Error('Falta GOOGLE_PLACES_API_KEY en el backend.')
  const loc = [params.city, params.province, 'Argentina'].filter(Boolean).join(', ')
  const fallback = 'empresa industrial metalurgica carpinteria carteleria autopartista matriceria corte laser grabado laser'
  const textQuery = `${params.category || fallback} en ${params.query || loc}`

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': [
        'places.displayName','places.formattedAddress','places.location',
        'places.rating','places.userRatingCount','places.websiteUri',
        'places.internationalPhoneNumber','places.nationalPhoneNumber',
        'places.googleMapsUri','places.types','places.regularOpeningHours',
        'places.primaryTypeDisplayName','places.businessStatus',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery,
      languageCode: 'es',
      regionCode: 'AR',
      maxResultCount: 20,
      ...(params.minRating ? { minRating: params.minRating } : {}),
      ...(params.openNow ? { openNow: true } : {}),
    }),
  })
  if (!res.ok) throw new Error(`Google Places ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const places = data.places || []

  return places
    .map((p) => mapPlace(p, params))
    .filter((r) => {
      if (params.minReviews && (r.signals.reviewsCount || 0) < params.minReviews) return false
      if (params.hasWebsite === 'yes' && !r.signals.website) return false
      if (params.hasWebsite === 'no' && r.signals.website) return false
      if (params.hasPhone && !r.signals.phone) return false
      if (params.verifiedOnly && !r.signals.verified) return false
      return true
    })
}

function mapPlace(p, params) {
  const name = p.displayName?.text || 'Empresa industrial'
  const category = params.category || p.primaryTypeDisplayName?.text || 'Empresa industrial'
  const website = p.websiteUri || undefined
  return {
    name,
    category,
    province: params.province || 'Argentina',
    city: params.city || params.query || 'Argentina',
    zone: params.city || params.query || '',
    address: p.formattedAddress || '',
    location: p.location ? { lat: p.location.latitude, lng: p.location.longitude } : undefined,
    mapsUrl: p.googleMapsUri,
    categories: p.types,
    openNow: p.regularOpeningHours?.openNow,
    source: 'google',
    signals: {
      website,
      websiteQuality: website ? (website.startsWith('https') ? 'aceptable' : 'vieja') : undefined,
      phone: p.internationalPhoneNumber || p.nationalPhoneNumber || undefined,
      whatsapp: undefined,
      reviewsCount: p.userRatingCount || 0,
      rating: p.rating || 0,
      verified: p.businessStatus === 'OPERATIONAL',
    },
  }
}

async function openai(env, messages, jsonMode = false) {
  if (!env.OPENAI_API_KEY) throw new Error('Falta OPENAI_API_KEY en el backend.')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.8,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      messages,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

const SYS = 'Sos un vendedor argentino experto en venta consultiva B2B de maquinas CNC, laser fibra, laser CO2 y grabadoras laser para 2GTech3D. Escribis mensajes humanos, profesionales y concretos. No inventas datos ni prometes precios cerrados sin validar materiales, volumen, energia, espacio y financiacion.'

async function aiMessage(body, env) {
  const { lead, channel } = body
  const text = await openai(env, [
    { role: 'system', content: SYS },
    { role: 'user', content: `Escribi un mensaje de prospeccion para el canal "${channel}" dirigido a esta empresa industrial:\n${JSON.stringify(businessBrief(lead))}\nDebe recomendar la maquina, explicar por que, que problema resuelve y proponer un primer paso. Devolve solo el texto.` },
  ])
  return { text: text.trim() }
}

async function aiMessages(body, env) {
  const { lead } = body
  const channels = [
    ['whatsapp','WhatsApp'],['instagram','Instagram DM'],['email','Email'],
    ['linkedin','LinkedIn'],['seguimiento-1','Seguimiento 1'],
    ['seguimiento-2','Seguimiento 2'],['seguimiento-3','Seguimiento 3'],
    ['obj-precio','Objecion precio'],['obj-pensarlo','Objecion lo pensamos'],
    ['obj-ya-tengo-maquina','Objecion ya tengo maquina'],
  ]
  const content = await openai(env, [
    { role: 'system', content: SYS },
    { role: 'user', content: `Genera mensajes de prospeccion para esta empresa industrial:\n${JSON.stringify(businessBrief(lead))}\nDevolve JSON: {"messages":[{"channel":"whatsapp","label":"WhatsApp","text":"..."}, ...]} para estos canales: ${channels.map((c) => c[0]).join(', ')}. Inclui recomendacion de maquina y pregunta tecnica de calificacion.` },
  ], true)
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed.messages)) return parsed.messages
  } catch { /* fallthrough */ }
  return channels.map(([channel, label]) => ({ channel, label, text: content }))
}

async function aiAdvisor(body, env) {
  const { question, leads } = body
  const top = (leads || []).slice().sort((a, b) => b.score - a.score).slice(0, 25).map(businessBrief)
  const answer = await openai(env, [
    { role: 'system', content: SYS + ' Actuas como consultor comercial. Respondes claro y accionable, en espanol rioplatense.' },
    { role: 'user', content: `Datos de oportunidades (top por score):\n${JSON.stringify(top)}\n\nPregunta: ${question}` },
  ])
  return { answer: answer.trim() }
}

async function aiAnalyze(body, env) {
  const { lead } = body
  const metrics = deriveMetrics(lead)
  const content = await openai(env, [
    { role: 'system', content: 'Sos un analista comercial industrial para 2GTech3D. Respondes en espanol y JSON valido.' },
    { role: 'user', content: `Analiza esta oportunidad y devolve JSON con: {"summary": "...", "findings": [{"area":"maquina|produccion|materiales|financiacion|contacto|ubicacion|competencia","title":"...","status":"ok|warn|fail","priority":"alta|media|baja","impact":"...","solution":"..."}]}\nEmpresa:\n${JSON.stringify(businessBrief(lead))}` },
  ], true)
  let parsed = {}
  try { parsed = JSON.parse(content) } catch { /* noop */ }
  return {
    generatedAt: new Date().toISOString(),
    summary: parsed.summary || `${lead.name}: analisis de oportunidad industrial para ${lead.recommendedMachineName}.`,
    findings: (Array.isArray(parsed.findings) ? parsed.findings : []).map((f, i) => ({
      id: `f${i}`,
      area: f.area || 'maquina',
      title: f.title || 'Hallazgo',
      status: f.status || 'warn',
      priority: f.priority || 'media',
      impact: f.impact || '',
      solution: f.solution || '',
    })),
    metrics,
  }
}

function businessBrief(lead) {
  return {
    name: lead.name,
    category: lead.category,
    industry: lead.industry,
    province: lead.province,
    city: lead.city,
    recommendedMachine: lead.recommendedMachineName,
    machineCategory: lead.recommendedMachineCategory,
    ticketRange: lead.ticketRange,
    companySize: lead.companySize,
    industrialMaturity: lead.industrialMaturity,
    materials: lead.recommendedMaterials,
    applications: lead.recommendedApplications,
    website: lead.signals?.website || 'no tiene',
    instagram: lead.signals?.instagram || 'no',
    reviews: lead.signals?.reviewsCount ?? 0,
    rating: lead.signals?.rating ?? 0,
    presencia: lead.digitalPresence,
    score: lead.score,
    potentialValue: lead.potentialValue,
  }
}

function deriveMetrics(lead) {
  const clamp = (n) => Math.max(3, Math.min(98, Math.round(n)))
  const maturity = { artesanal: 35, 'semi-industrial': 62, industrial: 82, 'alta-produccion': 92 }[lead.industrialMaturity] || 60
  const size = { micro: 38, pyme: 62, industrial: 82, 'gran-industria': 92 }[lead.companySize] || 60
  return {
    machineFit: clamp(lead.score + 8),
    industrialNeed: clamp(maturity),
    productionScale: clamp(size),
    materialFit: clamp((lead.recommendedMaterials?.length || 0) ? 82 : 55),
    budgetFit: clamp(size + (lead.potentialValue > 30000000 ? -4 : 6)),
    urgency: clamp(lead.score),
    contactability: clamp(lead.signals?.whatsapp || lead.signals?.phone ? 82 : 42),
  }
}

export { HIGH_INTENT }
