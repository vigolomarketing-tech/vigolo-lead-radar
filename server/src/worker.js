// =====================================================================
// Vigolo Lead Radar — Backend / Proxy (Cloudflare Worker)
// ---------------------------------------------------------------------
// Protege las API keys (Google Places + OpenAI) del lado del servidor y
// resuelve CORS. El frontend (VITE_API_BASE_URL) llama estos endpoints:
//   POST /places/search   → Google Places (New) Text Search + mapeo
//   POST /ai/analyze      → OpenAI: diagnóstico del negocio
//   POST /ai/message      → OpenAI: 1 mensaje
//   POST /ai/messages     → OpenAI: set de mensajes
//   POST /ai/advisor      → OpenAI: asesor comercial
//   GET  /health          → estado
//
// Secrets (wrangler secret put ...):
//   GOOGLE_PLACES_API_KEY, OPENAI_API_KEY
// Vars (wrangler.toml):
//   OPENAI_MODEL (default gpt-4o-mini), ALLOWED_ORIGIN (CORS)
// =====================================================================

const HIGH_INTENT = ['barberia','peluqueria','gimnasio','estetica','spa','restaurante','cafeteria','bar','inmobiliaria','electricista','plomero','ferreteria','odontologia','consultorio','abogado','contador','veterinaria','turismo','hotel','indumentaria']

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
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) })
    }
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

// --------------------------------------------------------------------
// Google Places (New) — Text Search
// https://developers.google.com/maps/documentation/places/web-service/text-search
// --------------------------------------------------------------------
async function placesSearch(params, env) {
  if (!env.GOOGLE_PLACES_API_KEY) throw new Error('Falta GOOGLE_PLACES_API_KEY en el backend.')
  const loc = [params.city, params.province, 'Argentina'].filter(Boolean).join(', ')
  const textQuery = `${params.category || 'negocios'} en ${params.query || loc}`

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
  const name = p.displayName?.text || 'Negocio'
  const category = p.primaryTypeDisplayName?.text || params.category || 'Negocio'
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
      // Heurística de calidad; una auditoría real (Lighthouse) puede refinarla.
      websiteQuality: website ? (website.startsWith('https') ? 'aceptable' : 'vieja') : undefined,
      phone: p.internationalPhoneNumber || p.nationalPhoneNumber || undefined,
      whatsapp: undefined,
      reviewsCount: p.userRatingCount || 0,
      rating: p.rating || 0,
      verified: p.businessStatus === 'OPERATIONAL',
    },
  }
}

// --------------------------------------------------------------------
// OpenAI helpers
// --------------------------------------------------------------------
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

const SYS = 'Sos un vendedor argentino experto de una agencia de desarrollo web (Vigolo Web Studio). Escribís mensajes humanos, cercanos, profesionales y persuasivos, sin sonar spam. Nunca inventás datos ni prometés precios.'

async function aiMessage(body, env) {
  const { lead, channel } = body
  const text = await openai(env, [
    { role: 'system', content: SYS },
    { role: 'user', content: `Escribí un mensaje de prospección para el canal "${channel}" dirigido a este negocio:\n${JSON.stringify(businessBrief(lead))}\nDevolvé solo el texto del mensaje.` },
  ])
  return { text: text.trim() }
}

async function aiMessages(body, env) {
  const { lead } = body
  const channels = [
    ['whatsapp','WhatsApp'],['instagram','Instagram DM'],['email','Email'],
    ['linkedin','LinkedIn'],['seguimiento-1','Seguimiento 1'],
    ['seguimiento-2','Seguimiento 2'],['seguimiento-3','Seguimiento 3'],
  ]
  const content = await openai(env, [
    { role: 'system', content: SYS },
    { role: 'user', content: `Generá mensajes de prospección para el negocio:\n${JSON.stringify(businessBrief(lead))}\nDevolvé un JSON: {"messages":[{"channel":"whatsapp","label":"WhatsApp","text":"..."}, ...]} para estos canales: ${channels.map((c) => c[0]).join(', ')}.` },
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
    { role: 'system', content: SYS + ' Actuás como consultor comercial. Respondés claro y accionable, en español rioplatense.' },
    { role: 'user', content: `Datos de leads (top por score):\n${JSON.stringify(top)}\n\nPregunta: ${question}` },
  ])
  return { answer: answer.trim() }
}

async function aiAnalyze(body, env) {
  const { lead } = body
  const metrics = deriveMetrics(lead)
  const content = await openai(env, [
    { role: 'system', content: 'Sos un auditor de presencia digital. Analizás negocios para una agencia web. Respondés en español, en JSON válido.' },
    { role: 'user', content: `Analizá este negocio y devolvé JSON con: {"summary": "...", "findings": [{"area":"web|seo|performance|social|confianza|conversion","title":"...","status":"ok|warn|fail","priority":"alta|media|baja","impact":"...","solution":"..."}]}\nNegocio:\n${JSON.stringify(businessBrief(lead))}` },
  ], true)
  let parsed = {}
  try { parsed = JSON.parse(content) } catch { /* noop */ }
  return {
    generatedAt: new Date().toISOString(),
    summary: parsed.summary || `${lead.name}: análisis de presencia digital.`,
    findings: (Array.isArray(parsed.findings) ? parsed.findings : []).map((f, i) => ({
      id: `f${i}`,
      area: f.area || 'web',
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
    name: lead.name, category: lead.category, province: lead.province, city: lead.city,
    website: lead.signals?.website || 'no tiene', instagram: lead.signals?.instagram || 'no',
    reviews: lead.signals?.reviewsCount ?? 0, rating: lead.signals?.rating ?? 0,
    presencia: lead.digitalPresence, score: lead.score,
  }
}

function deriveMetrics(lead) {
  const p = lead.digitalPresence
  const base = p === 'sin-web' ? 8 : p === 'web-vieja' ? 32 : p === 'web-aceptable' ? 58 : 82
  const clamp = (n) => Math.max(3, Math.min(98, Math.round(n)))
  return {
    performance: clamp(base), seo: clamp(base - 6), ux: clamp(base + 2),
    branding: clamp(base - 4), conversion: clamp(base - 10),
    mobile: clamp(base - 4), trust: clamp(base + (lead.signals?.rating || 0) * 3),
  }
}

// eslint utilizado por HIGH_INTENT (reservado para scoring server-side futuro)
export { HIGH_INTENT }
