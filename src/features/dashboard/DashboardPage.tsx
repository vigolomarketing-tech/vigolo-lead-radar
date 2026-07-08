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
import { useLeadStore } from '../../store/useLeadStore'
import { levelFromScore } from '../../lib/scoring'
import { CRM_STAGE_ACCENT, CRM_STAGE_LABEL, CRM_STAGE_ORDER, OPPORTUNITY_HEX } from '../../lib/labels'
import { formatCurrency, formatNumber, formatPercent } from '../../lib/format'
import { suggestFollowUps } from '../../lib/followups'
import type { CrmStage } from '../../types'

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

  const zoneMap = new Map<string, number>()
  leads.forEach((l) => zoneMap.set(l.zone, (zoneMap.get(l.zone) ?? 0) + 1))
  const zoneData = [...zoneMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  return (
    <AppShell title="Dashboard" subtitle="Panorama comercial en tiempo real">
      {/* KPI principal */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Kpi label="Leads totales" value={formatNumber(stats.total)} accent="text-electric-300" icon="◧" />
        <Kpi label="Urgencia alta" value={formatNumber(leads.filter((l) => l.urgency.level === 'alta').length)} accent="text-rose-300" icon="🔥" />
        <Kpi label="Oportunidades altas" value={formatNumber(stats.highOpportunity)} accent="text-emerald-300" icon="⭐" />
        <Kpi label="Contactados" value={formatNumber(stats.contacted)} accent="text-cyan-300" icon="💬" />
        <Kpi label="Interesados" value={formatNumber(stats.interested)} accent="text-fuchsia-300" icon="⭐" />
        <Kpi label="Ganados" value={formatNumber(stats.won)} accent="text-emerald-300" icon="✓" />
        <Kpi label="Facturación potencial" value={formatCurrency(stats.potentialRevenue)} accent="text-electric-300" icon="📈" />
        <Kpi label="Facturación real" value={formatCurrency(stats.realRevenue)} accent="text-emerald-300" icon="💰" />
      </div>

      {/* Tasas */}
      <div className="grid gap-3 sm:grid-cols-3">
        <RateCard label="Tasa de respuesta" value={stats.responseRate} />
        <RateCard label="Tasa de cierre" value={stats.closeRate} />
        <Card className="p-4">
          <p className="text-xs text-slate-400">Mejores oportunidades</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">🇦🇷 {stats.bestProvince}</p>
          <p className="text-sm font-semibold text-slate-100">📍 {stats.bestCity}</p>
          <p className="text-sm font-semibold text-slate-100">🏷️ {stats.bestCategory}</p>
        </Card>
      </div>

      {/* Metas + Seguimiento IA */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GoalsCard />
        <FollowUpsCard />
      </div>

      {/* Embudo de conversión */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-100">Embudo de conversión</h3>
        <ConversionFunnel leads={leads} />
      </Card>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Pipeline por estado</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stageData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={TOOLTIP} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {stageData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Oportunidad</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={oppData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {oppData.map((d) => (
                  <Cell key={d.name} fill={d.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs">
            {oppData.map((d) => (
              <span key={d.name} className="flex items-center gap-1 text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-4 lg:col-span-3">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Leads por ciudad</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={zoneData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={TOOLTIP} />
              <Bar dataKey="value" fill="#3EA6FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
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

function Kpi({ label, value, accent, icon }: { label: string; value: string; accent: string; icon: string }) {
  return (
    <Card className="p-4">
      <div className={`mb-2 grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-base ${accent}`}>{icon}</div>
      <div className="text-xl font-extrabold tracking-tight text-slate-50">{value}</div>
      <div className="text-xs font-medium text-slate-400">{label}</div>
    </Card>
  )
}

const FUNNEL_STAGES: { stages: CrmStage[]; label: string }[] = [
  { stages: ['nuevo', 'contactado', 'respondio', 'interesado', 'reunion', 'propuesta', 'ganado', 'perdido'], label: 'Encontrados' },
  { stages: ['contactado', 'respondio', 'interesado', 'reunion', 'propuesta', 'ganado'], label: 'Contactados' },
  { stages: ['respondio', 'interesado', 'reunion', 'propuesta', 'ganado'], label: 'Respondieron' },
  { stages: ['interesado', 'reunion', 'propuesta', 'ganado'], label: 'Interesados' },
  { stages: ['propuesta', 'ganado'], label: 'Con propuesta' },
  { stages: ['ganado'], label: 'Ganados' },
]

function ConversionFunnel({ leads }: { leads: import('../../types').Lead[] }) {
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
                  background: `linear-gradient(90deg, #1f8fef, #3EA6FF)`,
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
      <h3 className="mb-3 text-sm font-semibold text-slate-100">🎯 Metas del mes</h3>
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-slate-400">Clientes cerrados</span>
            <span className="shrink-0 text-slate-300">{stats.won} / {goals.clientsTarget}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${clientsPct}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-slate-400">Facturación</span>
            <span className="shrink-0 text-slate-300">{formatCurrency(stats.realRevenue)} / {formatCurrency(goals.revenueTarget)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-electric-400" style={{ width: `${revenuePct}%` }} />
          </div>
        </div>

        {/* Edición de metas (envuelve, nunca desborda) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-xs text-slate-400">
          <label className="flex items-center gap-1.5">
            Meta clientes
            <input
              type="number"
              value={goals.clientsTarget}
              onChange={(e) => setGoals({ ...goals, clientsTarget: Number(e.target.value) || 0 })}
              className="w-16 rounded bg-white/5 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-electric-400/40"
            />
          </label>
          <label className="flex items-center gap-1.5">
            Meta facturación
            <input
              type="number"
              value={goals.revenueTarget}
              onChange={(e) => setGoals({ ...goals, revenueTarget: Number(e.target.value) || 0 })}
              className="w-28 rounded bg-white/5 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-electric-400/40"
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
      <h3 className="mb-1 text-sm font-semibold text-slate-100">✦ Seguimiento IA · a contactar hoy</h3>
      <p className="mb-3 text-xs text-slate-500">Priorizado por probabilidad de respuesta.</p>
      {suggestions.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-500">Todo al día. No hay seguimientos pendientes. 🎉</p>
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
