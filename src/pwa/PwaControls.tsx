import { useState } from 'react'
import { useInstall, useOnline } from './useInstall'
import { cn } from '../utils/cn'

const DISMISS_KEY = '2gtech3d:install-dismissed'

export function PwaControls() {
  const { canInstall, iosNeedsManual, promptInstall } = useInstall()
  const online = useOnline()
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === '1',
  )
  const [iosOpen, setIosOpen] = useState(false)

  const showInstall = (canInstall || iosNeedsManual) && !dismissed
  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* noop */
    }
  }

  return (
    <>
      {/* Banner offline (no bloquea: se puede seguir con datos guardados) */}
      {!online && (
        <div className="fixed inset-x-0 top-0 z-[60] flex items-start gap-3 bg-amber-500/95 px-4 py-2.5 text-sm text-amber-950 shadow-lg">
          <span className="mt-0.5 text-base">📡</span>
          <p className="flex-1 font-medium leading-snug">
            Sin conexión. 2GTech3D Lead Radar necesita internet para buscar empresas reales,
            pero podés revisar los datos guardados.
          </p>
        </div>
      )}

      {/* Botón discreto de instalación */}
      {showInstall && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-3" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-base-900/90 px-2 py-1.5 shadow-glow backdrop-blur-xl">
            <button
              onClick={() => (iosNeedsManual ? setIosOpen(true) : promptInstall())}
              className="flex items-center gap-2 rounded-full bg-electric-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-electric-400"
            >
              <span>⤓</span> Instalar app
            </button>
            <button
              onClick={dismiss}
              aria-label="No mostrar"
              className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Instrucciones iOS */}
      {iosOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setIosOpen(false)}
        >
          <div
            className={cn(
              'w-full max-w-sm rounded-2xl border border-white/10 bg-base-900 p-5 shadow-card',
              'animate-fade-in',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-electric-500/15 text-xl">📲</span>
              <h3 className="text-base font-bold text-slate-50">Instalar en iPhone</h3>
            </div>
            <ol className="space-y-2 text-sm text-slate-300">
              <li>1. Tocá el botón <span className="font-semibold text-electric-300">Compartir</span> <span className="align-middle">⬆️</span> en la barra de Safari.</li>
              <li>2. Elegí <span className="font-semibold text-electric-300">“Agregar a pantalla de inicio”</span>.</li>
              <li>3. Confirmá con <span className="font-semibold text-electric-300">Agregar</span>. ¡Listo!</li>
            </ol>
            <button
              onClick={() => setIosOpen(false)}
              className="mt-4 w-full rounded-lg bg-white/5 py-2 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/10 hover:bg-white/10"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
