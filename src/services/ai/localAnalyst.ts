// =====================================================================
// Analista IA local (fallback sin backend)
// Genera diagnosticos, recomendaciones y mensajes para venta consultiva
// de maquinas 2GTech3D a empresas industriales argentinas.
// =====================================================================

import { APP } from '../../config/app'
import { MACHINE_BY_ID } from '../../config/machines'
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

const MATURITY_SCORE = {
  artesanal: 35,
  'semi-industrial': 62,
  industrial: 82,
  'alta-produccion': 92,
} as const

const SIZE_SCORE = {
  micro: 38,
  pyme: 62,
  industrial: 82,
  'gran-industria': 92,
} as const

function deriveMetrics(lead: Lead): AnalysisReport['metrics'] {
  const hasContact = lead.signals.whatsapp || lead.signals.phone
  const hasProductionSignals =
    (lead.signals.productionSignals?.length ?? 0) > 0 ||
    lead.signals.hasCnc ||
    lead.signals.hasLaser ||
    lead.signals.exportsOrLargeClients
  const materials = lead.signals.materials?.length
    ? 86
    : lead.recommendedMaterials.length > 0
      ? 70
      : 45

  return {
    machineFit: clamp(lead.score + 8),
    industrialNeed: clamp(MATURITY_SCORE[lead.industrialMaturity] + (hasProductionSignals ? 8 : -4)),
    productionScale: clamp(SIZE_SCORE[lead.companySize] + (lead.signals.exportsOrLargeClients ? 8 : 0)),
    materialFit: clamp(materials),
    budgetFit: clamp(lead.potentialValue >= 30000000 ? SIZE_SCORE[lead.companySize] : SIZE_SCORE[lead.companySize] + 8),
    urgency: clamp(lead.score),
    contactability: clamp(hasContact ? 82 : lead.signals.linkedin || lead.signals.instagram ? 62 : 38),
  }
}

function finding(input: Omit<AuditFinding, 'id'>): AuditFinding {
  return { ...input, id: uid('find') }
}

function pickFindings(lead: Lead): AuditFinding[] {
  const machine = MACHINE_BY_ID[lead.recommendedMachineId]
  const materials = lead.signals.materials?.join(', ') || lead.recommendedMaterials.slice(0, 3).join(', ')
  const findings: AuditFinding[] = [
    finding({
      area: 'maquina',
      title: `Recomendar ${lead.recommendedMachineName}`,
      status: lead.scoreLevel === 'alta' ? 'ok' : 'warn',
      priority: lead.scoreLevel === 'alta' ? 'alta' : 'media',
      impact: `${lead.category} suele necesitar ${machine.applications.slice(0, 2).join(' y ')} para reducir tercerizacion, acelerar entregas o agregar servicios.`,
      solution: `Abrir la conversacion con ${machine.category}, ticket ${machine.ticketRange}, y validar volumen mensual, materiales y espacio disponible.`,
    }),
    finding({
      area: 'materiales',
      title: 'Materiales compatibles con el catalogo',
      status: materials ? 'ok' : 'warn',
      priority: 'alta',
      impact: `Materiales detectados/inferidos: ${materials}.`,
      solution: `Mostrar aplicaciones concretas: ${machine.applications.slice(0, 4).join(', ')}.`,
    }),
    finding({
      area: 'produccion',
      title: 'Necesidad de productividad y repetibilidad',
      status: lead.industrialMaturity === 'artesanal' ? 'warn' : 'ok',
      priority: lead.industrialMaturity === 'alta-produccion' ? 'alta' : 'media',
      impact: `Nivel estimado: ${lead.industrialMaturity}. Una maquina propia puede mejorar tiempos, precision y control de costos.`,
      solution: 'Preguntar por piezas mensuales, procesos tercerizados, cuellos de botella y plazo promedio de entrega.',
    }),
    finding({
      area: 'financiacion',
      title: `Ticket probable ${lead.ticketRange}`,
      status: lead.companySize === 'micro' && lead.potentialValue > 10000000 ? 'warn' : 'ok',
      priority: 'media',
      impact: 'La venta debe calificarse como inversion productiva, no como compra impulsiva.',
      solution: 'Llevar opciones de financiacion, anticipo, ROI por ahorro de tercerizacion y escenarios de recupero.',
    }),
    finding({
      area: 'contacto',
      title: lead.signals.whatsapp || lead.signals.phone ? 'Canal de contacto disponible' : 'Contacto a validar',
      status: lead.signals.whatsapp || lead.signals.phone ? 'ok' : 'warn',
      priority: lead.signals.whatsapp || lead.signals.phone ? 'media' : 'alta',
      impact: lead.signals.whatsapp || lead.signals.phone
        ? 'Se puede iniciar calificacion comercial sin investigacion adicional.'
        : 'Antes de vender conviene identificar duenio, responsable de produccion o compras.',
      solution: 'Contactar con una pregunta tecnica corta y pedir 10 minutos para validar proceso/materiales.',
    }),
  ]

  if (lead.scoreLevel === 'alta') {
    findings.push(
      finding({
        area: 'competencia',
        title: 'Oportunidad comercial prioritaria',
        status: 'ok',
        priority: 'alta',
        impact: 'El rubro, la escala y el ticket probable justifican seguimiento activo.',
        solution: 'Asignar vendedor, enviar mensaje personalizado y agendar relevamiento tecnico.',
      }),
    )
  }

  return findings
}

