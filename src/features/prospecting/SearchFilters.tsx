import { useState } from 'react'
import { Button, Card, Field, Input, Select } from '../../components/ui/primitives'
import { Spinner } from '../../components/ui/primitives'
import { useLeadStore } from '../../store/useLeadStore'
import { activeDataProvider } from '../../services/providers/dataProvider'
import type { LocationKind, SearchParams } from '../../types'

const DEFAULTS: SearchParams = {
  query: '',
  locationKind: 'ciudad',
  category: '',
  radiusKm: 5,
  minRating: 0,
  minReviews: 0,
  openNow: false,
  hasWebsite: 'any',
  hasPhone: false,
  hasInstagram: false,
  verifiedOnly: false,
}

const LOCATION_KINDS: { value: LocationKind; label: string }[] = [
  { value: 'ciudad', label: 'Ciudad' },
  { value: 'barrio', label: 'Barrio' },
  { value: 'provincia', label: 'Provincia' },
  { value: 'pais', label: 'País' },
  { value: 'codigo-postal', label: 'Código postal' },
]

export function SearchFilters({ onDone }: { onDone?: (count: number) => void }) {
  const runSearch = useLeadStore((s) => s.runSearch)
  const isSearching = useLeadStore((s) => s.isSearching)
  const searchError = useLeadStore((s) => s.searchError)
  const [p, setP] = useState<SearchParams>(DEFAULTS)
  const set = (patch: Partial<SearchParams>) => setP((prev) => ({ ...prev, ...patch }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const n = await runSearch(p)
    onDone?.(n)
  }

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Ubicación">
            <Input placeholder="Longchamps, CABA, Buenos Aires…" value={p.query} onChange={(e) => set({ query: e.target.value })} />
          </Field>
          <Field label="Tipo">
            <Select value={p.locationKind} onChange={(e) => set({ locationKind: e.target.value as LocationKind })}>
              {LOCATION_KINDS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Rubro">
            <Input placeholder="barberías, gimnasios…" value={p.category} onChange={(e) => set({ category: e.target.value })} />
          </Field>
          <Field label={`Radio: ${p.radiusKm} km`}>
            <input type="range" min={1} max={50} value={p.radiusKm} onChange={(e) => set({ radiusKm: Number(e.target.value) })} className="w-full accent-electric-400" />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={`Rating mínimo: ${p.minRating}★`}>
            <input type="range" min={0} max={5} step={0.5} value={p.minRating} onChange={(e) => set({ minRating: Number(e.target.value) })} className="w-full accent-electric-400" />
          </Field>
          <Field label={`Reseñas mínimas: ${p.minReviews}`}>
            <input type="range" min={0} max={200} step={10} value={p.minReviews} onChange={(e) => set({ minReviews: Number(e.target.value) })} className="w-full accent-electric-400" />
          </Field>
          <Field label="Sitio web">
            <Select value={p.hasWebsite} onChange={(e) => set({ hasWebsite: e.target.value as SearchParams['hasWebsite'] })}>
              <option value="any">Todos</option>
              <option value="no">Sin web</option>
              <option value="yes">Con web</option>
            </Select>
          </Field>
          <div className="flex flex-wrap items-end gap-x-4 gap-y-1 text-sm text-slate-300">
            <Toggle label="Abierto" checked={p.openNow} onChange={(v) => set({ openNow: v })} />
            <Toggle label="Con teléfono" checked={p.hasPhone} onChange={(v) => set({ hasPhone: v })} />
            <Toggle label="Con Instagram" checked={p.hasInstagram} onChange={(v) => set({ hasInstagram: v })} />
            <Toggle label="Verificados" checked={p.verifiedOnly} onChange={(v) => set({ verifiedOnly: v })} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Fuente: <span className="font-semibold text-electric-300">{activeDataProvider === 'google' ? 'Google Places' : 'Demo / Mock'}</span>
          </span>
          <Button type="submit" size="lg" disabled={isSearching}>
            {isSearching ? (<><Spinner /> Buscando…</>) : '⌖ Buscar negocios'}
          </Button>
        </div>

        {searchError && (
          <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-inset ring-rose-400/20">{searchError}</p>
        )}
      </form>
    </Card>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-electric-400" />
      {label}
    </label>
  )
}
