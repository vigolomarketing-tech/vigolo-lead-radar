// =====================================================================
// Análisis de competencia: compara un negocio con otros del mismo rubro
// y ciudad para ubicar dónde está parado y por qué conviene mejorar.
// =====================================================================

import type { Lead } from '../types'

export interface CompetitionInsight {
  peers: number
  reviewsRank: number
  webBetterThan: number // % de la competencia con peor web
  bestReviews?: Lead
  bestWeb?: Lead
  summary: string
}

const PRESENCE_RANK: Record<string, number> = {
  'sin-web': 0,
  'web-vieja': 1,
  'web-aceptable': 2,
  'buen-potencial': 3,
}

export function analyzeCompetition(lead: Lead, all: Lead[]): CompetitionInsight | null {
  const peers = all.filter(
    (l) => l.id !== lead.id && l.city === lead.city && l.category === lead.category,
  )
  if (peers.length === 0) return null

  const group = [lead, ...peers]
  const byReviews = [...group].sort(
    (a, b) => (b.signals.reviewsCount ?? 0) - (a.signals.reviewsCount ?? 0),
  )
  const byWeb = [...group].sort(
    (a, b) => PRESENCE_RANK[b.digitalPresence] - PRESENCE_RANK[a.digitalPresence],
  )
  const reviewsRank = byReviews.findIndex((l) => l.id === lead.id) + 1
  const myWeb = PRESENCE_RANK[lead.digitalPresence]
  const worseWeb = peers.filter((l) => PRESENCE_RANK[l.digitalPresence] < myWeb).length
  const webBetterThan = Math.round((worseWeb / peers.length) * 100)

  const bestWeb = byWeb[0]
  const bestReviews = byReviews[0]

  const summary =
    lead.digitalPresence === 'sin-web'
      ? `Entre ${peers.length + 1} ${lead.category.toLowerCase()} de ${lead.city}, ${lead.name} está #${reviewsRank} en reseñas pero SIN web, mientras ${bestWeb.id !== lead.id ? bestWeb.name : 'la competencia'} ya tiene presencia web. Una web lo pondría por delante.`
      : `${lead.name} compite con ${peers.length} negocios similares en ${lead.city}. Está #${reviewsRank} en reseñas y su web supera al ${webBetterThan}% de la competencia. Hay margen para liderar.`

  return {
    peers: peers.length,
    reviewsRank,
    webBetterThan,
    bestReviews: bestReviews.id !== lead.id ? bestReviews : undefined,
    bestWeb: bestWeb.id !== lead.id ? bestWeb : undefined,
    summary,
  }
}
