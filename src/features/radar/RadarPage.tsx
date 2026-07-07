import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Button, Card, Field, Input, Select, Spinner } from '../../components/ui/primitives'
import { CATEGORIES } from '../../config/argentina'
import { MACHINES } from '../../config/machines'
import { levelFromScore } from '../../lib/scoring'
import { useLeadStore } from '../../store/useLeadStore'
import { LeadCard } from '../leads/LeadCard'
import type { SearchParams } from '../../types'

const BASE: SearchParams = {
  nationwide: true,
  province: '',
  city: '',
  query: '',
  locationKind: 'pais',
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

export function RadarPage() {
  const runNationwideSweep = useLeadStore((s) => s.runNationwideSweep)
  const isSearching = useLeadStore((s) => s.isSearching)
  const sweepProgress = useLeadStore((s) => s.sweepProgress)
  const leads = useLeadStore((s) => s.leads)
  const select = useLeadStore((s) => s.select)
  const [category, setCategory] = useState('')
  const [recommendedMachine, setRecommendedMachine] = useState('')
  const [minReviews, setMinReviews] = useState(10)
  const [minScore, setMinScore] = useState(70)
  const [done, setDone] = useState<{ count: number; top: string[] } | null>(null)

  const activate = async () => {
    setDone(null)
    const before = new Set(leads.map((l) => l.id))
    const found = await runNationwideSweep({
      ...BASE,
      category,
      recommendedMachine,
      minReviews,
      minScore,
    })
    const after = useLeadStore.getState().leads
    const isNew = after.filter((l) => !before.has(l.id))
    const top = [...(isNew.length ? isNew : after)]
      .filter((l) => levelFromScore(l.score) === 'alta')
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((l) => l.id)
    setDone({ count: found, top })
  }

  const topLeads = done ? done.top.map((id) => leads.find((l) => l.id === id)).filter(Boolean) : []

  return (
    <AppShell title="Radar IA" subtitle="Barrido nacional de empresas industriales para 2GTech3D">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-base-900 ring-1 ring-inset ring-electric-400/40">
            <span className="absolute inset-0 animate-radar bg-[conic-gradient(from_0deg,transparent_0deg,rgba(62,166,255,0.5)_60deg,transparent_120deg)]" />
            <span className="relative z-10 text-lg font-bold text-electric-300">2G</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-50">Activar Radar IA industrial</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
              Recorre provincia por provincia buscando metalurgicas, carpinterias, cartelerias, autopartistas,
              matricerias, escuelas tecnicas y otros rubros compatibles con el catalogo 2GTech3D.
            </p>
          </div>

          <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-4">
            <Field label="Rubro">
              <Input list="radar-cats" placeholder="Todos" value={category} onChange={(e) => setCategory(e.target.value)} />
              <datalist id="radar-cats">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Maquina">
              <Select value={recommendedMachine} onChange={(e) => setRecommendedMachine(e.target.value)}>
                <option value="">Todas</option>
                {MACHINES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </Field>
            <Field label={`Score minimo: ${minScore}`}>
              <input type="range" min={0} max={100} step={5} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-full accent-electric-400" />
            </Field>
            <Field label={`Resenas minimas: ${minReviews}`}>
              <input type="range" min={0} max={150} step={10} value={minReviews} onChange={(e) => setMinReviews(Number(e.target.value))} className="w-full accent-electric-400" />
            </Field>
          </div>

          <Button size="lg" onClick={activate} disabled={isSearching}>
            {isSearching ? (<><Spinner /> Escaneando...</>) : 'Activar Radar IA'}
          </Button>

          {sweepProgress && (
            <div className="w-full max-w-2xl">
              <div className="mb-1 flex justify-between text-xs text-electric-200">
                <span>Escaneando... {sweepProgress.province}</span>
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
            <p className="text-lg font-bold text-emerald-300">{done.count} oportunidades en el radar</p>
            <p className="text-sm text-slate-400">Estas son las {topLeads.length} mas calientes para empezar hoy.</p>
          </Card>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topLeads.map((l) => l && <LeadCard key={l.id} lead={l} />)}
          </div>
          <div className="text-center">
            <Button variant="secondary" onClick={() => select(topLeads[0]?.id ?? null)} disabled={!topLeads.length}>
              Ver la oportunidad mas caliente
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
