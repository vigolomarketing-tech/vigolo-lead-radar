// =====================================================================
// Analista IA local (fallback sin backend)
// ---------------------------------------------------------------------
// Genera informes de ajuste de máquina, señales de oportunidad,
// comparativas y mensajes comerciales para vender las máquinas de
// 2GTech3D. Cuando se conecte OpenAI (aiProvider), estas funciones son el
// fallback / plantilla.
// =====================================================================

import { APP } from '../../config/app'
import { uid } from '../../lib/id'
import type {
  AnalysisReport,
  AuditFinding,
  CompetitorDimension,
  GeneratedMessage,
  Lead,
  MachineFit,
  MachineLine,
  MessageChannel,
} from '../../types'

function clamp(n: number) {
  return Math.max(3, Math.min(98, Math.round(n)))
}

const FIT_METRIC: Record<MachineFit, number> = { ideal: 94, alto: 74, medio: 50, exploratorio: 26 }

/** Deriva métricas 0..100 de potencial de compra desde el lead. */
function deriveMetrics(lead: Lead): AnalysisReport['metrics'] {
  const reviews = lead.signals.reviewsCount ?? 0
  const size = clamp(Math.min(95, 20 + reviews * 0.6))
  const contact =
    (lead.signals.whatsapp ? 55 : lead.signals.phone ? 35 : 15) +
    (lead.signals.instagram ? 20 : 0) +
    (lead.signals.website ? 15 : 0)
  const pay = (lead.signals.website ? 40 : 20) + (lead.signals.verified ? 15 : 0) + Math.min(35, reviews * 0.3)
  return {
    ajusteRubro: clamp(FIT_METRIC[lead.machineFit]),
    volumen: size,
    capacidadPago: clamp(pay),
    urgencia: clamp(FIT_METRIC[lead.machineFit] - 10 + (reviews > 60 ? 10 : 0)),
    contactabilidad: clamp(contact),
    competencia: clamp(45 + (lead.machineFit === 'ideal' ? 25 : 0)),
    tamano: size,
  }
}

// Señales de oportunidad por LÍNEA de máquina (por qué le conviene comprar).
const FINDINGS_BY_LINE: Record<MachineLine, Omit<AuditFinding, 'id'>[]> = {
  'laser-fibra': [
    { area: 'produccion', title: 'Terceriza el corte de metal', status: 'fail', priority: 'alta', impact: 'Depende de proveedores de corte láser/plasma: paga sobreprecio, pierde tiempos y control de calidad.', solution: 'Con una cortadora láser fibra propia internaliza el corte, produce 24/7 y elimina la tercerización.' },
    { area: 'costos', title: 'Sobrecosto por corte externo', status: 'warn', priority: 'alta', impact: 'Cada pieza cortada afuera suma costo y margen que se va a un tercero.', solution: 'El corte propio amortiza la máquina y baja el costo por pieza de forma sostenida.' },
    { area: 'calidad', title: 'Precisión y terminación limitadas', status: 'warn', priority: 'media', impact: 'El plasma/oxicorte deja rebabas y menor precisión que el láser.', solution: 'El láser fibra corta con precisión de décimas y bordes limpios, sin retrabajo.' },
    { area: 'demanda', title: 'Podría tomar trabajos que hoy rechaza', status: 'warn', priority: 'media', impact: 'Sin capacidad de corte propia deja pasar pedidos de mayor volumen o complejidad.', solution: 'Suma capacidad para captar trabajos de corte a terceros como nueva unidad de negocio.' },
  ],
  'grabadora-fibra': [
    { area: 'produccion', title: 'Grabado/marcado manual o tercerizado', status: 'fail', priority: 'alta', impact: 'El grabado a mano o afuera es lento, poco uniforme y limita las series.', solution: 'La grabadora láser fibra marca metal y piedra de forma permanente, rápida y repetible.' },
    { area: 'calidad', title: 'Falta de trazabilidad / personalización', status: 'warn', priority: 'media', impact: 'Sin marcado propio no puede numerar, personalizar ni dejar su marca en cada pieza.', solution: 'Grabado de logos, números de serie y personalización pieza por pieza en segundos.' },
    { area: 'demanda', title: 'Oportunidad de productos personalizados', status: 'warn', priority: 'media', impact: 'La personalización tiene alta demanda y buen margen que hoy no capitaliza.', solution: 'Nueva línea de personalización (regalería, trofeos, placas) con la misma máquina.' },
  ],
  co2: [
    { area: 'produccion', title: 'Corte/grabado tercerizado o manual', status: 'fail', priority: 'alta', impact: 'Depende de terceros para cortar MDF/acrílico o graba a mano: tiempos largos y menos precisión.', solution: 'El láser CO2 corta y graba madera, MDF, acrílico y cuero con precisión, en su propio taller.' },
    { area: 'costos', title: 'Costo por tercerizar el corte', status: 'warn', priority: 'alta', impact: 'El corte de placas y piezas afuera resta margen a cada trabajo.', solution: 'Producción propia que amortiza la máquina y mejora la rentabilidad por pieza.' },
    { area: 'demanda', title: 'Nuevos productos de alto margen', status: 'warn', priority: 'media', impact: 'No ofrece corte/grabado personalizado que sus clientes ya piden.', solution: 'Suma cartelería, apliques, cajas y personalización como servicios extra.' },
    { area: 'calidad', title: 'Terminaciones y detalle', status: 'warn', priority: 'media', impact: 'El corte manual limita la complejidad y la prolijidad de los diseños.', solution: 'Cortes complejos y grabados finos que agregan valor percibido al producto.' },
  ],
  construccion: [
    { area: 'produccion', title: 'Equipamiento de obra a renovar', status: 'warn', priority: 'media', impact: 'Herramienta de compactación o acceso en altura obsoleta o alquilada.', solution: 'Vibradores y andamios eléctricos propios: más productividad y menos alquiler.' },
    { area: 'costos', title: 'Costo de alquiler de equipos', status: 'warn', priority: 'media', impact: 'Alquilar equipos por obra suma un costo recurrente.', solution: 'Equipo propio que se amortiza en pocas obras.' },
  ],
}

