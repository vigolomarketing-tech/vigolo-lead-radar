// =====================================================================
// Motor de puntaje de oportunidad
// ---------------------------------------------------------------------
// Traduce las senales de un negocio (web, instagram, resenas, rubro)
// en: presencia digital + puntaje 1-100 + motivo legible.
//
// Criterios (segun brief comercial de Vigolo):
//   - Sin pagina web                          => oportunidad ALTA
//   - Web vieja / poco profesional            => oportunidad ALTA
//   - Instagram activo pero sin web           => oportunidad ALTA
//   - Muchas resenas en Google pero sin web   => oportunidad ALTA
//   - Rubros donde una web genera consultas
//     por WhatsApp                            => oportunidad ALTA
// =====================================================================

import type { DigitalPresence, OpportunityLevel } from '../types'

/** Senales crudas que alimentan el scoring. */
export interface ScoringInput {
  category: string
  website?: string
  /**
   * Pista de calidad de la web cuando existe. La API real puede inferirla
   * (Lighthouse, mobile-friendly, etc.). En mock viene precargada.
   */
  websiteQuality?: 'vieja' | 'aceptable'
  instagram?: string
  hasActiveInstagram?: boolean
  reviewsCount?: number
  rating?: number
}

export interface ScoringResult {
  digitalPresence: DigitalPresence
  score: number
  scoreReason: string
}

/**
 * Rubros donde una web profesional suele traducirse directo en consultas
 * por WhatsApp / turnos. Suman prioridad comercial.
 */
const HIGH_INTENT_CATEGORIES = [
  'barberia',
  'barberias',
  'peluqueria',
  'peluquerias',
  'gimnasio',
  'gimnasios',
  'estetica',
  'esteticas',
  'restaurante',
  'restaurantes',
  'cafeteria',
  'cafeterias',
  'inmobiliaria',
  'inmobiliarias',
  'electricista',
  'electricistas',
  'ferreteria',
  'ferreterias',
  'odontologia',
  'consultorio',
  'estudio juridico',
  'estudio contable',
]

const REVIEWS_MANY = 40 // umbral de "muchas resenas"
const REVIEWS_SOME = 12

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // saca acentos
    .trim()
}

function isHighIntentCategory(category: string): boolean {
  const c = normalize(category)
  return HIGH_INTENT_CATEGORIES.some((k) => c.includes(normalize(k)))
}

/** Determina el estado de presencia digital a partir de las senales. */
export function computeDigitalPresence(input: ScoringInput): DigitalPresence {
  const hasWebsite = Boolean(input.website && input.website.trim())
  if (!hasWebsite) return 'sin-web'
  if (input.websiteQuality === 'vieja') return 'web-vieja'
  if (input.websiteQuality === 'aceptable') return 'web-aceptable'
  return 'buen-potencial'
}

/**
 * Calcula puntaje (1-100) + motivo. Un puntaje mas alto = mejor oportunidad
 * comercial para vender una pagina web.
 */
export function computeScore(input: ScoringInput): ScoringResult {
  const presence = computeDigitalPresence(input)
  const reasons: string[] = []
  let score = 30 // piso base

  const hasWebsite = presence !== 'sin-web'
  const hasInstagram = Boolean(input.instagram && input.instagram.trim())
  const reviews = input.reviewsCount ?? 0

  // 1) Presencia web: el driver mas fuerte
  switch (presence) {
    case 'sin-web':
      score += 45
      reasons.push('No tiene pagina web')
      break
    case 'web-vieja':
      score += 32
      reasons.push('Tiene una web vieja o poco profesional')
      break
    case 'web-aceptable':
      score += 8
      reasons.push('Web aceptable, hay margen de mejora')
      break
    case 'buen-potencial':
      score += 2
      reasons.push('Ya tiene buena presencia web')
      break
  }

  // 2) Instagram activo pero sin web => senal caliente
  if (hasInstagram && input.hasActiveInstagram && !hasWebsite) {
    score += 15
    reasons.push('Instagram activo pero sin web')
  } else if (hasInstagram && !hasWebsite) {
    score += 8
    reasons.push('Tiene Instagram pero no web')
  }

  // 3) Google Business con muchas resenas pero sin web
  if (reviews >= REVIEWS_MANY && !hasWebsite) {
    score += 14
    reasons.push(`${reviews} resenas en Google y sin web`)
  } else if (reviews >= REVIEWS_SOME && !hasWebsite) {
    score += 8
    reasons.push(`${reviews} resenas en Google`)
  } else if (reviews >= REVIEWS_MANY) {
    score += 4
    reasons.push(`Negocio con traccion (${reviews} resenas)`)
  }

  // 4) Rubro de alta intencion (web => consultas por WhatsApp)
  if (isHighIntentCategory(input.category)) {
    score += 8
    reasons.push('Rubro ideal para captar consultas por WhatsApp')
  }

  // Clamp 1-100
  score = Math.max(1, Math.min(100, Math.round(score)))

  return {
    digitalPresence: presence,
    score,
    scoreReason: reasons.join('. ') + '.',
  }
}

/** Deriva el nivel de oportunidad desde el puntaje numerico. */
export function opportunityLevel(score: number): OpportunityLevel {
  if (score >= 70) return 'alta'
  if (score >= 45) return 'media'
  return 'baja'
}
