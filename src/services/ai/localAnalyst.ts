// =====================================================================
// Analista IA local (fallback sin backend)
// ---------------------------------------------------------------------
// Genera informes, diagnósticos, comparativas y mensajes de forma
// determinística a partir de las señales del lead. Cuando se conecte
// OpenAI (aiProvider), estas funciones son el fallback / plantilla.
// =====================================================================

import { APP } from '../../config/app'
import { uid } from '../../lib/id'
import type {
  AnalysisReport,
  AuditFinding,
  CompetitorDimension,
  GeneratedMessage,
  Lead,
  MessageChannel,
} from '../../types'

function clamp(n: number) {
  return Math.max(3, Math.min(98, Math.round(n)))
}

/** Deriva métricas 0..100 de presencia digital desde las señales. */
function deriveMetrics(lead: Lead): AnalysisReport['metrics'] {
  const p = lead.digitalPresence
  const base =
    p === 'sin-web' ? 8 : p === 'web-vieja' ? 32 : p === 'web-aceptable' ? 58 : 82
  const ig = lead.signals.hasActiveInstagram ? 12 : 0
  const rep = Math.min(15, (lead.signals.rating ?? 0) * 3)
  return {
    performance: clamp(base + (p === 'web-vieja' ? -8 : 0)),
    seo: clamp(base - 6),
    ux: clamp(base + 2),
    branding: clamp(base + ig - 4),
    conversion: clamp(base - 10 + (lead.signals.whatsapp ? 6 : 0)),
    mobile: clamp(base - 4),
    trust: clamp(base + rep),
  }
}

const CATALOG: Omit<AuditFinding, 'id'>[] = [
  { area: 'web', title: 'No tiene sitio web propio', status: 'fail', priority: 'alta', impact: 'Pierde a todos los clientes que buscan en Google antes de comprar y no encuentran un sitio serio.', solution: 'Una web profesional captura esa demanda y la convierte en consultas por WhatsApp.' },
  { area: 'performance', title: 'La web carga demasiado lento', status: 'fail', priority: 'alta', impact: 'Más de la mitad de las visitas se van si tarda más de 3 segundos en móvil.', solution: 'Una web moderna optimizada carga en menos de 2s y retiene al visitante.' },
  { area: 'conversion', title: 'No tiene botón de WhatsApp', status: 'fail', priority: 'alta', impact: 'El cliente quiere escribir pero no encuentra cómo: se pierde la venta.', solution: 'Botón flotante de WhatsApp visible en todo el sitio para captar consultas al instante.' },
  { area: 'seo', title: 'No está optimizada para SEO', status: 'fail', priority: 'media', impact: 'No aparece en Google cuando buscan su rubro en la zona.', solution: 'SEO local: fichas, metadatos y contenido para rankear en su zona.' },
  { area: 'conversion', title: 'No tiene formulario de contacto', status: 'warn', priority: 'media', impact: 'Depende de que el cliente llame; muchos prefieren dejar sus datos.', solution: 'Formularios y CTAs claros que capturan leads 24/7.' },
  { area: 'confianza', title: 'No muestra testimonios ni casos', status: 'warn', priority: 'media', impact: 'Sin prueba social el visitante duda y compara con la competencia.', solution: 'Sección de testimonios y casos de éxito que genera confianza.' },
  { area: 'web', title: 'Sin HTTPS / candado de seguridad', status: 'fail', priority: 'alta', impact: 'El navegador marca el sitio como "no seguro" y espanta al visitante.', solution: 'Certificado SSL y dominio propio profesional.' },
  { area: 'web', title: 'No es responsive (móvil)', status: 'fail', priority: 'alta', impact: '8 de cada 10 visitas son desde el celular y se ve mal.', solution: 'Diseño mobile-first perfecto en cualquier pantalla.' },
  { area: 'seo', title: 'Sin Google Analytics ni Pixel', status: 'warn', priority: 'baja', impact: 'No puede medir visitas ni hacer campañas de remarketing.', solution: 'Instalación de Analytics y Meta Pixel para medir y escalar.' },
  { area: 'confianza', title: 'No transmite profesionalismo / branding', status: 'warn', priority: 'media', impact: 'Una imagen poco cuidada baja el valor percibido y el precio que puede cobrar.', solution: 'Identidad visual coherente que posiciona al negocio como premium.' },
  { area: 'social', title: 'Instagram activo sin web que convierta', status: 'warn', priority: 'media', impact: 'Invierte tiempo en redes pero no tiene dónde cerrar la venta.', solution: 'Una web conecta el Instagram con turnos/consultas y catálogo.' },
]

