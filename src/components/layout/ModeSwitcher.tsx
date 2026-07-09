// =====================================================================
// Selector Modo Real / Modo Demo (runtime).
//  - Real (default): trae negocios reales de Google Places vía backend,
//    con respaldo automático a demo si falla.
//  - Demo: siempre datos de demostración (respaldo).
// Muestra además un punto de estado del backend (credenciales).
// =====================================================================

import { clearSearchCache } from '../../services/providers/dataProvider'
import { realDataReady, useSettings, type DataMode } from '../../store/useSettings'
import { cn } from '../../utils/cn'

export function ModeSwitcher() {
  const mode = useSettings((s) => s.mode)
  const setMode = useSettings((s) => s.setMode)
  const health = useSettings((s) => s.health)
  const backendConfigured = useSettings((s) => s.backendConfigured)

  const ready = realDataReady({ backendConfigured, health })
  const change = (m: DataMode) => {
    if (m === mode) return
    clearSearchCache() // evita servir resultados del modo anterior
    setMode(m)
  }

  // Punto de estado: verde = listo para datos reales, ámbar = configurado
  // pero sin key/alcanzable, gris = sin backend.
  const dot = !backendConfigured ? 'bg-slate-500' : ready ? 'bg-emerald-400' : 'bg-amber-400'
  const dotTitle = !backendConfigured
    ? 'Sin backend configurado (VITE_API_BASE_URL). Modo Real usará datos demo.'
    : ready
      ? 'Backend OK · Google Places disponible'
      : health?.reachable
        ? 'Backend alcanzable pero falta GOOGLE_PLACES_API_KEY.'
        : 'No se pudo contactar el backend.'

  return (
    <div className="flex items-center gap-2">
      <span className={cn('h-2 w-2 shrink-0 rounded-full', dot)} title={dotTitle} />
      <div
        role="tablist"
        aria-label="Modo de datos"
        className="inline-flex rounded-full bg-white/5 p-0.5 ring-1 ring-inset ring-white/10"
      >
        <button
          role="tab"
          aria-selected={mode === 'real'}
          onClick={() => change('real')}
          title="Traer negocios reales de Google Places"
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
            mode === 'real' ? 'bg-emerald-500/90 text-white' : 'text-slate-300 hover:text-white',
          )}
        >
          🟢 Real
        </button>
        <button
          role="tab"
          aria-selected={mode === 'demo'}
          onClick={() => change('demo')}
          title="Usar datos de demostración"
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
            mode === 'demo' ? 'bg-amber-500/90 text-white' : 'text-slate-300 hover:text-white',
          )}
        >
          🟡 Demo
        </button>
      </div>
    </div>
  )
}
