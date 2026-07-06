// =====================================================================
// Store global (zustand + persist en localStorage)
// Fuente única de verdad: leads, filtros, búsqueda, selección y CRM.
// =====================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_LEADS } from '../services/providers/mockData'
import { searchBusinesses } from '../services/providers/dataProvider'
import { aiAnalyze } from '../services/ai/aiProvider'
import { uid } from '../lib/id'
import { levelFromScore } from '../lib/scoring'
import { ARGENTINA } from '../config/argentina'
import type {
  CrmEvent,
  CrmStage,
  Lead,
  LeadFiltersState,
  Priority,
  Reminder,
  SearchParams,
  Task,
} from '../types'

const EMPTY_FILTERS: LeadFiltersState = {
  query: '',
  category: '',
  province: '',
  city: '',
  zone: '',
  opportunity: '',
  stage: '',
  priority: '',
}

/** Campos de CRM que no se pisan al re-importar un negocio existente. */
function keepCrm(l: Lead): Partial<Lead> {
  return {
    stage: l.stage,
    priority: l.priority,
    tags: l.tags,
    tasks: l.tasks,
    notes: l.notes,
    events: l.events,
    reminders: l.reminders,
    lastContactDate: l.lastContactDate,
    nextFollowUpDate: l.nextFollowUpDate,
    potentialValue: l.potentialValue,
    closeProbability: l.closeProbability,
    proposalSent: l.proposalSent,
    analysis: l.analysis,
  }
}

interface LeadState {
  leads: Lead[]
  filters: LeadFiltersState
  selectedId: string | null
  isSearching: boolean
  searchError: string | null
  lastSearch: SearchParams | null
  analyzingIds: string[]
  sweepProgress: { province: string; done: number; total: number } | null

  setFilters: (patch: Partial<LeadFiltersState>) => void
  resetFilters: () => void
  select: (id: string | null) => void

  runSearch: (params: SearchParams) => Promise<number>
  runNationwideSweep: (params: SearchParams) => Promise<number>
  analyze: (id: string) => Promise<void>

  updateLead: (id: string, patch: Partial<Lead>) => void
  setStage: (id: string, stage: CrmStage) => void
  setPriority: (id: string, priority: Priority) => void
  toggleTag: (id: string, tag: string) => void
  addTask: (id: string, text: string, dueDate?: string) => void
  toggleTask: (id: string, taskId: string) => void
  removeTask: (id: string, taskId: string) => void
  addNote: (id: string, text: string) => void
  addReminder: (id: string, date: string, text: string) => void
  toggleReminder: (id: string, reminderId: string) => void
  removeLead: (id: string) => void
  resetDemo: () => void
}