function primaryLine(lead: Lead): MachineLine {
  return lead.machines[0]?.line ?? 'co2'
}

/** Selecciona señales de oportunidad según la máquina recomendada. */
function pickFindings(lead: Lead): AuditFinding[] {
  const line = primaryLine(lead)
  const base = [...(FINDINGS_BY_LINE[line] ?? FINDINGS_BY_LINE.co2)]
  const chosen: Omit<AuditFinding, 'id'>[] = [...base]

  // Señal de contacto según lo que falta.
  if (!lead.signals.whatsapp && !lead.signals.phone) {
    chosen.push({ area: 'demanda', title: 'Sin canal de contacto directo visible', status: 'warn', priority: 'baja', impact: 'No publica teléfono/WhatsApp: hay que ubicar al decisor por otra vía.', solution: 'Buscar el contacto por redes o Google Maps antes de la primera llamada.' })
  }
  // Señal de competencia para rubros ideales.
  if (lead.machineFit === 'ideal') {
    chosen.push({ area: 'competencia', title: 'Competidores incorporando láser', status: 'warn', priority: 'media', impact: 'En este rubro cada vez más talleres suman corte/grabado láser y ganan trabajos.', solution: 'Adelantarse a la competencia sumando la máquina antes de perder pedidos.' })
  }
  return chosen.map((c) => ({ ...c, id: uid('find') }))
}

function competitorDims(): CompetitorDimension[] {
  return [
    { dimension: 'Velocidad de producción', theirs: 42, conMaquina: 92 },
    { dimension: 'Precisión / terminación', theirs: 48, conMaquina: 95 },
    { dimension: 'Costo por pieza', theirs: 40, conMaquina: 85 },
    { dimension: 'Autonomía (sin terceros)', theirs: 30, conMaquina: 96 },
    { dimension: 'Capacidad de personalización', theirs: 35, conMaquina: 94 },
    { dimension: 'Nuevos productos / servicios', theirs: 38, conMaquina: 90 },
  ]
}

export function analyzeLead(lead: Lead): AnalysisReport {
  const findings = pickFindings(lead)
  const metrics = deriveMetrics(lead)
  const machine = lead.machines[0]
  const fails = findings.filter((f) => f.status === 'fail').length
  const fitText =
    lead.machineFit === 'ideal'
      ? 'es un rubro IDEAL'
      : lead.machineFit === 'alto'
        ? 'tiene un encaje ALTO'
        : lead.machineFit === 'medio'
          ? 'tiene un encaje MEDIO'
          : 'es un encaje a VALIDAR'

  const summary = `${lead.name} (${lead.category}) ${fitText} para las máquinas de ${APP.agency.name}. ${
    machine ? `La recomendación de entrada es la ${machine.name}. ` : ''
  }Con ${lead.signals.reviewsCount ?? 0} reseñas y rating ${lead.signals.rating?.toFixed(1) ?? '—'}★, detectamos ${findings.length} señales de oportunidad (${fails} de alto impacto) que justifican una propuesta.`

  return {
    generatedAt: new Date().toISOString(),
    summary,
    findings,
    metrics,
    competitor: competitorDims(),
  }
}

