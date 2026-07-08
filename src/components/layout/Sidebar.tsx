import { NavLink } from 'react-router-dom'
import { APP } from '../../config/app'
import { cn } from '../../utils/cn'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◧', end: true },
  { to: '/radar', label: 'Radar IA', icon: '🛰️' },
  { to: '/prospeccion', label: 'Prospección', icon: '⌖' },
  { to: '/campanas', label: 'Campañas', icon: '🎯' },
  { to: '/mapa', label: 'Mapa', icon: '⊚' },
  { to: '/crm', label: 'CRM', icon: '▤' },
  { to: '/asesor', label: 'Asesor IA', icon: '✦' },
  { to: '/integraciones', label: 'Integraciones', icon: '⚡' },
]

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-base-950/70 p-4 backdrop-blur-xl lg:flex">
      <Brand />
      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-electric-500/15 text-electric-200 ring-1 ring-inset ring-electric-400/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
              )
            }
          >
            <span className="text-base opacity-80">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
        <p className="font-semibold text-slate-200">{APP.agency.name}</p>
        <p className="mt-1">Prospección industrial impulsada por IA. Encontrá empresas que necesitan máquinas láser/CNC.</p>
      </div>
    </aside>
  )
}

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-base-900 ring-1 ring-inset ring-electric-400/40">
        <span className="absolute inset-0 animate-radar bg-[conic-gradient(from_0deg,transparent_0deg,rgba(62,166,255,0.35)_60deg,transparent_120deg)]" />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="relative z-10" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="#3EA6FF" strokeWidth="1.4" opacity="0.5" />
          <circle cx="12" cy="12" r="4.5" stroke="#3EA6FF" strokeWidth="1.4" opacity="0.8" />
          <circle cx="12" cy="12" r="1.6" fill="#3EA6FF" />
          <circle cx="17" cy="7" r="1.4" fill="#22c55e" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-extrabold leading-tight text-slate-50">
          2GTech3D <span className="text-electric-400">Lead Radar</span>
        </p>
        <p className="text-[11px] text-slate-500">{APP.tagline}</p>
      </div>
    </div>
  )
}
