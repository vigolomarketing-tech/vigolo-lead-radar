import { NavLink } from 'react-router-dom'
import { APP } from '../../config/app'
import { cn } from '../../utils/cn'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'D', end: true },
  { to: '/radar', label: 'Radar IA', icon: 'R' },
  { to: '/prospeccion', label: 'Prospeccion', icon: 'P' },
  { to: '/campanas', label: 'Campanas', icon: 'C' },
  { to: '/mapa', label: 'Mapa', icon: 'M' },
  { to: '/crm', label: 'CRM', icon: 'CRM' },
  { to: '/asesor', label: 'Asesor IA', icon: 'IA' },
  { to: '/integraciones', label: 'Integraciones', icon: 'API' },
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
            <span className="w-7 text-xs font-bold opacity-80">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
        <p className="font-semibold text-slate-200">{APP.agency.name}</p>
        <p className="mt-1">Prospeccion industrial impulsada por IA.</p>
      </div>
    </aside>
  )
}

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-base-900 ring-1 ring-inset ring-electric-400/40">
        <span className="absolute inset-0 animate-radar bg-[conic-gradient(from_0deg,transparent_0deg,rgba(62,166,255,0.35)_60deg,transparent_120deg)]" />
        <span className="relative z-10 text-sm font-black tracking-tight text-electric-300">2G</span>
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