// ---------------------------------------------------------------------
// Mensajes comerciales (tono argentino) para vender máquinas
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
  { channel: 'obj-tercerizo', label: 'Objeción: "tercerizo"' },
  { channel: 'obj-ya-tengo', label: 'Objeción: "ya tengo"' },
  { channel: 'obj-no-responde', label: 'No responde' },
  { channel: 'quiere-reunion', label: 'Quiere reunión' },
]

export const MESSAGE_CHANNELS = CHANNELS

/** Uso concreto de la máquina según el rubro, para personalizar el pitch. */
function usoFor(lead: Lead): string {
  const line = primaryLine(lead)
  switch (line) {
    case 'laser-fibra':
      return 'cortar chapa y metal con láser fibra, con precisión y sin tercerizar'
    case 'grabadora-fibra':
      return 'grabar y marcar metal y piedra de forma permanente y en serie'
    case 'co2':
      return 'cortar y grabar MDF, madera, acrílico y cuero en su propio taller'
    case 'construccion':
      return 'equipar sus obras con vibradores y andamios propios'
  }
}

function maquina(lead: Lead): string {
  return lead.machines[0]?.name ?? 'una máquina láser/CNC'
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function messageFor(lead: Lead, channel: MessageChannel): string {
  const n = lead.name
  const uso = usoFor(lead)
  const rubro = lead.category.toLowerCase()
  const maq = maquina(lead)
  switch (channel) {
    case 'whatsapp':
      return `¡Hola! ¿Cómo andan en ${n}? Les escribo de ${AGENCY}. Vi que trabajan en ${rubro} y quería consultarles si hoy tercerizan o necesitan ${uso}. Importamos máquinas láser/CNC con garantía propia, puesta en marcha y asesoramiento. ¿Les paso info y una cotización de la ${maq}? Sin compromiso 😊`
    case 'instagram':
      return `¡Hola! 👋 Vengo de ${AGENCY}. Me encantó el trabajo de ${n} en ${rubro}. Ayudamos a talleres y fábricas a ${uso} con máquinas propias. Si quieren les paso especificaciones y precios, sin vueltas.`
    case 'email':
      return `Asunto: ${cap(uso.split(',')[0])} en ${n}\n\nHola, ¿cómo están?\n\nSoy ${SIGN.split(' — ')[0]}, de ${AGENCY} (${APP.agency.site}). Trabajamos con maquinaria industrial láser/CNC de importación directa, con garantía propia, puesta en marcha y asesoramiento técnico.\n\nVi que ${n} se dedica a ${rubro} y creo que la ${maq} les permitiría ${uso}, bajando costos de tercerización y sumando capacidad de producción.\n\nSi les interesa, les preparo una cotización y una demostración a medida. Quedo atento.\n\nSaludos,\n${SIGN}\n${APP.agency.phone} · ${APP.agency.email}`
    case 'linkedin':
      return `Hola, ¿cómo estás? Vi el perfil de ${n} (${rubro}). En ${AGENCY} proveemos máquinas láser/CNC para que empresas del rubro puedan ${uso}. ¿Te interesa que te comparta specs y un análisis de retorno de la ${maq}?`
    case 'seguimiento-1':
      return `¡Hola! ¿Cómo va? Te había escrito por lo de la ${maq} para ${n}. No te quiero hinchar 🙌, solo saber si les interesa que les pase la ficha técnica y el precio. ¿Lo vemos?`
    case 'seguimiento-2':
      return `¡Hola de nuevo! Te dejo un dato: la mayoría de los talleres que suman ${uso} amortizan la máquina dejando de tercerizar en pocos meses. ¿Te preparo un número concreto para ${n}?`
    case 'seguimiento-3':
      return `¡Hola! Última que te escribo para no molestar 🙂. Si más adelante evalúan sumar capacidad de producción en ${n}, quedo a disposición con toda la línea de ${AGENCY}. ¡Éxitos!`
    case 'obj-precio':
      return `Te entiendo. Pensalo como inversión productiva: la ${maq} deja de pagarle a terceros y empieza a generar trabajo propio. Manejamos financiación y planes. ¿Te armo el cálculo de amortización para ${n}?`
    case 'obj-tercerizo':
      return `¡Claro! Justamente por eso te escribo: lo que hoy pagás a un tercero por ${uso.split(',')[0]}, con máquina propia queda en ${n}, con tus tiempos y tu calidad. ¿Te muestro cuánto ahorrarías por mes?`
    case 'obj-ya-tengo':
      return `¡Buenísimo que ya trabajen con una! Muchos clientes nos suman como respaldo o para ampliar capacidad/formato. Te paso specs de la ${maq} por si les sirve comparar prestaciones, garantía y postventa. ¿Va?`
    case 'obj-no-responde':
      return `¡Hola! Se me debe haber pasado tu respuesta 🙈. Si no es el momento para evaluar equipamiento, no hay drama. Decime "ahora no" y te reescribo más adelante. ¡Abrazo!`
    case 'quiere-reunion':
      return `¡Genial! Coordinamos. Podemos hacer una llamada o incluso una demostración de la ${maq}. Pasame dos horarios que te sirvan y lo agendamos para ver todo en detalle 🙌`
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
      .map((l, i) => `${i + 1}. ${l.name} (${l.city}) — score ${l.score}, ${l.machines[0]?.name ?? 'máquina a definir'}`)
      .join('\n')

  const bestBy = (key: 'city' | 'category') => {
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
    return `Te ordeno los que conviene contactar primero por potencial de compra:\n\n${topN(5)}\n\nEmpezá por el #1: mejor ajuste de rubro y más chances de cerrar la máquina.`
  }
  if (q.includes('maquina') || q.includes('máquina') || q.includes('producto') || q.includes('modelo')) {
    const counts = new Map<string, number>()
    for (const l of leads) {
      const m = l.machines[0]?.name
      if (m) counts.set(m, (counts.get(m) ?? 0) + 1)
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    return `Máquinas más recomendadas para tu cartera de leads:\n\n${top.map(([m, c], i) => `${i + 1}. ${m} — ${c} leads`).join('\n')}\n\nApuntá el stock/demos a la máquina que más se repite.`
  }
  if (q.includes('ciudad') || q.includes('zona') || q.includes('provincia')) {
    const z = bestBy('city')
    return `Mejores ciudades por potencial promedio:\n\n${z.slice(0, 5).map((x, i) => `${i + 1}. ${x.k} — score prom. ${x.avg.toFixed(0)} (${x.n} leads)`).join('\n')}\n\nSugerencia: concentrá la prospección en ${z[0]?.k}.`
  }
  if (q.includes('rubro') || q.includes('categoria') || q.includes('categoría')) {
    const c = bestBy('category')
    return `Mejores rubros por potencial promedio:\n\n${c.slice(0, 5).map((x, i) => `${i + 1}. ${x.k} — score prom. ${x.avg.toFixed(0)} (${x.n} leads)`).join('\n')}\n\nEl rubro ${c[0]?.k} es el que mejor rinde.`
  }
  if (q.includes('precio') || q.includes('cotiza') || q.includes('presupuesto') || q.includes('financ')) {
    const avg = Math.round(leads.reduce((s, l) => s + l.potentialValue, 0) / leads.length)
    return `El ticket potencial promedio de tu cartera ronda ${avg.toLocaleString('es-AR')} ARS. Recomendación: presentá siempre 2 opciones (equipo de entrada vs. uno de mayor porte) y anclá en el retorno por dejar de tercerizar. Para rubros "ideal" con muchas reseñas podés proponer directamente el equipo de mayor potencia.`
  }
  if (q.includes('objecion') || q.includes('objeción') || q.includes('responder') || q.includes('vender')) {
    return `Guion para vender una máquina:\n1) Confirmá que hoy tercerizan o hacen el trabajo a mano (ver Análisis IA del lead).\n2) Traducí ese costo a plata/mes que se va a un tercero.\n3) Presentá la máquina como inversión que se amortiza y suma capacidad.\n4) Cerrá con una demo: "¿coordinamos una demostración?".\nPara objeciones puntuales (precio, "tercerizo", "ya tengo") tenés respuestas listas en la pestaña Mensajes.`
  }
  const top = byScore[0]
  return `Puedo ayudarte a priorizar. Probá preguntarme:\n• ¿Qué empresa conviene contactar primero?\n• ¿Qué máquina recomiendo más?\n• ¿Qué ciudad / rubro rinde mejor?\n• ¿Qué precio y financiación propongo?\n• ¿Cómo respondo objeciones?\n\nMientras tanto, tu lead más caliente es: ${top.name} (${top.city}), score ${top.score} — ${top.machines[0]?.name ?? 'máquina a definir'}.`
}
