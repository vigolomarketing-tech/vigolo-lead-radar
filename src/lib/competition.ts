// =====================================================================
// Analisis competitivo industrial: compara empresas del mismo rubro/ciudad
// por encaje con maquinas 2GTech3D, ticket y urgencia comercial.
// =====================================================================

import type { Lead } from '../types'

export interface CompetitionInsight {
  peers: number
  scoreRank: number
  fitBetterThan: number
  bestScore?: Lead
  bestFit?: Lead
  summary: string
}

function fitValue(lead: Lead): number {
  const machinePriority = { critica: 20, alta: 15, media: 10, baja: 4 }[lead.recommendedMachinePriority]
  return lead.score + machinePriority + Math.min(15, Math.round(lead.potentialValue / 5000000))
}

export function analyzeCompetition(lead: Lead, all: Lead[]): CompetitionInsight | null {
  const peers = all.filter(
    (l) => l.id !== lead.id && l.city === lead.city && l.category === lead.category,
  )
  if (peers.length === 0) return null

  const group = [lead, ...peers]
  const byScore = [...group].sort((a, b) => b.score - a.score)
  const byFit = [...group].sort((a, b) => fitValue(b) - fitValue(a))
  const scoreRank = byScore.findIndex((l) => l.id === lead.id) + 1
  const myFit = fitValue(lead)
  const worseFit = peers.filter((l) => fitValue(l) < myFit).length
  const fitBetterThan = Math.round((worseFit / peers.length) * 100)

  const bestScore = byScore[0]
  const bestFit = byFit[0]

  const summary =
    scoreRank === 1
      ? `${lead.name} lidera el segmento ${lead.category.toLowerCase()} en ${lead.city}: score ${lead.score}, maquina recomendada ${lead.recommendedMachineName} y ticket ${lead.ticketRange}.`
      : `${lead.name} compite con ${peers.length} empresas similares en ${lead.city}. Esta #${scoreRank} por score y supera al ${fitBetterThan}% por encaje maquina/ticket.`

  return {
    peers: peers.length,
    scoreRank,
    fitBetterThan,
    bestScore: bestScore.id !== lead.id ? bestScore : undefined,
    bestFit: bestFit.id !== lead.id ? bestFit : undefined,
    summary,
  }
}
