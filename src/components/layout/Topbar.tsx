import { NavLink } from 'react-router-dom'
import { Brand } from './Sidebar'
import { activeDataProvider } from '../../services/providers/dataProvider'
import { activeAiProvider } from '../../services/ai/aiProvider'
import { cn } from '../../utils/cn'

const MOBILE_NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/radar', label: 'Radar' },
  { to: '/prospeccion', label: 'Buscar' },
  { to: '/campanas', label: 'Campañas' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/crm', label: 'CRM' },
  { to: '/asesor', label: 'Asesor' },
  { to: '/integraciones', label: 'Integraciones' },
]

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-base-950/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="hidden lg:block">
          <h1 className="text-lg font-bold text-slate-50">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          {activeDataProvider !== 'google' && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 font-semibold text-amber-300 ring-1 ring-inset ring-amber-400/30"
              title="Datos de demostración (ficticios). Conectá Google Places para empresas reales."
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Modo DEMO
            </span>
          )}
          {activeDataProvider === 'google' && (
            <span className="hidden items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-300 ring-1 ring-inset ring-emerald-400/30 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Datos reales
            </span>
          )}
          <span className="hidden items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-slate-400 ring-1 ring-inset ring-white/10 sm:inline-flex">
            <span className={cn('h-1.5 w-1.5 rounded-full', activeAiProvider === 'openai' ? 'bg-emerald-400' : 'bg-amber-400')} />
            IA: {activeAiProvider === 'openai' ? 'OpenAI' : 'Local'}
          </span>
        </div>
      </div>
      {/* Nav mobile */}
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {MOBILE_NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold',
                isActive ? 'bg-electric-500 text-white' : 'bg-white/5 text-slate-300',
              )
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