function competitorDims(lead: Lead): CompetitorDimension[] {
  const metrics = deriveMetrics(lead)
  return [
    { dimension: 'Encaje maquina', theirs: metrics.machineFit, target: 90 },
    { dimension: 'Necesidad industrial', theirs: metrics.industrialNeed, target: 88 },
    { dimension: 'Escala productiva', theirs: metrics.productionScale, target: 86 },
    { dimension: 'Materiales', theirs: metrics.materialFit, target: 90 },
    { dimension: 'Presupuesto', theirs: metrics.budgetFit, target: 82 },
    { dimension: 'Urgencia', theirs: metrics.urgency, target: 84 },
    { dimension: 'Contacto', theirs: metrics.contactability, target: 80 },
  ]
}

export function analyzeLead(lead: Lead): AnalysisReport {
  const findings = pickFindings(lead)
  const machine = MACHINE_BY_ID[lead.recommendedMachineId]
  const summary =
    `${lead.name} es una oportunidad ${lead.scoreLevel} para ${machine.name}. ` +
    `La recomendacion surge por el rubro ${lead.category}, materiales como ${lead.recommendedMaterials.slice(0, 3).join(', ')} ` +
    `y un perfil ${lead.companySize}/${lead.industrialMaturity}. ` +
    `La maquina resolveria ${machine.applications.slice(0, 3).join(', ')} y el ticket probable es ${lead.ticketRange}. ` +
    `Primer paso: contactar al responsable de produccion/compras y validar volumen mensual, procesos tercerizados y financiacion.`

  return {
    generatedAt: new Date().toISOString(),
    summary,
    findings,
    metrics: deriveMetrics(lead),
    competitor: competitorDims(lead),
  }
}

const AGENCY = APP.agency.name
const SIGN = APP.agency.signature

const CHANNELS: { channel: MessageChannel; label: string }[] = [
  { channel: 'whatsapp', label: 'WhatsApp' },
  { channel: 'email', label: 'Email' },
  { channel: 'linkedin', label: 'LinkedIn' },
  { channel: 'instagram', label: 'Instagram DM' },
  { channel: 'seguimiento-1', label: 'Seguimiento 1' },
  { channel: 'seguimiento-2', label: 'Seguimiento 2' },
  { channel: 'seguimiento-3', label: 'Seguimiento 3' },
  { channel: 'obj-precio', label: 'Objecion: precio' },
  { channel: 'obj-pensarlo', label: 'Objecion: lo pensamos' },
  { channel: 'obj-ya-tengo-maquina', label: 'Objecion: ya tengo maquina' },
  { channel: 'obj-no-responde', label: 'No responde' },
  { channel: 'quiere-reunion', label: 'Quiere reunion' },
]

export const MESSAGE_CHANNELS = CHANNELS

function contactName() {
  return SIGN.split(' - ')[0] || AGENCY
}

function machineHook(lead: Lead): string {
  const apps = lead.recommendedApplications.slice(0, 2).join(' y ')
  return `por el tipo de trabajo de ${lead.category.toLowerCase()}, probablemente podrian mejorar ${apps} con ${lead.recommendedMachineName}`
}

