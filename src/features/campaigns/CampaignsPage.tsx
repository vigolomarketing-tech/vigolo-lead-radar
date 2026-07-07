import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Button, Card, EmptyState, Field, Input, Select } from '../../components/ui/primitives'
import { CATEGORIES, PROVINCES, citiesOfProvince } from '../../config/argentina'
import { MACHINES } from '../../config/machines'
import { formatCurrency, formatDate } from '../../lib/format'
import { useLeadStore } from '../../store/useLeadStore'
import type { Campaign, Lead } from '../../types'

function campaignLeads(c: Campaign, leads: Lead[]): Lead[] {
  return leads.filter(
    (l) =>
      (!c.province || l.province === c.province) &&
      (!c.city || l.city === c.city) &&
      (!c.category || l.category === c.category) &&
      (!c.recommendedMachine || l.recommendedMachineId === c.recommendedMachine),
  )
}

export function CampaignsPage() {
  const { campaigns, addCampaign, removeCampaign, leads, setFilters } = useLeadStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [recommendedMachine, setRecommendedMachine] = useState('')
  const [target, setTarget] = useState(100)
  const cities = useMemo(() => citiesOfProvince(province), [province])

  const create = () => {
    const machineName = MACHINES.find((m) => m.id === recommendedMachine)?.category
    const auto = name || `${target} ${category || machineName || 'oportunidades'} en ${city || province || 'Argentina'}`
    addCampaign({ name: auto, province, city, category, recommendedMachine, target })
    setName('')
  }

  return (
    <AppShell title="Campanas" subtitle="Organizar prospeccion industrial por rubro, zona y maquina">
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-100">Nueva campana</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Field label="Nombre">
            <Input placeholder="Ej: Fibra metalurgicas Cordoba" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Provincia">
            <Select value={province} onChange={(e) => { setProvince(e.target.value); setCity('') }}>
              <option value="">Todas</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Ciudad">
            <Select value={city} onChange={(e) => setCity(e.target.value)} disabled={!province}>
              <option value="">Todas</option>
              {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Industria">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Todas</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Maquina">
            <Select value={recommendedMachine} onChange={(e) => setRecommendedMachine(e.target.value)}>
              <option value="">Todas</option>
              {MACHINES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </Field>
          <Field label={`Objetivo: ${target}`}>
            <input type="range" min={10} max={500} step={10} value={target} onChange={(e) => setTarget(Number(e.target.value))} className="w-full accent-electric-400" />
          </Field>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={create}>Crear campana</Button>
        </div>
      </Card>

      {campaigns.length === 0 ? (
        <EmptyState title="Sin campanas todavia" subtitle="Crea una campana para organizar prospeccion por industria o maquina." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const cl = campaignLeads(c, leads)
            const contacted = cl.filter((l) => l.stage !== 'nuevo').length
            const quoted = cl.filter((l) => l.stage === 'propuesta' || l.stage === 'ganado').length
            const won = cl.filter((l) => l.stage === 'ganado').length
            const conv = cl.length ? Math.round((won / cl.length) * 100) : 0
            const value = cl.reduce((s, l) => s + l.potentialValue, 0)
            const progress = Math.min(100, Math.round((cl.length / c.target) * 100))
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-100">{c.name}</h4>
                    <p className="text-xs text-slate-500">{formatDate(c.createdAt)}</p>
                  </div>
                  <button onClick={() => removeCampaign(c.id)} className="text-slate-600 hover:text-rose-400">x</button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Metric label="Oportun." value={`${cl.length}`} />
                  <Metric label="Contactadas" value={`${contacted}`} />
                  <Metric label="Cotizadas" value={`${quoted}`} />
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Objetivo {c.target}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-electric-400" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Valor potencial: <span className="font-semibold text-electric-300">{formatCurrency(value)}</span>
                </p>
                <p className="text-xs text-slate-500">Conversion ganada: {conv}%</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => {
                    setFilters({
                      province: c.province,
                      city: c.city,
                      category: c.category,
                      recommendedMachine: c.recommendedMachine,
                      query: '',
                      opportunity: '',
                      minScore: 0,
                      stage: '',
                      priority: '',
                    })
                    navigate('/prospeccion')
                  }}
                >
                  Ver oportunidades
                </Button>
              </Card>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 py-2">
      <div className="text-lg font-bold text-slate-50">{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  )
}
