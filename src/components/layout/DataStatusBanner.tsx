// =====================================================================
// Aviso de estado de datos (credenciales / backend).
//  - Verifica /health al montar.
//  - Si el usuario está en Modo Real pero NO hay datos reales disponibles
//    (sin backend, sin key, o sin conexión), muestra un aviso claro
//    explicando qué falta y que se usarán datos demo mientras tanto.
// =====================================================================

import { useEffect, useState } from 'react'
import { realDataReady, useSettings } from '../../store/useSettings'

export function DataStatusBanner() {
  const mode = useSettings((s) => s.mode)
  const health = useSettings((s) => s.health)
  const backendConfigured = useSettings((s) => s.backendConfigured)
  const checkHealth = useSettings((s) => s.checkHealth)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    void checkHealth()
  }, [checkHealth])

  const ready = realDataReady({ backendConfigured, health })
  // Solo avisamos en Modo Real cuando los datos reales no están disponibles.
  const show = mode === 'real' && health !== null && !ready && !dismissed
  if (!show) return null

  const reason = !backendConfigured
    ? 'Falta configurar el backend (VITE_API_BASE_URL). '
    : !health?.reachable
      ? 'No se pudo contactar el backend. '
      : !health?.places
        ? 'El backend no tiene configurada la GOOGLE_PLACES_API_KEY. '
        : ''

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-xl border border-amber-400/30 bg-amber-500/15 px-4 py-3 text-xs text-amber-100 shadow-lg backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="text-base leading-none">🟡</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Modo Real activo, pero sin datos reales todavía</p>
          <p className="mt-0.5 text-amber-200/90">
            {reason}Mientras tanto se muestran <strong>datos demo</strong>. Configurá las
            credenciales para traer negocios reales de Google Places.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-md p-1 text-amber-200/80 hover:bg-white/10 hover:text-white"
          aria-label="Cerrar aviso"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
