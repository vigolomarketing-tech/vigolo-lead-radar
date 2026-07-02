// =====================================================================
// Estado global de leads (Context + useReducer)
// ---------------------------------------------------------------------
// Fuente unica de verdad para: lista de leads, filtros, lead seleccionado
// y estado de busqueda. Persiste en localStorage (ver lib/storage.ts).
// =====================================================================

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_LEADS } from '../data/mockLeads'
import { loadLeads, saveLeads } from '../lib/storage'
import { opportunityLevel } from '../lib/scoring'
import { searchBusinesses } from '../services/placesService'
import type {
  CrmStatus,
  DashboardStats,
  Lead,
  LeadFiltersState,
  SearchParams,
} from '../types'

const EMPTY_FILTERS: LeadFiltersState = {
  query: '',
  category: '',
  zone: '',
  opportunity: '',
  status: '',
}

// --- Reducer de leads ---
type LeadsAction =
  | { type: 'set'; leads: Lead[] }
  | { type: 'upsertMany'; leads: Lead[] }
  | { type: 'update'; id: string; patch: Partial<Lead> }
  | { type: 'remove'; id: string }

function leadsReducer(state: Lead[], action: LeadsAction): Lead[] {
  switch (action.type) {
    case 'set':
      return action.leads
    case 'upsertMany': {
      const map = new Map(state.map((l) => [l.id, l]))
      for (const lead of action.leads) {
        // Si ya existe, preservamos los campos de CRM ya cargados.
        const existing = map.get(lead.id)
        map.set(lead.id, existing ? { ...lead, ...pickCrm(existing) } : lead)
      }
      return Array.from(map.values())
    }
    case 'update':
      return state.map((l) =>
        l.id === action.id ? { ...l, ...action.patch } : l,
      )
    case 'remove':
      return state.filter((l) => l.id !== action.id)
    default:
      return state
  }
}

/** Campos de CRM que no deben pisarse al re-importar un negocio. */
function pickCrm(lead: Lead): Partial<Lead> {
  return {
    crmStatus: lead.crmStatus,
    notes: lead.notes,
    lastContactDate: lead.lastContactDate,
    nextFollowUpDate: lead.nextFollowUpDate,
  }
}

interface LeadsContextValue {
  leads: Lead[]
  filteredLeads: Lead[]
  filters: LeadFiltersState
  setFilters: (patch: Partial<LeadFiltersState>) => void
  resetFilters: () => void
  stats: DashboardStats
  categories: string[]
  zones: string[]
  selectedId: string | null
  selectedLead: Lead | null
  selectLead: (id: string | null) => void
  updateLead: (id: string, patch: Partial<Lead>) => void
  setCrmStatus: (id: string, status: CrmStatus) => void
  removeLead: (id: string) => void
  runSearch: (params: SearchParams) => Promise<number>
  isSearching: boolean
  searchError: string | null
  lastSearch: SearchParams | null
}

const LeadsContext = createContext<LeadsContextValue | null>(null)

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, dispatch] = useReducer(
    leadsReducer,
    null,
    () => loadLeads() ?? MOCK_LEADS,
  )
  const [filters, setFiltersState] = useState<LeadFiltersState>(EMPTY_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [lastSearch, setLastSearch] = useState<SearchParams | null>(null)

  // Persistencia
  useEffect(() => {
    saveLeads(leads)
  }, [leads])

  const setFilters = (patch: Partial<LeadFiltersState>) =>
    setFiltersState((prev) => ({ ...prev, ...patch }))

  const resetFilters = () => setFiltersState(EMPTY_FILTERS)

  const categories = useMemo(
    () => Array.from(new Set(leads.map((l) => l.category))).sort(),
    [leads],
  )
  const zones = useMemo(
    () => Array.from(new Set(leads.map((l) => l.zone))).sort(),
    [leads],
  )

  const filteredLeads = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    return leads
      .filter((lead) => {
        if (q && !lead.name.toLowerCase().includes(q)) return false
        if (filters.category && lead.category !== filters.category) return false
        if (filters.zone && lead.zone !== filters.zone) return false
        if (
          filters.opportunity &&
          opportunityLevel(lead.score) !== filters.opportunity
        )
          return false
        if (filters.status && lead.crmStatus !== filters.status) return false
        return true
      })
      .sort((a, b) => b.score - a.score)
  }, [leads, filters])

  const stats = useMemo<DashboardStats>(() => {
    return {
      total: leads.length,
      highOpportunity: leads.filter((l) => opportunityLevel(l.score) === 'alta')
        .length,
      contacted: leads.filter((l) =>
        ['contactado', 'respondio', 'interesado', 'reunion', 'cerrado'].includes(
          l.crmStatus,
        ),
      ).length,
      interested: leads.filter((l) =>
        ['interesado', 'reunion'].includes(l.crmStatus),
      ).length,
      closed: leads.filter((l) => l.crmStatus === 'cerrado').length,
    }
  }, [leads])

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId],
  )

  const updateLead = (id: string, patch: Partial<Lead>) =>
    dispatch({ type: 'update', id, patch })

  const setCrmStatus = (id: string, status: CrmStatus) =>
    dispatch({ type: 'update', id, patch: { crmStatus: status } })

  const removeLead = (id: string) => {
    dispatch({ type: 'remove', id })
    setSelectedId((cur) => (cur === id ? null : cur))
  }

  /** Ejecuta un sondeo y agrega los resultados sin pisar el CRM existente. */
  const runSearch = async (params: SearchParams): Promise<number> => {
    setIsSearching(true)
    setSearchError(null)
    try {
      const results = await searchBusinesses(params)
      dispatch({ type: 'upsertMany', leads: results })
      setLastSearch(params)
      return results.length
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : 'Error desconocido en la busqueda.',
      )
      return 0
    } finally {
      setIsSearching(false)
    }
  }

  const value: LeadsContextValue = {
    leads,
    filteredLeads,
    filters,
    setFilters,
    resetFilters,
    stats,
    categories,
    zones,
    selectedId,
    selectedLead,
    selectLead: setSelectedId,
    updateLead,
    setCrmStatus,
    removeLead,
    runSearch,
    isSearching,
    searchError,
    lastSearch,
  }

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLeads(): LeadsContextValue {
  const ctx = useContext(LeadsContext)
  if (!ctx) throw new Error('useLeads debe usarse dentro de <LeadsProvider>')
  return ctx
}