export const useLeadStore = create<LeadState>()(
  persist(
    (set, get) => ({
      leads: MOCK_LEADS,
      filters: EMPTY_FILTERS,
      selectedId: null,
      isSearching: false,
      searchError: null,
      lastSearch: null,
      analyzingIds: [],
      sweepProgress: null,

      setFilters: (patch) =>
        set((s) => ({ filters: { ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: EMPTY_FILTERS }),
      select: (id) => set({ selectedId: id }),

      runSearch: async (params) => {
        set({ isSearching: true, searchError: null })
        try {
          const results = await searchBusinesses(params)
          set((s) => {
            const map = new Map(s.leads.map((l) => [l.id, l]))
            for (const r of results) {
              const existing = map.get(r.id)
              map.set(r.id, existing ? { ...r, ...keepCrm(existing) } : r)
            }
            return { leads: Array.from(map.values()), lastSearch: params }
          })
          return results.length
        } catch (e) {
          set({ searchError: e instanceof Error ? e.message : 'Error de búsqueda.' })
          return 0
        } finally {
          set({ isSearching: false })
        }
      },

      /** Barrido "toda Argentina": recorre provincia por provincia. */
      runNationwideSweep: async (params) => {
        set({ isSearching: true, searchError: null })
        const provinces = ARGENTINA.map((p) => p.name)
        const acc = new Map<string, Lead>()
        try {
          for (let i = 0; i < provinces.length; i++) {
            const province = provinces[i]
            set({ sweepProgress: { province, done: i, total: provinces.length } })
            const results = await searchBusinesses({
              ...params,
              nationwide: false,
              province,
              city: '',
              query: '',
            })
            for (const r of results) acc.set(r.id, r)
          }
          set((s) => {
            const map = new Map(s.leads.map((l) => [l.id, l]))
            for (const r of acc.values()) {
              const existing = map.get(r.id)
              map.set(r.id, existing ? { ...r, ...keepCrm(existing) } : r)
            }
            return { leads: Array.from(map.values()), lastSearch: { ...params, nationwide: true } }
          })
          return acc.size
        } catch (e) {
          set({ searchError: e instanceof Error ? e.message : 'Error en el barrido nacional.' })
          return acc.size
        } finally {
          set({ isSearching: false, sweepProgress: null })
        }
      },

      analyze: async (id) => {
        const lead = get().leads.find((l) => l.id === id)
        if (!lead) return
        set((s) => ({ analyzingIds: [...s.analyzingIds, id] }))
        try {
          const report = await aiAnalyze(lead)
          set((s) => ({
            leads: s.leads.map((l) =>
              l.id === id
                ? {
                    ...l,
                    analysis: report,
                    events: [
                      { id: uid('ev'), at: new Date().toISOString(), type: 'sistema', text: 'Análisis IA generado' },
                      ...l.events,
                    ],
                  }
                : l,
            ),
          }))
        } finally {
          set((s) => ({ analyzingIds: s.analyzingIds.filter((x) => x !== id) }))
        }
      },

      updateLead: (id, patch) =>
        set((s) => ({
          leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),

      setStage: (id, stage) =>
        set((s) => ({
          leads: s.leads.map((l) => {
            if (l.id !== id || l.stage === stage) return l
            const ev: CrmEvent = {
              id: uid('ev'),
              at: new Date().toISOString(),
              type: 'estado',
              text: `Estado → ${stage}`,
            }
            const patch: Partial<Lead> = { stage, events: [ev, ...l.events] }
            if (stage === 'ganado') patch.closeProbability = 100
            if (stage === 'perdido') patch.closeProbability = 0
            if (stage === 'propuesta') patch.proposalSent = true
            if (['contactado', 'respondio', 'interesado', 'reunion'].includes(stage))
              patch.lastContactDate = new Date().toISOString().slice(0, 10)
            return { ...l, ...patch }
          }),
        })),

      setPriority: (id, priority) =>
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, priority } : l)) })),

      toggleTag: (id, tag) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  tags: l.tags.includes(tag)
                    ? l.tags.filter((t) => t !== tag)
                    : [...l.tags, tag],
                }
              : l,
          ),
        })),

      addTask: (id, text, dueDate) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? { ...l, tasks: [...l.tasks, { id: uid('task'), text, done: false, dueDate } as Task] }
              : l,
          ),
        })),

      toggleTask: (id, taskId) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? { ...l, tasks: l.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
              : l,
          ),
        })),

      removeTask: (id, taskId) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) } : l,
          ),
        })),

      addNote: (id, text) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  events: [
                    { id: uid('ev'), at: new Date().toISOString(), type: 'nota', text },
                    ...l.events,
                  ],
                }
              : l,
          ),
        })),

      addReminder: (id, date, text) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  nextFollowUpDate: date,
                  reminders: [
                    ...l.reminders,
                    { id: uid('rem'), date, text, done: false } as Reminder,
                  ],
                }
              : l,
          ),
        })),

      toggleReminder: (id, reminderId) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  reminders: l.reminders.map((r) =>
                    r.id === reminderId ? { ...r, done: !r.done } : r,
                  ),
                }
              : l,
          ),
        })),

      removeLead: (id) =>
        set((s) => ({
          leads: s.leads.filter((l) => l.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      resetDemo: () => set({ leads: MOCK_LEADS, filters: EMPTY_FILTERS, selectedId: null }),
    }),
    {
      name: 'vigolo-lead-radar:v3',
      partialize: (s) => ({ leads: s.leads }),
    },
  ),
)

/** Deriva el nivel de oportunidad (re-export util para la UI). */
export { levelFromScore }
