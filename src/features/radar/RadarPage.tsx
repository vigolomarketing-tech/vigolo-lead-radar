import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Button, Card, Field, Input, Select, Spinner } from '../../components/ui/primitives'
import { LeadCard } from '../leads/LeadCard'
import { useLeadStore } from '../../store/useLeadStore'
import { CATEGORIES } from '../../config/argentina'
import { levelFromScore } from '../../lib/scoring'
import type { SearchParams } from '../../types'

const BASE: SearchParams = {
  nationwide: true, province: '', city: '', query: '', locationKind: 'pais',
  category: '', radiusKm: 5, minRating: 0, minReviews: 0, openNow: false,
  hasWebsite: 'no', hasPhone: false, hasInstagram: false, verifiedOnly: false,
}

export function RadarPage() {
  const runNationwideSweep = useLeadStore((s) => s.runNationwideSweep)
  const isSearching = useLeadStore((s) => s.isSearching)
  const sweepProgress = useLeadStore((s) => s.sweepProgress)
  const leads = useLeadStore((s) => s.leads)
  const select = useLeadStore((s) => s.select)
  const [category, setCategory] = useState('')
  const [minReviews, setMinReviews] = useState(20)
  const [webFilter, setWebFilter] = useState<SearchParams['hasWebsite']>('no')
  const [done, setDone] = useState<{ count: number; top: string[] } | null>(null)

  const activate = async () => {
    setDone(null)
    const before = new Set(leads.map((l) => l.id))
    const found = await runNationwideSweep({ ...BASE, category, minReviews, hasWebsite: webFilter })
    const after = useLeadStore.getState().leads
    const isNew = after.filter((l) => !before.has(l.id))
    const top = [...(isNew.length ? isNew : after)]
      .filter((l) => levelFromScore(l.score) === 'alta')
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((l) => l.id)
    setDone({ count: found.count, top })
  }

  const topLeads = done ? done.top.map((id) => leads.find((l) => l.id === id)!).filter(Boolean) : []

  return (
    <AppShell title="Radar IA" subtitle="La IA recorre Argentina y encuentra oportunidades por vos">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-base-900 ring-1 ring-inset ring-electric-400/40">
            <span className="absolute inset-0 animate-radar bg-[conic-gradient(from_0deg,transparent_0deg,rgba(62,166,255,0.5)_60deg,transparent_120deg)]" />
            <span className="relative z-10 text-3xl">🛰️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-50">Activar Radar IA</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
              El Radar recorre provincia por provincia buscando negocios con alta oportunidad
              (por defecto, sin web) y guarda los mejores automáticamente.
            </p>
          </div>

          <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
            <Field label="Rubro (opcional)">
              <Input list="radar-cats" placeholder="Todos" value={category} onChange={(e) => setCategory(e.target.value)} />
              <datalist id="radar-cats">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label={`Reseñas mínimas: ${minReviews}`}>
              <input type="range" min={0} max={150} step={10} value={minReviews} onChange={(e) => setMinReviews(Number(e.target.value))} className="w-full accent-electric-400" />
            </Field>
            <Field label="Web">
              <Select value={webFilter} onChange={(e) => setWebFilter(e.target.value as SearchParams['hasWebsite'])}>
                <option value="no">Sin web (recomendado)</option>
                <option value="any">Todas</option>
                <option value="yes">Con web</option>
              </Select>
            </Field>
          </div>

          <Button size="lg" onClick={activate} disabled={isSearching}>
            {isSearching ? (<><Spinner /> Escaneando…</>) : '🛰️ Activar Radar IA'}
          </Button>

          {sweepProgress && (
            <div className="w-full max-w-2xl">
              <div className="mb-1 flex justify-between text-xs text-electric-200">
                <span>Escaneando… {sweepProgress.province}</span>
                <span>{sweepProgress.done}/{sweepProgress.total}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-electric-400 transition-all" style={{ width: `${(sweepProgress.done / sweepProgress.total) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </Card>

      {done && (
        <div className="animate-fade-in space-y-3">
          <Card className="border-emerald-400/20 bg-emerald-500/5 p-4 text-center">
            <p className="text-lg font-bold text-emerald-300">✨ {done.count} oportunidades en el radar</p>
            <p className="text-sm text-slate-400">Te muestro las {topLeads.length} más calientes para empezar hoy.</p>
          </Card>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topLeads.map((l) => <LeadCard key={l.id} lead={l} />)}
          </div>
          <div className="text-center">
            <Button variant="secondary" onClick={() => select(topLeads[0]?.id ?? null)} disabled={!topLeads.length}>
              Ver el lead más caliente
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
