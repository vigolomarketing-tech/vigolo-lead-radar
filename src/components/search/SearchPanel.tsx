import { useState } from 'react'
import { Button } from '../ui/Button'
import { useLeads } from '../../context/LeadsContext'
import { DEMO_CATEGORIES, DEMO_ZONES } from '../../data/mockLeads'
import { dataSource } from '../../services/placesService'

/** Buscador de negocios por zona + rubro. Dispara el sondeo. */
export function SearchPanel() {
  const { runSearch, isSearching, searchError, lastSearch } = useLeads()
  const [zone, setZone] = useState('')
  const [category, setCategory] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    const count = await runSearch({ zone, category })
    if (count > 0) {
      setFeedback(
        `Se encontraron ${count} negocio${count === 1 ? '' : 's'} para tu sondeo.`,
      )
    } else if (!searchError) {
      setFeedback('No se encontraron negocios con esos criterios. Proba otra zona o rubro.')
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-base-900/70 p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-electric-500/15 text-electric-300 ring-1 ring-inset ring-electric-400/30">
          <RadarIcon />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Sondear una zona
          </h2>
          <p className="text-xs text-slate-400">
            Eleg&iacute; zona y rubro para detectar negocios con oportunidad.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Field label="Zona">
          <input
            list="zones-list"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Longchamps, Adrogu&eacute;, CABA..."
            className={inputClass}
          />
          <datalist id="zones-list">
            {DEMO_ZONES.map((z) => (
              <option key={z} value={z} />
            ))}
          </datalist>
        </Field>

        <Field label="Rubro">
          <input
            list="categories-list"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="barber&iacute;as, gimnasios, caf&eacute;s..."
            className={inputClass}
          />
          <datalist id="categories-list">
            {DEMO_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>

        <div className="flex items-end">
          <Button type="submit" disabled={isSearching} className="w-full sm:w-auto">
            {isSearching ? 'Buscando...' : 'Buscar negocios'}
          </Button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="text-slate-500">
          Fuente de datos:{' '}
          <span className="font-semibold text-electric-300">
            {dataSource === 'google' ? 'Google Places' : 'Demo / Mock'}
          </span>
        </span>
        {lastSearch && (
          <span className="text-slate-500">
            &Uacute;ltimo sondeo: {lastSearch.category || 'todos'} en{' '}
            {lastSearch.zone || 'todas las zonas'}
          </span>
        )}
      </div>

      {searchError && (
        <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-inset ring-rose-400/20">
          {searchError}
        </p>
      )}
      {feedback && !searchError && (
        <p className="mt-3 rounded-lg bg-electric-500/10 px-3 py-2 text-xs text-electric-200 ring-1 ring-inset ring-electric-400/20">
          {feedback}
        </p>
      )}
    </section>
  )
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-base-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-electric-400/60 focus:outline-none focus:ring-2 focus:ring-electric-400/30'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">
        {label}
      </span>
      {children}
    </label>
  )
}

function RadarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <path d="M12 12 L12 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
