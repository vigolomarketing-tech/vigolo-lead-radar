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
        <Kpi label="Analizados" value={formatNumber(stats.analyzed)} accent="text-violet-300" icon="✦" />
        <Kpi label="Oportunidades altas" value={formatNumber(stats.highOpportunity)} accent="text-emerald-300" icon="🔥" />
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
          <p className="text-xs text-slate-400">Mejor zona / rubro / mes</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">📍 {stats.bestZone}</p>
          <p className="text-sm font-semibold text-slate-100">🏷️ {stats.bestCategory}</p>
          <p className="text-sm font-semibold text-slate-100">📅 Julio 2026</p>
        </Card>
      </div>

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
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Leads por zona</h3>
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
