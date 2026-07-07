import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/primitives'
import { useStats } from '../../hooks/useStats'
import { CRM_STAGE_ACCENT, CRM_STAGE_LABEL, CRM_STAGE_ORDER, OPPORTUNITY_HEX } from '../../lib/labels'
import { formatCurrency, formatNumber, formatPercent } from '../../lib/format'
import { suggestFollowUps } from '../../lib/followups'
import { levelFromScore } from '../../lib/scoring'
import { useLeadStore } from '../../store/useLeadStore'
import type { CrmStage, Lead } from '../../types'

export function DashboardPage() {
  const stats = useStats()
  const leads = useLeadStore((s) => s.leads)

  const stageData = CRM_STAGE_ORDER.map((s) => ({
    name: CRM_STAGE_LABEL[s],
    value: leads.filter((l) => l.stage === s).length,
    color: CRM_STAGE_ACCENT[s as CrmStage],
  }))

  const oppData = (['alta', 'media', 'baja'] as const).map((lvl) => ({
    name: lvl,
    value: leads.filter((l) => levelFromScore(l.score) === lvl).length,
    color: OPPORTUNITY_HEX[lvl],
  }))

  const machineData = topCount(leads, (l) => l.recommendedMachineName, 6)
  const industryData = topCount(leads, (l) => l.industry, 8)
  const provinceData = topCount(leads, (l) => l.province, 8)

  return (
    <AppShell title="Dashboard" subtitle="Panorama comercial de oportunidades para maquinas 2GTech3D">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Kpi label="Oportunidades" value={formatNumber(stats.total)} accent="text-electric-300" />
        <Kpi label="Valor potencial" value={formatCurrency(stats.potentialRevenue)} accent="text-electric-300" />
        <Kpi label="Oportunidades altas" value={formatNumber(stats.highOpportunity)} accent="text-emerald-300" />
        <Kpi label="Maquina top" value={stats.bestMachine} accent="text-cyan-300" compact />
        <Kpi label="Rubro top" value={stats.bestIndustry} accent="text-violet-300" compact />
        <Kpi label="Provincia top" value={stats.bestProvince} accent="text-amber-300" compact />
        <Kpi label="Contactados" value={formatNumber(stats.contacted)} accent="text-cyan-300" />
        <Kpi label="Cotizaciones ganadas" value={formatNumber(stats.won)} accent="text-emerald-300" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <RateCard label="Tasa de respuesta" value={stats.responseRate} />
        <RateCard label="Tasa de cierre" value={stats.closeRate} />
        <Card className="p-4">
          <p className="text-xs text-slate-400">Mejor foco comercial</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{stats.bestMachine}</p>
          <p className="text-sm text-slate-300">{stats.bestIndustry}</p>
          <p className="text-xs text-slate-500">{stats.bestCity}, {stats.bestProvince}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GoalsCard />
        <FollowUpsCard />
      </div>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-100">Embudo de venta industrial</h3>
        <ConversionFunnel leads={leads} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Pipeline por estado</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stageData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={TOOLTIP} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {stageData.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Nivel de oportunidad</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={oppData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {oppData.map((d) => <Cell key={d.name} fill={d.color} stroke="transparent" />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <BarPanel title="Maquinas recomendadas" data={machineData} />
        <BarPanel title="Rubros encontrados" data={industryData} />
        <BarPanel title="Provincias" data={provinceData} />
      </div>
    </AppShell>
  )
}

const TOOLTIP = {
  background: '#0e1430',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#e2e8f0',
  fontSize: 12,
}

function topCount(leads: Lead[], getKey: (lead: Lead) => string, limit: number) {
  const map = new Map<string, number>()
  leads.forEach((l) => map.set(getKey(l), (map.get(getKey(l)) ?? 0) + 1))
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

function Kpi({ label, value, accent, compact = false }: { label: string; value: string; accent: string; compact?: boolean }) {
  return (
    <Card className="p-4">
      <div className={`${compact ? 'line-clamp-2 text-sm' : 'text-xl'} font-extrabold tracking-tight ${accent}`}>{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-400">{label}</div>
    </Card>
  )
}

const FUNNEL_STAGES: { stages: CrmStage[]; label: string }[] = [
  { stages: ['nuevo', 'contactado', 'respondio', 'interesado', 'reunion', 'propuesta', 'ganado', 'perdido'], label: 'Detectadas' },
  { stages: ['contactado', 'respondio', 'interesado', 'reunion', 'propuesta', 'ganado'], label: 'Contactadas' },
  { stages: ['respondio', 'interesado', 'reunion', 'propuesta', 'ganado'], label: 'Respondieron' },
  { stages: ['interesado', 'reunion', 'propuesta', 'ganado'], label: 'Interesadas' },
  { stages: ['propuesta', 'ganado'], label: 'Cotizadas' },
  { stages: ['ganado'], label: 'Ganadas' },
]

function ConversionFunnel({ leads }: { leads: Lead[] }) {
  const total = leads.length || 1
  return (
    <div className="space-y-2">
      {FUNNEL_STAGES.map((step, i) => {
        const n = leads.filter((l) => step.stages.includes(l.stage)).length
        const pct = (n / total) * 100
        return (
          <div key={step.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-slate-400">{step.label}</span>
            <div className="h-6 flex-1 overflow-hidden rounded-lg bg-white/5">
              <div
                className="flex h-full items-center justify-end rounded-lg px-2 text-[11px] font-bold text-white transition-all"
                style={{
                  width: `${Math.max(pct, 6)}%`,
                  background: 'linear-gradient(90deg, #1f8fef, #3EA6FF)',
                  opacity: 1 - i * 0.1,
                }}
              >
                {n}
              </div>
            </div>
            <span className="w-10 shrink-0 text-right text-xs text-slate-500">{Math.round(pct)}%</span>
          </div>
        )
      })}
    </div>
  )
}

function GoalsCard() {
  const goals = useLeadStore((s) => s.goals)
  const setGoals = useLeadStore((s) => s.setGoals)
  const stats = useStats()
  const clientsPct = goals.clientsTarget ? Math.min(100, (stats.won / goals.clientsTarget) * 100) : 0
  const revenuePct = goals.revenueTarget ? Math.min(100, (stats.realRevenue / goals.revenueTarget) * 100) : 0
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-100">Metas comerciales</h3>
      <div className="space-y-4">
        <Progress label="Ventas cerradas" value={`${stats.won} / ${goals.clientsTarget}`} pct={clientsPct} color="bg-emerald-400" />
        <Progress label="Facturacion" value={`${formatCurrency(stats.realRevenue)} / ${formatCurrency(goals.revenueTarget)}`} pct={revenuePct} color="bg-electric-400" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-xs text-slate-400">
          <label className="flex items-center gap-1.5">
            Meta ventas
            <input
              type="number"
              value={goals.clientsTarget}
              onChange={(e) => setGoals({ ...goals, clientsTarget: Number(e.target.value) || 0 })}
              className="w-16 rounded bg-white/5 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-electric-400/40"
            />
          </label>
          <label className="flex items-center gap-1.5">
            Meta ARS
            <input
              type="number"
              value={goals.revenueTarget}
              onChange={(e) => setGoals({ ...goals, revenueTarget: Number(e.target.value) || 0 })}
              className="w-32 rounded bg-white/5 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-electric-400/40"
            />
          </label>
        </div>
      </div>
    </Card>
  )
}

function FollowUpsCard() {
  const leads = useLeadStore((s) => s.leads)
  const select = useLeadStore((s) => s.select)
  const suggestions = suggestFollowUps(leads, 6)
  return (
    <Card className="p-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-100">Seguimiento sugerido</h3>
      <p className="mb-3 text-xs text-slate-500">Priorizado por score, estado CRM y proxima accion.</p>
      {suggestions.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-500">No hay seguimientos pendientes.</p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li key={s.lead.id}>
              <button
                onClick={() => select(s.lead.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-2.5 text-left transition-colors hover:border-electric-400/40"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-electric-500/15 text-xs font-bold text-electric-300">
                  {s.responseProbability}%
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-100">{s.lead.name}</span>
                  <span className="block truncate text-xs text-slate-500">{s.reason}</span>
                </span>
                {s.overdue && <span className="shrink-0 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300">vencido</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function BarPanel({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-100">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={70} />
          <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={TOOLTIP} />
          <Bar dataKey="value" fill="#3EA6FF" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

function RateCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-50">{formatPercent(value)}</p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-electric-400" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </Card>
  )
}

function Progress({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="truncate text-slate-400">{label}</span>
        <span className="shrink-0 text-slate-300">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
