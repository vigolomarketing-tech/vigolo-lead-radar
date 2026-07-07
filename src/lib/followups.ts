// =====================================================================
// Seguimiento IA: decide a quién contactar hoy, con qué mensaje y por qué.
// =====================================================================

import type { Lead, MessageChannel } from '../types'

export interface FollowUpSuggestion {
  lead: Lead
  reason: string
  channel: MessageChannel
  responseProbability: number // 0..100
  overdue: boolean
}

function daysSince(iso?: string): number {
  if (!iso) return Infinity
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

const STAGE_CHANNEL: Partial<Record<Lead['stage'], MessageChannel>> = {
  nuevo: 'whatsapp',
  contactado: 'seguimiento-1',
  respondio: 'quiere-reunion',
  interesado: 'seguimiento-2',
  reunion: 'seguimiento-2',
  propuesta: 'seguimiento-3',
}

/** Genera sugerencias de seguimiento ordenadas por prioridad. */
export function suggestFollowUps(leads: Lead[], limit = 8): FollowUpSuggestion[] {
  const today = new Date().toISOString().slice(0, 10)
  const out: FollowUpSuggestion[] = []

  for (const lead of leads) {
    if (lead.stage === 'ganado' || lead.stage === 'perdido') continue

    const overdue = Boolean(lead.nextFollowUpDate && lead.nextFollowUpDate <= today)
    const since = daysSince(lead.lastContactDate)
    const stale = lead.stage !== 'nuevo' && since >= 3

    let reason = ''
    if (overdue) reason = `Seguimiento programado para hoy o vencido.`
    else if (lead.stage === 'nuevo' && lead.score >= 72)
      reason = `${lead.recommendedMachineName}: oportunidad alta sin contactar (score ${lead.score}).`
    else if (stale) reason = `Sin contacto hace ${since} dias en estado "${lead.stage}".`
    else continue

    const channel = STAGE_CHANNEL[lead.stage] ?? 'whatsapp'
    const responseProbability = Math.min(
      95,
      Math.round(lead.closeProbability * 0.6 + (overdue ? 20 : 10) + (lead.signals.whatsapp ? 10 : 0)),
    )
    out.push({ lead, reason, channel, responseProbability, overdue })
  }

  return out
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || b.responseProbability - a.responseProbability)
    .slice(0, limit)
}
