import { useLeads } from '../../context/LeadsContext'
import { Button } from '../ui/Button'
import { downloadLeadsCsv } from '../../lib/csv'
import { CRM_STATUS_LABEL, CRM_STATUS_ORDER, OPPORTUNITY_LABEL } from '../../lib/labels'
import type { CrmStatus, OpportunityLevel } from '../../types'

const OPPORTUNITY_OPTIONS: OpportunityLevel[] = ['alta', 'media', 'baja']

/** Barra de filtros + buscador + exportacion CSV. */
export function LeadFilters() {
  const {
    filters,
    setFilters,
    resetFilters,
    categories,
    zones,
    filteredLeads,
  } = useLeads()

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    filters.zone ||
    filters.opportunity ||
    filters.status

  return (
    <div className="rounded-2xl border border-white/10 bg-base-900/70 p-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Buscador por nombre */}
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className={labelClass}>Buscar negocio</span>
            <input
              value={filters.query}
              onChange={(e) => setFilters({ query: e.target.value })}
              placeholder="Nombre..."
              className={inputClass}
            />
          </label>

          <Select
            label="Rubro"
            value={filters.category}
            onChange={(v) => setFilters({ category: v })}
            options={categories.map((c) => ({ value: c, label: c }))}
            allLabel="Todos los rubros"
          />
          <Select
            label="Zona"
            value={filters.zone}
            onChange={(v) => setFilters({ zone: v })}
            options={zones.map((z) => ({ value: z, label: z }))}
            allLabel="Todas las zonas"
          />
          <Select
            label="Oportunidad"
            value={filters.opportunity}
            onChange={(v) =>
              setFilters({ opportunity: v as OpportunityLevel | '' })
            }
            options={OPPORTUNITY_OPTIONS.map((o) => ({
              value: o,
              label: OPPORTUNITY_LABEL[o],
            }))}
            allLabel="Toda oportunidad"
          />
          <Select
            label="Estado CRM"
            value={filters.status}
            onChange={(v) => setFilters({ status: v as CrmStatus | '' })}
            options={CRM_STATUS_ORDER.map((s) => ({
              value: s,
              label: CRM_STATUS_LABEL[s],
            }))}
            allLabel="Todos los estados"
          />
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Limpiar
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadLeadsCsv(filteredLeads)}
            disabled={filteredLeads.length === 0}
            title="Exportar los leads visibles a CSV"
          >
            ↓ Exportar CSV
          </Button>
        </div>
      </div>
    </div>
  )
}

const labelClass = 'mb-1 block text-xs font-medium text-slate-400'
const inputClass =
  'w-full rounded-lg border border-white/10 bg-base-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-electric-400/60 focus:outline-none focus:ring-2 focus:ring-electric-400/30'

function Select({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  allLabel: string
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} cursor-pointer`}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