/** Selecciona hallazgos relevantes según la presencia digital del lead. */
function pickFindings(lead: Lead): AuditFinding[] {
  const p = lead.digitalPresence
  const chosen: Omit<AuditFinding, 'id'>[] = []
  const has = (t: string) => chosen.some((c) => c.title === t)
  const add = (title: string) => {
    const item = CATALOG.find((c) => c.title === title)
    if (item && !has(title)) chosen.push(item)
  }

  if (p === 'sin-web') {
    add('No tiene sitio web propio')
    if (lead.signals.hasActiveInstagram) add('Instagram activo sin web que convierta')
    add('No aparece en Google cuando buscan su rubro en la zona.')
    add('No está optimizada para SEO')
    add('No muestra testimonios ni casos')
  } else {
    add('La web carga demasiado lento')
    add('No es responsive (móvil)')
    if (lead.signals.website && !lead.signals.website.startsWith('https')) add('Sin HTTPS / candado de seguridad')
    add('No tiene botón de WhatsApp')
    add('No está optimizada para SEO')
    add('Sin Google Analytics ni Pixel')
    add('No transmite profesionalismo / branding')
    add('No muestra testimonios ni casos')
  }
  if (!lead.signals.whatsapp) add('No tiene botón de WhatsApp')
  return chosen.map((c) => ({ ...c, id: uid('find') }))
}

function competitorDims(lead: Lead): CompetitorDimension[] {
  const m = deriveMetrics(lead)
  return [
    { dimension: 'Diseño', theirs: m.branding, vigolo: 95 },
    { dimension: 'Velocidad', theirs: m.performance, vigolo: 96 },
    { dimension: 'Responsive', theirs: m.mobile, vigolo: 98 },
    { dimension: 'Conversión', theirs: m.conversion, vigolo: 92 },
    { dimension: 'SEO', theirs: m.seo, vigolo: 90 },
    { dimension: 'Branding', theirs: m.branding, vigolo: 94 },
    { dimension: 'UX', theirs: m.ux, vigolo: 93 },
  ]
}

export function analyzeLead(lead: Lead): AnalysisReport {
  const findings = pickFindings(lead)
  const metrics = deriveMetrics(lead)
  const fails = findings.filter((f) => f.status === 'fail').length
  const summary =
    lead.digitalPresence === 'sin-web'
      ? `${lead.name} tiene ${lead.signals.reviewsCount ?? 0} reseñas y ${lead.signals.rating?.toFixed(1) ?? '—'}★ de reputación, pero NO tiene sitio web. Está dejando pasar clientes que la buscan en Google todos los días. Detectamos ${findings.length} oportunidades de mejora (${fails} críticas).`
      : `${lead.name} tiene presencia web ${lead.digitalPresence.replace('-', ' ')}, pero con problemas que le cuestan clientes. Detectamos ${findings.length} puntos a mejorar (${fails} críticos) que una web moderna resolvería.`

  return {
    generatedAt: new Date().toISOString(),
    summary,
    findings,
    metrics,
    competitor: lead.digitalPresence !== 'sin-web' ? competitorDims(lead) : undefined,
  }
}

// ---------------------------------------------------------------------
// Mensajes comerciales (tono argentino)
// ---------------------------------------------------------------------

const AGENCY = APP.agency.name
const SIGN = APP.agency.signature

const CHANNELS: { channel: MessageChannel; label: string }[] = [
  { channel: 'whatsapp', label: 'WhatsApp' },
  { channel: 'instagram', label: 'Instagram DM' },
  { channel: 'email', label: 'Email' },
  { channel: 'linkedin', label: 'LinkedIn' },
  { channel: 'seguimiento-1', label: 'Seguimiento 1' },
  { channel: 'seguimiento-2', label: 'Seguimiento 2' },
  { channel: 'seguimiento-3', label: 'Seguimiento 3' },
  { channel: 'obj-precio', label: 'Objeción: precio' },
  { channel: 'obj-pensarlo', label: 'Objeción: "lo pienso"' },
  { channel: 'obj-ya-tengo-web', label: 'Objeción: "ya tengo web"' },
  { channel: 'obj-no-responde', label: 'No responde' },
  { channel: 'quiere-reunion', label: 'Quiere reunión' },
]

