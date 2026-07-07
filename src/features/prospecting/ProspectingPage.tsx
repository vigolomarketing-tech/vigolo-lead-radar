import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { ExportMenu } from '../../components/leads/ExportMenu'
import { EmptyState, Field, Input, Select } from '../../components/ui/primitives'
import { VirtualLeadGrid } from '../../components/leads/VirtualLeadGrid'
import { useCategories, useCities, useFilteredLeads, useMachines, useProvinces } from '../../hooks/useFilteredLeads'
import { CRM_STAGE_LABEL, CRM_STAGE_ORDER, OPPORTUNITY_LABEL } from '../../lib/labels'
import { useLeadStore } from '../../store/useLeadStore'
import { SearchFilters } from './SearchFilters'
import type { CrmStage, OpportunityLevel, Priority } from '../../types'

export function ProspectingPage() {
  const filtered = useFilteredLeads()
  const categories = useCategories()
  const cities = useCities()
  const machines = useMachines()
  const provinces = useProvinces()
  const { filters, setFilters, resetFilters } = useLeadStore()
  const [feedback, setFeedback] = useState<string | null>(null)

  return (
    <AppShell title="Prospeccion" subtitle="Encontrar empresas argentinas con probabilidad de comprar maquinas 2GTech3D">
      <SearchFilters
        onDone={(n) =>
          setFeedback(n > 0 ? `Se encontraron ${n} oportunidades.` : 'Sin resultados con esos criterios.')
        }
      />
      {feedback && (
        <p className="rounded-lg bg-electric-500/10 px-3 py-2 text-xs text-electric-200 ring-1 ring-inset ring-electric-400/20">
          {feedback}
        </p>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <Field label="Buscar">
              <Input value={filters.query} onChange={(e) => setFilters({ query: e.target.value })} placeholder="Empresa, rubro, maquina..." />
            </Field>
            <Field label="Provincia">
              <Select value={filters.province} onChange={(e) => setFilters({ province: e.target.value })}>
                <option value="">Todas</option>
                {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Ciudad">
              <Select value={filters.city} onChange={(e) => setFilters({ city: e.target.value })}>
                <option value="">Todas</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Industria">
              <Select value={filters.category} onChange={(e) => setFilters({ category: e.target.value })}>
                <option value="">Todas</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Maquina">
              <Select value={filters.recommendedMachine} onChange={(e) => setFilters({ recommendedMachine: e.target.value })}>
                <option value="">Todas</option>
                {machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </Field>
            <Field label="Oportunidad">
              <Select value={filters.opportunity} onChange={(e) => setFilters({ opportunity: e.target.value as OpportunityLevel | '' })}>
                <option value="">Todas</option>
                {(['alta', 'media', 'baja'] as const).map((o) => <option key={o} value={o}>{OPPORTUNITY_LABEL[o]}</option>)}
              </Select>
            </Field>
            <Field label={`Score ${filters.minScore || 0}+`}>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={filters.minScore}
                onChange={(e) => setFilters({ minScore: Number(e.target.value) })}
                className="w-full accent-electric-400"
              />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filters.stage} onChange={(e) => setFilters({ stage: e.target.value as CrmStage | '' })}>
              <option value="">Estado</option>
              {CRM_STAGE_ORDER.map((s) => <option key={s} value={s}>{CRM_STAGE_LABEL[s]}</option>)}
            </Select>
            <Select value={filters.priority} onChange={(e) => setFilters({ priority: e.target.value as Priority | '' })}>
              <option value="">Prioridad</option>
              {(['alta', 'media', 'baja'] as const).map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-slate-200">Limpiar</button>
            <ExportMenu leads={filtered} />
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-400">{filtered.length} oportunidades industriales</p>

      {filtered.length === 0 ? (
        <EmptyState title="Sin resultados" subtitle="Ajusta los filtros o hace un nuevo sondeo industrial." />
      ) : (
        <VirtualLeadGrid leads={filtered} />
      )}
    </AppShell>
  )
}
