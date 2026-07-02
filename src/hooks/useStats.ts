import { useMemo } from 'react'
import { useLeadStore } from '../store/useLeadStore'
import { levelFromScore } from '../lib/scoring'
import type { DashboardStats, Lead } from '../types'

const CONTACTED_STAGES = ['contactado', 'respondio', 'interesado', 'reunion', 'propuesta', 'ganado']

function bestBy(leads: Lead[], key: 'zone' | 'category'): string {
  const map = new Map<string, { sum: number; n: number }>()
  for (const l of leads) {
    const k = l[key]
    const cur = map.get(k) ?? { sum: 0, n: 0 }
    cur.sum += l.score
    cur.n += 1
    map.set(k, cur)
  }
  let best = '—'
  let bestAvg = -1
  for (const [k, v] of map) {
    const avg = v.sum / v.n
    if (avg > bestAvg) {
      bestAvg = avg
      best = k
    }
  }
  return best
}

export function useStats(): DashboardStats {
  const leads = useLeadStore((s) => s.leads)
  return useMemo(() => {
    const total = leads.length
    const contacted = leads.filter((l) => CONTACTED_STAGES.includes(l.stage)).length
    const interested = leads.filter((l) => ['interesado', 'reunion', 'propuesta'].includes(l.stage)).length
    const won = leads.filter((l) => l.stage === 'ganado')
    const lost = leads.filter((l) => l.stage === 'perdido').length
    const responded = leads.filter((l) =>
      ['respondio', 'interesado', 'reunion', 'propuesta', 'ganado'].includes(l.stage),
    ).length
    return {
      total,
      analyzed: leads.filter((l) => l.analysis).length,
      highOpportunity: leads.filter((l) => levelFromScore(l.score) === 'alta').length,
      contacted,
      interested,
      won: won.length,
      lost,
      potentialRevenue: leads
        .filter((l) => l.stage !== 'perdido')
        .reduce((s, l) => s + l.potentialValue * (l.closeProbability / 100), 0),
      realRevenue: won.reduce((s, l) => s + l.potentialValue, 0),
      responseRate: contacted ? (responded / contacted) * 100 : 0,
      closeRate: contacted ? (won.length / contacted) * 100 : 0,
      bestZone: bestBy(leads, 'zone'),
      bestCategory: bestBy(leads, 'category'),
    }
  }, [leads])
}
