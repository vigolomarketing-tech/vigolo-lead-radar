import { useLeads } from '../../context/LeadsContext'

interface StatDef {
  key: string
  label: string
  value: number
  accent: string
  icon: React.ReactNode
}

/** Fila de tarjetas con las metricas clave del pipeline. */
export function StatsBar() {
  const { stats } = useLeads()

  const items: StatDef[] = [
    {
      key: 'total',
      label: 'Total de leads',
      value: stats.total,
      accent: 'text-electric-300 bg-electric-500/10 ring-electric-400/25',
      icon: <DotsIcon />,
    },
    {
      key: 'high',
      label: 'Oportunidades altas',
      value: stats.highOpportunity,
      accent: 'text-emerald-300 bg-opp-high/10 ring-emerald-400/25',
      icon: <FlameIcon />,
    },
    {
      key: 'contacted',
      label: 'Contactados',
      value: stats.contacted,
      accent: 'text-cyan-300 bg-cyan-500/10 ring-cyan-400/25',
      icon: <ChatIcon />,
    },
    {
      key: 'interested',
      label: 'Interesados',
      value: stats.interested,
      accent: 'text-violet-300 bg-violet-500/10 ring-violet-400/25',
      icon: <StarIcon />,
    },
    {
      key: 'closed',
      label: 'Cerrados',
      value: stats.closed,
      accent: 'text-amber-300 bg-amber-500/10 ring-amber-400/25',
      icon: <CheckIcon />,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-xl border border-white/10 bg-base-900/70 p-4 shadow-card transition-colors hover:border-white/20"
        >
          <div
            className={`mb-2 grid h-9 w-9 place-items-center rounded-lg ring-1 ring-inset ${item.accent}`}
          >
            {item.icon}
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-slate-50">
            {item.value}
          </div>
          <div className="text-xs font-medium text-slate-400">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

// --- iconos inline ---
function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="6" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
    </svg>
  )
}
function FlameIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 1.5 2S12 6 12 2Z" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 5h16v11H8l-4 3V5Z" strokeLinejoin="round" />
    </svg>
  )
}
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M5 13l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
