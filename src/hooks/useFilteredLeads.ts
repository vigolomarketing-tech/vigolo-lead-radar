import { useMemo } from 'react'
import { useLeadStore } from '../store/useLeadStore'
import { levelFromScore } from '../lib/scoring'
import type { Lead } from '../types'

export function useFilteredLeads(): Lead[] {
  const leads = useLeadStore((s) => s.leads)
  const filters = useLeadStore((s) => s.filters)

  return useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    return leads
      .filter((l) => {
        if (q && !l.name.toLowerCase().includes(q)) return false
        if (filters.category && l.category !== filters.category) return false
        if (filters.province && l.province !== filters.province) return false
        if (filters.city && l.city !== filters.city) return false
        if (filters.zone && l.zone !== filters.zone) return false
        if (filters.opportunity && levelFromScore(l.score) !== filters.opportunity)
          return false
        if (filters.urgency && l.urgency.level !== filters.urgency) return false
        if (filters.stage && l.stage !== filters.stage) return false
        if (filters.priority && l.priority !== filters.priority) return false
        return true
      })
      .sort((a, b) => b.score - a.score)
  }, [leads, filters])
}

export function useProvinces(): string[] {
  const leads = useLeadStore((s) => s.leads)
  return useMemo(
    () => Array.from(new Set(leads.map((l) => l.province))).sort(),
    [leads],
  )
}

export function useCategories(): string[] {
  const leads = useLeadStore((s) => s.leads)
  return useMemo(
    () => Array.from(new Set(leads.map((l) => l.category))).sort(),
    [leads],
  )
}

export function useZones(): string[] {
  const leads = useLeadStore((s) => s.leads)
  return useMemo(
    () => Array.from(new Set(leads.map((l) => l.zone))).sort(),
    [leads],
  )
}
