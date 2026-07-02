// =====================================================================
// Motor de Score Inteligente (v2)
// ---------------------------------------------------------------------
// Algoritmo ponderado sobre ~20 factores. Un puntaje ALTO = mejor
// oportunidad comercial para venderle a ese negocio (web, automatización,
// marketing, posicionamiento). Devuelve el desglose factor por factor.
// =====================================================================

import type {
  BusinessSignals,
  DigitalPresence,
  OpportunityLevel,
  ScoreFactor,
  ScoreResult,
} from '../types'

const HIGH_INTENT = [
  'barberia', 'peluqueria', 'gimnasio', 'estetica', 'spa', 'restaurante',
  'cafeteria', 'bar', 'inmobiliaria', 'electricista', 'plomero', 'ferreteria',
  'odontologia', 'consultorio', 'abogado', 'contador', 'veterinaria',
  'inmobiliario', 'turismo', 'hotel', 'indumentaria', 'automotor',
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function isHighIntentCategory(category: string): boolean {
  const c = normalize(category)
  return HIGH_INTENT.some((k) => c.includes(k))
}

export function computeDigitalPresence(s: BusinessSignals): DigitalPresence {
  if (!s.website || !s.website.trim()) return 'sin-web'
  if (s.websiteQuality === 'vieja') return 'web-vieja'
  if (s.websiteQuality === 'aceptable') return 'web-aceptable'
  return 'buen-potencial'
}

export function levelFromScore(score: number): OpportunityLevel {
  if (score >= 70) return 'alta'
  if (score >= 45) return 'media'
  return 'baja'
}

/**
 * Calcula el score de oportunidad. `presenceWeight` alto cuando el negocio
 * tiene tracción (reseñas/rating/redes) pero mala/nula presencia web.
 */
export function computeScore(
  signals: BusinessSignals,
  category: string,
): ScoreResult {
  const presence = computeDigitalPresence(signals)
  const f: ScoreFactor[] = []
  const push = (key: string, label: string, points: number, detail: string) =>
    f.push({ key, label, points, detail })

  const hasWeb = presence !== 'sin-web'
  const reviews = signals.reviewsCount ?? 0
  const rating = signals.rating ?? 0

  // 1) Presencia web (driver principal)
  switch (presence) {
    case 'sin-web':
      push('web', 'Sin sitio web', 34, 'No tiene web: máxima oportunidad de venta.')
      break
    case 'web-vieja':
      push('web', 'Web vieja', 26, 'Web desactualizada / poco profesional.')
      break
    case 'web-aceptable':
      push('web', 'Web aceptable', 10, 'Web correcta pero mejorable.')
      break
    case 'buen-potencial':
      push('web', 'Buena web', 2, 'Ya tiene buena presencia web.')
      break
  }

  // 2) Tracción de negocio (reseñas) — demanda real que hoy no capitaliza
  if (reviews >= 100) push('reviews', 'Mucha tracción', 12, `${reviews} reseñas en Google.`)
  else if (reviews >= 40) push('reviews', 'Buena tracción', 9, `${reviews} reseñas en Google.`)
  else if (reviews >= 12) push('reviews', 'Tracción media', 5, `${reviews} reseñas en Google.`)
  else push('reviews', 'Poca tracción', 1, 'Pocas reseñas en Google.')

  // 3) Reputación (rating alto = negocio que "convierte" si le das canal)
  if (rating >= 4.5) push('rating', 'Excelente reputación', 8, `Rating ${rating.toFixed(1)}★: le sobra demanda.`)
  else if (rating >= 4.0) push('rating', 'Buena reputación', 5, `Rating ${rating.toFixed(1)}★.`)
  else if (rating > 0) push('rating', 'Reputación media', 2, `Rating ${rating.toFixed(1)}★.`)

  // 4) Instagram activo sin web = señal caliente
  const hasIg = Boolean(signals.instagram)
  if (hasIg && signals.hasActiveInstagram && !hasWeb)
    push('ig', 'Instagram activo, sin web', 12, 'Invierte en redes pero no tiene dónde convertir.')
  else if (hasIg && !hasWeb)
    push('ig', 'Instagram sin web', 7, 'Tiene Instagram pero no web.')
  else if (hasIg && signals.hasActiveInstagram)
    push('ig', 'Instagram activo', 3, 'Marca activa en redes.')

  // 5) Facebook / LinkedIn (presencia social adicional)
  if (signals.facebook && !hasWeb)
    push('fb', 'Facebook sin web', 4, 'Presencia en Facebook sin sitio propio.')

  // 6) WhatsApp disponible = canal directo para vender la solución
  if (signals.whatsapp) push('wsp', 'Tiene WhatsApp', 4, 'Canal directo para prospectar.')
  else if (signals.phone) push('phone', 'Tiene teléfono', 2, 'Se puede contactar por teléfono.')

  // 7) Verificado en Google (negocio establecido)
  if (signals.verified) push('verified', 'Negocio verificado', 3, 'Perfil de Google verificado.')

  // 8) Rubro de alta intención (una web se traduce en consultas)
  if (isHighIntentCategory(category))
    push('rubro', 'Rubro de alta conversión', 8, 'Una web genera consultas directas por WhatsApp.')

  // 9) HTTPS / dominio (penaliza si tiene web sin https)
  if (hasWeb && signals.website && !signals.website.startsWith('https'))
    push('https', 'Web sin HTTPS', 3, 'Sitio inseguro (sin candado): urge migrar.')

  const raw = f.reduce((sum, x) => sum + x.points, 0)
  const score = Math.max(1, Math.min(100, Math.round(30 + raw)))
  const level = levelFromScore(score)

  const headline =
    presence === 'sin-web'
      ? `Sin web con ${reviews} reseñas: oportunidad ${level}.`
      : presence === 'web-vieja'
        ? `Web desactualizada y ${reviews} reseñas: oportunidad ${level}.`
        : `Presencia digital ${DIGITAL_LABEL[presence]}: oportunidad ${level}.`

  return {
    score,
    level,
    digitalPresence: presence,
    factors: f.sort((a, b) => b.points - a.points),
    headline,
  }
}

const DIGITAL_LABEL: Record<DigitalPresence, string> = {
  'sin-web': 'inexistente',
  'web-vieja': 'vieja',
  'web-aceptable': 'aceptable',
  'buen-potencial': 'buena',
}
