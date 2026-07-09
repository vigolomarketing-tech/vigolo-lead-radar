// =====================================================================
// Ajustes de sesión (zustand + persist)
//  - mode: 'real' | 'demo'  → por defecto REAL.
//      real → intenta Google Places vía backend; cae a demo si no hay
//             conexión / API key / error.
//      demo → siempre datos demo (respaldo, sin tocar Google).
//  - health: estado del backend/proxy (/health) para avisar credenciales.
// =====================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BACKEND_CONFIGURED, PROVIDERS } from '../config/app'

export type DataMode = 'real' | 'demo'

export interface BackendHealth {
  /** Se pudo contactar al backend. */
  reachable: boolean
  /** El backend tiene configurada la GOOGLE_PLACES_API_KEY. */
  places: boolean
  /** El backend tiene configurada la OPENAI_API_KEY. */
  openai: boolean
  /** Mensaje de error si no se pudo contactar. */
  error?: string
  /** Momento de la última verificación (ISO). */
  checkedAt: string
}

interface SettingsState {
  mode: DataMode
  /** Backend configurado en build (VITE_API_BASE_URL presente). */
  backendConfigured: boolean
  health: BackendHealth | null
  checkingHealth: boolean

  setMode: (mode: DataMode) => void
  checkHealth: () => Promise<BackendHealth | null>
}

/**
 * ¿Está TODO listo para traer datos reales?
 * Requiere: backend configurado + alcanzable + con Google Places key.
 */
export function realDataReady(s: Pick<SettingsState, 'backendConfigured' | 'health'>): boolean {
  return Boolean(s.backendConfigured && s.health?.reachable && s.health?.places)
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      mode: 'real', // 👈 por defecto MODO REAL
      backendConfigured: BACKEND_CONFIGURED,
      health: null,
      checkingHealth: false,

      setMode: (mode) => set({ mode }),

      checkHealth: async () => {
        if (!BACKEND_CONFIGURED) {
          const health: BackendHealth = {
            reachable: false,
            places: false,
            openai: false,
            error: 'Falta VITE_API_BASE_URL: no hay backend configurado.',
            checkedAt: new Date().toISOString(),
          }
          set({ health })
          return health
        }
        set({ checkingHealth: true })
        try {
          const ctrl = new AbortController()
          const timer = setTimeout(() => ctrl.abort(), 8000)
          const res = await fetch(`${PROVIDERS.apiBaseUrl}/health`, { signal: ctrl.signal })
          clearTimeout(timer)
          const data = (await res.json().catch(() => ({}))) as {
            places?: boolean
            openai?: boolean
          }
          const health: BackendHealth = {
            reachable: res.ok,
            places: Boolean(data.places),
            openai: Boolean(data.openai),
            checkedAt: new Date().toISOString(),
          }
          set({ health })
          return health
        } catch (e) {
          const health: BackendHealth = {
            reachable: false,
            places: false,
            openai: false,
            error: e instanceof Error ? e.message : 'No se pudo contactar el backend.',
            checkedAt: new Date().toISOString(),
          }
          set({ health })
          return health
        } finally {
          set({ checkingHealth: false })
        }
      },
    }),
    {
      name: 'vigolo-lead-radar:settings',
      // Sólo persistimos el modo elegido; la salud se re-verifica en runtime.
      partialize: (s) => ({ mode: s.mode }),
    },
  ),
)
