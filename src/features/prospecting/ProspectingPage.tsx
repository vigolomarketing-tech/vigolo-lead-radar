import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Field, Input, Select, EmptyState } from '../../components/ui/primitives'
import { ExportMenu } from '../../components/leads/ExportMenu'
import { VirtualLeadGrid } from '../../components/leads/VirtualLeadGrid'
import { SearchFilters } from './SearchFilters'
import { useFilteredLeads, useCategories, useProvinces } from '../../hooks/useFilteredLeads'
import { useLeadStore } from '../../store/useLeadStore'
import { CRM_STAGE_LABEL, CRM_STAGE_ORDER, OPPORTUNITY_LABEL } from '../../lib/labels'
import type { CrmStage, OpportunityLevel, Priority } from '../../types'

export function ProspectingPage() {
  const filtered = useFilteredLeads()
  const categories = useCategories()
  const provinces = useProvinces()
  const { filters, setFilters, resetFilters } = useLeadStore()
  const [feedback, setFeedback] = useState<string | null>(null)

  return (
    <AppShell title="Prospección" subtitle="Encontrá negocios en toda Argentina">
      <SearchFilters
        onDone={(n) =>
          setFeedback(n > 0 ? `Se encontraron ${n} negocios.` : 'Sin resultados con esos criterios.')
        }
      />
      {feedback && (
        <p className="rounded-lg bg-electric-500/10 px-3 py-2 text-xs text-electric-200 ring-1 ring-inset ring-electric-400/20">
          {feedback}
        </p>
      )}

      {/* Filtros avanzados */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Buscar por nombre">
              <Input value={filters.query} onChange={(e) => setFilters({ query: e.target.value })} placeholder="Nombre…" />
            </Field>
            <Field label="Provincia">
              <Select value={filters.province} onChange={(e) => setFilters({ province: e.target.value })}>
                <option value="">Todas</option>
                {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Rubro">
              <Select value={filters.category} onChange={(e) => setFilters({ category: e.target.value })}>
                <option value="">Todos</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Oportunidad">
              <Select value={filters.opportunity} onChange={(e) => setFilters({ opportunity: e.target.value as OpportunityLevel | '' })}>
                <option value="">Todas</option>
                {(['alta', 'media', 'baja'] as const).map((o) => <option key={o} value={o}>{OPPORTUNITY_LABEL[o]}</option>)}
              </Select>
            </Field>
            <Field label="Estado / Prioridad">
              <div className="flex gap-1.5">
                <Select value={filters.stage} onChange={(e) => setFilters({ stage: e.target.value as CrmStage | '' })}>
                  <option value="">Estado</option>
                  {CRM_STAGE_ORDER.map((s) => <option key={s} value={s}>{CRM_STAGE_LABEL[s]}</option>)}
                </Select>
                <Select value={filters.priority} onChange={(e) => setFilters({ priority: e.target.value as Priority | '' })}>
                  <option value="">Prior.</option>
                  {(['alta', 'media', 'baja'] as const).map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-slate-200">Limpiar</button>
            <ExportMenu leads={filtered} />
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-400">{filtered.length} negocios</p>

      {filtered.length === 0 ? (
        <EmptyState title="Sin resultados" subtitle="Ajustá los filtros o hacé un nuevo sondeo." />
      ) : (
        <VirtualLeadGrid leads={filtered} />
      )}
    </AppShell>
  )
}