export function messageFor(lead: Lead, channel: MessageChannel): string {
  const machine = MACHINE_BY_ID[lead.recommendedMachineId]
  const n = lead.name
  switch (channel) {
    case 'whatsapp':
      return `Hola, buen dia. Soy ${contactName()}, de ${AGENCY}. Vi ${n} y ${machineHook(lead)}. No quiero mandarte un catalogo generico: queria preguntarte si hoy cortan/graban internamente o tercerizan parte del proceso. Si te sirve, te paso una recomendacion tecnica concreta.`
    case 'email':
      return `Asunto: Consulta tecnica para ${n}\n\nHola, buen dia.\n\nSoy ${contactName()}, de ${AGENCY}. Estuve revisando empresas del rubro ${lead.category} y ${machineHook(lead)}.\n\nLa maquina que mejor encaja como punto de partida es ${machine.name} (${machine.ticketRange}). Puede ayudar en ${machine.applications.slice(0, 3).join(', ')} y trabaja materiales como ${machine.materials.slice(0, 4).join(', ')}.\n\nAntes de enviar informacion, prefiero validar dos datos: que materiales trabajan y si hoy tercerizan algun proceso de corte/grabado.\n\nSaludos,\n${SIGN}`
    case 'linkedin':
      return `Hola, como estas? Soy ${contactName()}, de ${AGENCY}. Estoy contactando empresas industriales argentinas donde una ${machine.category} puede resolver tercerizacion, tiempos de entrega o trazabilidad. Por el perfil de ${n}, creo que ${machine.name} podria tener sentido. Te puedo compartir una recomendacion breve?`
    case 'instagram':
      return `Hola, como va? Soy ${contactName()} de ${AGENCY}. Vi el trabajo de ${n}; por materiales y rubro, ${lead.recommendedMachineName} podria sumarles capacidad de ${machine.applications.slice(0, 2).join(' y ')}. Si queres, te paso una guia corta para evaluar si conviene comprar o seguir tercerizando.`
    case 'seguimiento-1':
      return `Hola, retomo mi mensaje anterior por ${lead.recommendedMachineName}. Te queria dejar una pregunta simple: hoy ese proceso lo hacen adentro o lo mandan a terceros? Con eso te digo si tiene sentido avanzar o no.`
    case 'seguimiento-2':
      return `Buen dia. Para ${lead.category}, el punto clave suele ser calcular horas de maquina, costo tercerizado y recupero. Si me pasas material y volumen estimado, te preparo una recomendacion rapida de equipo 2GTech3D.`
    case 'seguimiento-3':
      return `Ultimo mensaje para no insistir. Si mas adelante estan evaluando corte, grabado o marcado industrial, quedo a disposicion para comparar opciones de 2GTech3D y estimar ROI.`
    case 'obj-precio':
      return `Es una inversion importante, totalmente. Por eso no conviene mirarla solo por precio: hay que comparar tercerizacion, desperdicio, tiempos de entrega y nuevos trabajos que podrian tomar. Podemos armar un escenario simple con ${lead.ticketRange} para ver si cierra.`
    case 'obj-pensarlo':
      return `Perfecto. Para que lo piensen con datos, les propongo validar tres cosas: materiales, volumen mensual y proceso que mas tercerizan. Con eso se ve rapido si ${lead.recommendedMachineName} tiene sentido ahora o si conviene esperar.`
    case 'obj-ya-tengo-maquina':
      return `Buenisimo que ya tengan maquina. En ese caso la conversacion cambia: vemos si necesitan mas potencia, mejor mesa, marcado complementario, respaldo tecnico o reducir cuello de botella. ${lead.recommendedMachineName} podria complementar lo que ya usan, no reemplazarlo a ciegas.`
    case 'obj-no-responde':
      return `Hola, dejo la consulta abierta para cuando sea oportuno. Si no son la persona indicada para equipos CNC/laser, me sirve que me orienten con produccion o compras. Gracias.`
    case 'quiere-reunion':
      return `Perfecto. Hagamos una llamada de 15 minutos para revisar materiales, medidas, volumen mensual, espacio y energia disponible. Con eso definimos si ${lead.recommendedMachineName} es la opcion correcta o si conviene otra maquina del catalogo.`
  }
}

export function allMessages(lead: Lead): GeneratedMessage[] {
  return CHANNELS.map(({ channel, label }) => ({
    channel,
    label,
    text: messageFor(lead, channel),
  }))
}

export interface AdvisorContext {
  leads: Lead[]
}

