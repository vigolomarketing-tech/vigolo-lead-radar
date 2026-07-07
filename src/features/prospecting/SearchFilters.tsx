import { useMemo, useState } from 'react'
import { CATEGORIES, PROVINCES, citiesOfProvince } from '../../config/argentina'
import { MACHINES } from '../../config/machines'
import { Button, Card, Field, Input, Select, Spinner } from '../../components/ui/primitives'
import { activeDataProvider } from '../../services/providers/dataProvider'
import { useLeadStore } from '../../store/useLeadStore'
import type { SearchParams } from '../../types'

const DEFAULTS: SearchParams = {
  nationwide: false,
  province: '',
  city: '',
  query: '',
  locationKind: 'ciudad',
  category: '',
  recommendedMachine: '',
  minScore: 0,
  radiusKm: 5,
  minRating: 0,
  minReviews: 0,
  openNow: false,
  hasWebsite: 'any',
  hasPhone: false,
  hasInstagram: false,
  verifiedOnly: false,
}

export function SearchFilters({ onDone }: { onDone?: (count: number) => void }) {
  const runSearch = useLeadStore((s) => s.runSearch)
  const runNationwideSweep = useLeadStore((s) => s.runNationwideSweep)
  const isSearching = useLeadStore((s) => s.isSearching)
  const searchError = useLeadStore((s) => s.searchError)
  const sweepProgress = useLeadStore((s) => s.sweepProgress)
  const [p, setP] = useState<SearchParams>(DEFAULTS)
  const set = (patch: Partial<SearchParams>) => setP((prev) => ({ ...prev, ...patch }))

  const cities = useMemo(() => citiesOfProvince(p.province), [p.province])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const n = await runSearch(p)
    onDone?.(n)
  }
  const nationwide = async () => {
    const n = await runNationwideSweep(p)
    onDone?.(n)
  }

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Provincia">
            <Select value={p.province} onChange={(e) => set({ province: e.target.value, city: '' })}>
              <option value="">Todas</option>
              {PROVINCES.map((pr) => <option key={pr} value={pr}>{pr}</option>)}
            </Select>
          </Field>
          <Field label="Ciudad / Partido">
            <Select value={p.city} onChange={(e) => set({ city: e.target.value })} disabled={!p.province}>
              <option value="">{p.province ? 'Todas' : 'Elegir provincia'}</option>
              {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Zona / parque industrial">
            <Input placeholder="San Martin, parque industrial..." value={p.query} onChange={(e) => set({ query: e.target.value })} />
          </Field>
          <Field label="Industria / rubro">
            <Input list="cats" placeholder="metalurgicas, carpinterias..." value={p.category} onChange={(e) => set({ category: e.target.value })} />
            <datalist id="cats">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Maquina recomendada">
            <Select value={p.recommendedMachine} onChange={(e) => set({ recommendedMachine: e.target.value })}>
              <option value="">Todas</option>
              {MACHINES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </Field>
          <Field label={`Score minimo: ${p.minScore}`}>
            <input type="range" min={0} max={100} step={5} value={p.minScore} onChange={(e) => set({ minScore: Number(e.target.value) })} className="w-full accent-electric-400" />
          </Field>
          <Field label={`Radio: ${p.radiusKm} km`}>
            <input type="range" min={1} max={50} value={p.radiusKm} onChange={(e) => set({ radiusKm: Number(e.target.value) })} className="w-full accent-electric-400" />
          </Field>
          <Field label={`Rating minimo: ${p.minRating}`}>
            <input type="range" min={0} max={5} step={0.5} value={p.minRating} onChange={(e) => set({ minRating: Number(e.target.value) })} className="w-full accent-electric-400" />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={`Resenas minimas: ${p.minReviews}`}>
            <input type="range" min={0} max={200} step={10} value={p.minReviews} onChange={(e) => set({ minReviews: Number(e.target.value) })} className="w-full accent-electric-400" />
          </Field>
          <Field label="Trazabilidad digital">
            <Select value={p.hasWebsite} onChange={(e) => set({ hasWebsite: e.target.value as SearchParams['hasWebsite'] })}>
              <option value="any">Todas</option>
              <option value="no">Sin web/referencia</option>
              <option value="yes">Con web/referencia</option>
            </Select>
          </Field>
          <Toggle label="Abierto ahora" checked={p.openNow} onChange={(v) => set({ openNow: v })} />
          <Toggle label="Con telefono" checked={p.hasPhone} onChange={(v) => set({ hasPhone: v })} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
          <Toggle label="Con Instagram" checked={p.hasInstagram} onChange={(v) => set({ hasInstagram: v })} />
          <Toggle label="Verificados" checked={p.verifiedOnly} onChange={(v) => set({ verifiedOnly: v })} />
        </div>

        {sweepProgress && (
          <div className="rounded-lg bg-electric-500/10 p-3 ring-1 ring-inset ring-electric-400/20">
            <div className="mb-1 flex justify-between text-xs text-electric-200">
              <span>Recorriendo Argentina... {sweepProgress.province}</span>
              <span>{sweepProgress.done}/{sweepProgress.total}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-electric-400 transition-all" style={{ width: `${(sweepProgress.done / sweepProgress.total) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Fuente: <span className="font-semibold text-electric-300">{activeDataProvider === 'google' ? 'Google Places' : 'DEMO ficticio'}</span>
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={nationwide} disabled={isSearching}>
              Buscar en toda Argentina
            </Button>
            <Button type="submit" size="lg" disabled={isSearching}>
              {isSearching ? (<><Spinner /> Buscando...</>) : 'Buscar empresas'}
            </Button>
          </div>
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
    <label className="flex items-center gap-1.5 self-end pb-2 text-sm text-slate-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-electric-400" />
      {label}
    </label>
  )
}
