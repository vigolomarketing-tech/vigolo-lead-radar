// =====================================================================
// Análisis de contexto: compara una empresa con otras del mismo rubro y
// ciudad para dimensionar su tamaño relativo y detectar si conviene
// abordarla antes de que un competidor incorpore la máquina.
// =====================================================================

import { FIT_ORDER } from '../config/machines'
import type { Lead } from '../types'

export interface CompetitionInsight {
  peers: number
  reviewsRank: number
  activityBetterThan: number // % de la competencia con menos actividad
  bestReviews?: Lead
  topFit?: Lead
  summary: string
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
  const byFit = [...group].sort(
    (a, b) => FIT_ORDER[b.machineFit] - FIT_ORDER[a.machineFit] || b.score - a.score,
  )
  const reviewsRank = byReviews.findIndex((l) => l.id === lead.id) + 1
  const myReviews = lead.signals.reviewsCount ?? 0
  const worse = peers.filter((l) => (l.signals.reviewsCount ?? 0) < myReviews).length
  const activityBetterThan = Math.round((worse / peers.length) * 100)

  const topFit = byFit[0]
  const bestReviews = byReviews[0]

  const summary = `Entre ${peers.length + 1} ${lead.category.toLowerCase()} de ${lead.city}, ${lead.name} está #${reviewsRank} en actividad y supera al ${activityBetterThan}% de sus pares. ${
    lead.machineFit === 'ideal' || lead.machineFit === 'alto'
      ? 'Es un mercado donde la máquina genera ventaja competitiva directa: conviene abordarlo antes que la competencia.'
      : 'Vale la pena calificar su volumen de producción antes de avanzar.'
  }`

  return {
    peers: peers.length,
    reviewsRank,
    activityBetterThan,
    bestReviews: bestReviews.id !== lead.id ? bestReviews : undefined,
    topFit: topFit.id !== lead.id ? topFit : undefined,
    summary,
  }
}