export const MESSAGE_CHANNELS = CHANNELS

function hook(lead: Lead): string {
  switch (lead.digitalPresence) {
    case 'sin-web':
      return `vi que ${lead.name} tiene muy buena presencia en la zona pero todavía no tiene una página web propia`
    case 'web-vieja':
      return `estuve mirando la web de ${lead.name} y creo que con un rediseño le sacarían mucho más provecho`
    case 'web-aceptable':
      return `vi la web de ${lead.name}, está buena, y con unos ajustes podría generar bastantes más consultas`
    default:
      return `me gustó cómo se maneja ${lead.name} y creo que hay margen para potenciar su web y captar más clientes`
  }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function messageFor(lead: Lead, channel: MessageChannel): string {
  const n = lead.name
  switch (channel) {
    case 'whatsapp':
      return `¡Hola! ¿Cómo va? Te escribo de ${AGENCY}. ${cap(hook(lead))}. Hago páginas web profesionales para negocios que quieren recibir más consultas por WhatsApp. ¿Te muestro un par de ejemplos? Sin compromiso 😊`
    case 'instagram':
      return `¡Hola! ¿Cómo andan? 👋 ${cap(hook(lead))}. Tengo una agencia (${AGENCY}) especializada en webs para negocios como ${n}. Si quieren les paso ideas concretas, sin vueltas.`
    case 'email':
      return `Asunto: Una web que le traiga más consultas a ${n}\n\nHola, ¿cómo está?\n\nSoy ${SIGN.split(' — ')[0]}, de ${AGENCY}. ${cap(hook(lead))}.\n\nMe especializo en páginas rápidas y pensadas para que el cliente termine escribiendo por WhatsApp o dejando sus datos. Si le interesa, le preparo una propuesta a medida para ${n}, sin compromiso.\n\nSaludos,\n${SIGN}`
    case 'linkedin':
      return `Hola, ¿cómo estás? Vi el perfil de ${n} y me pareció que hay una oportunidad clara de mejorar su presencia digital. En ${AGENCY} ayudamos a negocios del rubro a convertir más con una web profesional. ¿Te interesa que te comparta un análisis rápido?`
    case 'seguimiento-1':
      return `¡Hola! ¿Cómo va? Te había escrito por lo de la web para ${n}. No te quiero hinchar 🙌, solo saber si te interesa que te muestre algo concreto. ¿Lo vemos?`
    case 'seguimiento-2':
      return `¡Hola de nuevo! Te dejo un dato: la mayoría de tus clientes te buscan primero en Google desde el celular. Con una web simple podés captar esas consultas. ¿Te preparo una propuesta corta para ${n}?`
    case 'seguimiento-3':
      return `¡Hola! Última que te escribo para no molestar 🙂. Si en algún momento querés potenciar ${n} con una web que traiga consultas, quedo a disposición. ¡Éxitos!`
    case 'obj-precio':
      return `Entiendo perfecto. Lo pensás como inversión: una sola venta nueva por mes ya paga la web. Tengo planes desde opciones accesibles y financiación. ¿Te muestro qué incluye cada uno para ${n}?`
    case 'obj-pensarlo':
      return `¡Dale, tomate tu tiempo! Te dejo un mini análisis de ${n} así lo ves con datos. Cualquier duda me escribís. ¿Te parece si te reescribo la semana que viene?`
    case 'obj-ya-tengo-web':
      return `¡Buenísimo que ya tengan web! Justamente por eso te escribo: hice un análisis y detecté algunos puntos (velocidad, móvil, WhatsApp, SEO) que se pueden mejorar para que traiga más consultas. ¿Te lo comparto sin cargo?`
    case 'obj-no-responde':
      return `¡Hola! Se me debe haber pasado tu respuesta 🙈. Si el momento no es el ideal, no hay drama. Solo decime "ahora no" y te reescribo más adelante. ¡Abrazo!`
    case 'quiere-reunion':
      return `¡Genial! Me encanta. Tengo disponibilidad esta semana. ¿Te queda cómodo una llamada de 15 min? Pasame dos horarios que te sirvan y lo agendamos para ver la propuesta de ${n} 🙌`
  }
}

export function allMessages(lead: Lead): GeneratedMessage[] {
  return CHANNELS.map(({ channel, label }) => ({
    channel,
    label,
    text: messageFor(lead, channel),
  }))
}

// ---------------------------------------------------------------------
// Asesor IA estratégico (razonamiento local sobre el dataset)
// ---------------------------------------------------------------------

export interface AdvisorContext {
  leads: Lead[]
}

export function advisorAnswer(question: string, ctx: AdvisorContext): string {
  const q = question.toLowerCase()
  const leads = ctx.leads
  if (leads.length === 0) return 'Todavía no hay leads cargados. Hacé un sondeo en Prospección para que pueda analizarlos.'

  const byScore = [...leads].sort((a, b) => b.score - a.score)

  const topN = (n: number) =>
    byScore
      .slice(0, n)
      .map((l, i) => `${i + 1}. ${l.name} (${l.zone}) — score ${l.score}, ${l.scoreHeadline}`)
      .join('\n')

  const bestBy = (key: 'zone' | 'category') => {
    const map = new Map<string, { sum: number; n: number }>()
    for (const l of leads) {
      const k = l[key]
      const cur = map.get(k) ?? { sum: 0, n: 0 }
      cur.sum += l.score
      cur.n += 1
      map.set(k, cur)
    }
    return [...map.entries()]
      .map(([k, v]) => ({ k, avg: v.sum / v.n, n: v.n }))
      .sort((a, b) => b.avg - a.avg)
  }

  if (q.includes('primero') || q.includes('contactar') || q.includes('prioridad') || q.includes('probabilidad')) {
    return `Te ordeno los que conviene contactar primero por score de oportunidad:\n\n${topN(5)}\n\nEmpezá por el #1: mayor probabilidad de cerrar con menos esfuerzo.`
  }
  if (q.includes('ciudad') || q.includes('zona') || q.includes('barrio')) {
    const z = bestBy('zone')
    return `Mejores zonas por oportunidad promedio:\n\n${z.slice(0, 5).map((x, i) => `${i + 1}. ${x.k} — score prom. ${x.avg.toFixed(0)} (${x.n} leads)`).join('\n')}\n\nSugerencia: concentrá el sondeo en ${z[0]?.k}.`
  }
  if (q.includes('rubro') || q.includes('categoria') || q.includes('categoría')) {
    const c = bestBy('category')
    return `Mejores rubros por oportunidad promedio:\n\n${c.slice(0, 5).map((x, i) => `${i + 1}. ${x.k} — score prom. ${x.avg.toFixed(0)} (${x.n} leads)`).join('\n')}\n\nEl rubro ${c[0]?.k} está rindiendo mejor.`
  }
  if (q.includes('precio') || q.includes('cobrar') || q.includes('presupuesto')) {
    const avg = Math.round(leads.reduce((s, l) => s + l.potentialValue, 0) / leads.length)
    return `Para este perfil de negocios, un ticket saludable ronda ${avg.toLocaleString('es-AR')} (valor potencial promedio estimado). Recomendación: presentá 3 planes (básico / profesional / premium) y anclá en el del medio. Para negocios sin web y con muchas reseñas podés ir a la banda alta: tienen demanda y les falta el canal.`
  }
  if (q.includes('objecion') || q.includes('objeción') || q.includes('responder') || q.includes('vender')) {
    return `Guion rápido para vender una web:\n1) Mostrale el problema con datos (su análisis en la pestaña Auditoría).\n2) Traducí el problema a plata perdida ("clientes que te buscan y no te encuentran").\n3) Presentá la solución como inversión con retorno (una venta nueva paga la web).\n4) Cerrá con una acción chica: "¿te mando la propuesta?".\nPara objeciones puntuales tenés respuestas listas en la pestaña Mensajes (precio, "lo pienso", "ya tengo web", etc.).`
  }
  return `Puedo ayudarte a priorizar. Probá preguntarme:\n• ¿Qué negocio conviene contactar primero?\n• ¿Qué zona / rubro tiene mejores oportunidades?\n• ¿Qué precio recomendarías?\n• ¿Cómo le vendería una web / cómo respondo objeciones?\n\nMientras tanto, tu lead más caliente es: ${byScore[0].name} (${byScore[0].zone}), score ${byScore[0].score}.`
}