function bestBy(leads: Lead[], key: keyof Pick<Lead, 'province' | 'city' | 'category' | 'recommendedMachineName'>) {
  const map = new Map<string, { sum: number; value: number; n: number }>()
  for (const l of leads) {
    const k = String(l[key])
    const cur = map.get(k) ?? { sum: 0, value: 0, n: 0 }
    cur.sum += l.score
    cur.value += l.potentialValue
    cur.n += 1
    map.set(k, cur)
  }
  return [...map.entries()]
    .map(([k, v]) => ({ k, avg: v.sum / v.n, value: v.value, n: v.n }))
    .sort((a, b) => b.avg - a.avg)
}

export function advisorAnswer(question: string, ctx: AdvisorContext): string {
  const q = question.toLowerCase()
  const leads = ctx.leads
  if (leads.length === 0) return 'Todavia no hay leads cargados. Ejecuta una busqueda industrial en Prospeccion o Radar IA.'

  const byScore = [...leads].sort((a, b) => b.score - a.score)
  const top = byScore
    .slice(0, 5)
    .map((l, i) => `${i + 1}. ${l.name} - ${l.recommendedMachineName} - score ${l.score} - ${l.ticketRange}`)
    .join('\n')

  if (q.includes('primero') || q.includes('contactar') || q.includes('prioridad') || q.includes('probabilidad')) {
    return `Contactaria primero estos leads:\n\n${top}\n\nMotivo: combinan rubro objetivo, escala industrial, maquina clara y ticket justificable.`
  }

  if (q.includes('maquina') || q.includes('equipo') || q.includes('catalogo')) {
    const rows = bestBy(leads, 'recommendedMachineName')
      .slice(0, 5)
      .map((x, i) => `${i + 1}. ${x.k} - score prom. ${x.avg.toFixed(0)} - ${x.n} oportunidades`)
      .join('\n')
    return `Maquinas mas prometedoras en el radar:\n\n${rows}\n\nUsa esto para priorizar stock, demos tecnicas y mensajes por rubro.`
  }

  if (q.includes('provincia') || q.includes('ciudad') || q.includes('zona')) {
    const rows = bestBy(leads, q.includes('provincia') ? 'province' : 'city')
      .slice(0, 5)
      .map((x, i) => `${i + 1}. ${x.k} - score prom. ${x.avg.toFixed(0)} - potencial ${x.value.toLocaleString('es-AR')} ARS`)
      .join('\n')
    return `Zonas con mejor oportunidad:\n\n${rows}\n\nConviene combinar visitas tecnicas con llamadas de calificacion.`
  }

  if (q.includes('rubro') || q.includes('industria') || q.includes('categoria')) {
    const rows = bestBy(leads, 'category')
      .slice(0, 5)
      .map((x, i) => `${i + 1}. ${x.k} - score prom. ${x.avg.toFixed(0)} - ${x.n} leads`)
      .join('\n')
    return `Rubros con mejor encaje:\n\n${rows}\n\nEl mensaje debe hablar de proceso productivo, no de publicidad.`
  }

  if (q.includes('precio') || q.includes('ticket') || q.includes('valor') || q.includes('presupuesto')) {
    const avg = Math.round(leads.reduce((s, l) => s + l.potentialValue, 0) / leads.length)
    return `Ticket potencial promedio: ${avg.toLocaleString('es-AR')} ARS. Presentaria la propuesta como inversion productiva: ahorro de tercerizacion, mas velocidad, menos scrap y nuevos trabajos que hoy no pueden tomar.`
  }

  if (q.includes('vender') || q.includes('objecion') || q.includes('respuesta')) {
    return `Guion recomendado:\n1. Abrir con una pregunta tecnica: material, espesor/medida y volumen mensual.\n2. Conectar el problema con la maquina recomendada, no con una lista generica de productos.\n3. Traducir la inversion a ROI: tercerizacion, demora, desperdicio y nuevos servicios.\n4. Cerrar con relevamiento: energia, espacio, aire/ventilacion, operador y financiacion.\nLas respuestas por WhatsApp, Email, LinkedIn e Instagram ya estan en la pestana Mensajes.`
  }

  return `Tu mejor oportunidad ahora es ${byScore[0].name}: ${byScore[0].recommendedMachineName}, score ${byScore[0].score}, ticket ${byScore[0].ticketRange}. Puedo ayudarte a priorizar por maquina, rubro, provincia, ciudad, ticket o guion de venta.`
}
