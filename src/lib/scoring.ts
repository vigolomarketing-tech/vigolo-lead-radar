// =====================================================================
// Motor de score industrial para 2GTech3D Lead Radar.
// Un puntaje alto indica mayor probabilidad de compra de maquinas CNC/laser.
// =====================================================================

import {
  estimateCompanySize,
  estimateIndustrialMaturity,
  isIndustrialProvince,
  machineFitScore,
  recommendMachineForCategory,
} from '../config/machines'
import type {
  BusinessSignals,
  CompanySize,
  DigitalPresence,
  IndustrialMaturity,
  OpportunityLevel,
  ScoreFactor,
  ScoreResult,
} from '../types'

const INDUSTRIAL_INTENT = [
  'metalurgica',
  'metalmecanica',
  'autopartista',
  'matriceria',
  'carpinteria',
  'muebleria',
  'carteleria',
  'fabrica',
  'fabricante',
  'corte',
  'grabado',
  'aluminio',
  'acero inoxidable',
  'estructura',
  'diseno industrial',
  'escuela tecnica',
  'universidad tecnica',
  'constructora',
]

const SIZE_POINTS: Record<CompanySize, number> = {
  micro: 4,
  pyme: 10,
  industrial: 16,
  'gran-industria': 18,
}

const MATURITY_POINTS: Record<IndustrialMaturity, number> = {
  artesanal: 4,
  'semi-industrial': 10,
  industrial: 15,
  'alta-produccion': 18,
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isIndustrialCategory(category: string): boolean {
  const c = normalize(category)
  return INDUSTRIAL_INTENT.some((k) => c.includes(k))
}

// Compatibilidad retro para llamadas existentes durante la migracion.
export const isHighIntentCategory = isIndustrialCategory

export function computeDigitalPresence(s: BusinessSignals): DigitalPresence {
  if (!s.website || !s.website.trim()) return 'sin-web'
  if (s.websiteQuality === 'vieja') return 'web-vieja'
  if (s.websiteQuality === 'aceptable') return 'web-aceptable'
  return 'buen-potencial'
}

export function levelFromScore(score: number): OpportunityLevel {
  if (score >= 72) return 'alta'
  if (score >= 48) return 'media'
  return 'baja'
}

export function computeScore(
  signals: BusinessSignals,
  category: string,
  province = '',
): ScoreResult {
  const presence = computeDigitalPresence(signals)
  const machine = recommendMachineForCategory(category, signals)
  const size = estimateCompanySize(category, signals)
  const maturity = estimateIndustrialMaturity(category, signals)
  const f: ScoreFactor[] = []
  const push = (key: string, label: string, points: number, detail: string) =>
    f.push({ key, label, points, detail })

  const fit = machineFitScore(category, machine)
  if (fit >= 70) {
    push('machine-fit', 'Encaje critico con maquina', 20, `${machine.name} resuelve una necesidad directa del rubro.`)
  } else if (fit >= 40) {
    push('machine-fit', 'Buen encaje con maquina', 16, `${machine.name} tiene aplicaciones claras para este perfil.`)
  } else {
    push('machine-fit', 'Encaje exploratorio', 9, `${machine.name} aparece como recomendacion inicial por actividad.`)
  }

  push('company-size', 'Tamanio de empresa', SIZE_POINTS[size], `Perfil estimado: ${SIZE_LABEL[size]}.`)
  push(
    'industrial-maturity',
    'Nivel industrial',
    MATURITY_POINTS[maturity],
    `Madurez estimada: ${MATURITY_LABEL[maturity]}.`,
  )

  if (signals.hasCnc || signals.hasLaser || (signals.currentMachinery?.length ?? 0) > 0) {
    push(
      'current-machinery',
      'Ya trabaja con maquinaria',
      10,
      'Tiene seniales de uso de CNC, laser o equipamiento productivo.',
    )
  } else if (maturity !== 'artesanal') {
    push(
      'current-machinery',
      'Probable maquinaria existente',
      7,
      'El rubro suele requerir equipamiento y puede estar tercerizando procesos.',
    )
  }

  if ((signals.materials?.length ?? 0) > 0) {
    const materialText = signals.materials!.join(', ')
    push('materials', 'Materiales compatibles', 9, `Trabaja con ${materialText}, compatible con ${machine.category}.`)
  } else {
    push('materials', 'Materiales inferidos', 5, `El rubro suele usar ${machine.materials.slice(0, 3).join(', ')}.`)
  }

  if ((signals.productionSignals?.length ?? 0) > 0 || signals.exportsOrLargeClients) {
    push(
      'production-scale',
      'Escala productiva',
      9,
      'Hay seniales de volumen, clientes industriales o necesidad de repetibilidad.',
    )
  } else if (maturity === 'industrial' || maturity === 'alta-produccion') {
    push('production-scale', 'Produccion industrial probable', 7, 'El tipo de empresa suele necesitar velocidad y precision.')
  }

  if (isIndustrialProvince(province)) {
    push('location', 'Zona industrial prioritaria', 7, `${province} concentra demanda industrial y talleres productivos.`)
  } else if (province) {
    push('location', 'Cobertura nacional', 4, `${province} queda dentro del radar comercial nacional.`)
  }

  const reviews = signals.reviewsCount ?? 0
  const rating = signals.rating ?? 0
  if (reviews >= 80) push('traction', 'Empresa visible y activa', 7, `${reviews} resenias en Google.`)
  else if (reviews >= 20) push('traction', 'Actividad comercial visible', 5, `${reviews} resenias en Google.`)
  else if (reviews > 0) push('traction', 'Presencia comercial baja', 2, `${reviews} resenias en Google.`)

  if (rating >= 4.4) push('reputation', 'Buena reputacion', 4, `Rating ${rating.toFixed(1)}: negocio cuidado.`)
  else if (rating >= 3.8) push('reputation', 'Reputacion aceptable', 2, `Rating ${rating.toFixed(1)}.`)

  if (signals.whatsapp) push('contact', 'WhatsApp disponible', 5, 'Canal directo para iniciar calificacion comercial.')
  else if (signals.phone) push('contact', 'Telefono disponible', 3, 'Se puede iniciar contacto telefonico.')
  else push('contact', 'Contacto a validar', 1, 'Hace falta validar decisor y telefono.')

  if (presence === 'sin-web') {
    push('digital', 'Baja presencia digital', 3, 'Puede requerir mayor investigacion antes de contactar.')
  } else if (presence === 'web-vieja') {
    push('digital', 'Presencia digital basica', 4, 'Permite validar actividad, productos y escala.')
  } else {
    push('digital', 'Buena trazabilidad digital', 6, 'Hay mas contexto para personalizar la oferta industrial.')
  }

  if (isIndustrialCategory(category)) {
    push('industry-intent', 'Rubro objetivo 2GTech3D', 8, 'Pertenece a un segmento comprador de CNC/laser.')
  }

  if (machine.priceARS >= 30000000 && (size === 'industrial' || size === 'gran-industria')) {
    push('ticket', 'Capacidad para ticket alto', 7, `Puede justificar una inversion de ${machine.ticketRange}.`)
  } else if (machine.priceARS < 15000000) {
    push('ticket', 'Ticket abordable', 5, `La inversion estimada es ${machine.ticketRange}.`)
  } else {
    push('ticket', 'Ticket consultivo', 4, `Requiere calificar financiacion para ${machine.ticketRange}.`)
  }

  const raw = f.reduce((sum, x) => sum + x.points, 0)
  const score = Math.max(0, Math.min(100, Math.round(raw)))
  const level = levelFromScore(score)

  return {
    score,
    level,
    digitalPresence: presence,
    factors: f.sort((a, b) => b.points - a.points),
    headline: `${machine.name}: oportunidad ${level} (${score}/100) para ${category.toLowerCase()}.`,
  }
}

const SIZE_LABEL: Record<CompanySize, string> = {
  micro: 'micro / taller chico',
  pyme: 'PyME industrial',
  industrial: 'empresa industrial',
  'gran-industria': 'gran industria',
}

const MATURITY_LABEL: Record<IndustrialMaturity, string> = {
  artesanal: 'artesanal',
  'semi-industrial': 'semi-industrial',
  industrial: 'industrial',
  'alta-produccion': 'alta produccion',
}
