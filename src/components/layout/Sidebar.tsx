import { useLeads } from '../../context/LeadsContext'
import { CRM_STATUS_LABEL, CRM_STATUS_ORDER, CRM_STATUS_STYLE } from '../../lib/labels'

/** Barra lateral (desktop): marca + resumen del pipeline por estado. */
export function Sidebar() {
  const { leads } = useLeads()

  const counts = CRM_STATUS_ORDER.map((status) => ({
    status,
    count: leads.filter((l) => l.crmStatus === status).length,
  }))

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-base-950/80 p-5 lg:flex">
      <Brand />

      <nav className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Pipeline
        </p>
        <ul className="space-y-1">
          {counts.map(({ status, count }) => (
            <li
              key={status}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ring-1 ring-inset ${CRM_STATUS_STYLE[status]}`}
                />
                {CRM_STATUS_LABEL[status]}
              </span>
              <span className="font-semibold text-slate-400">{count}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-base-900/60 p-3 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">Vigolo Web Studio</p>
        <p className="mt-1">
          Herramienta interna de prospección. Los datos se guardan en este
          navegador.
        </p>
      </div>
    </aside>
  )
}

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-base-900 ring-1 ring-inset ring-electric-400/40">
        <span className="absolute inset-0 animate-radar bg-[conic-gradient(from_0deg,transparent_0deg,rgba(62,166,255,0.35)_60deg,transparent_120deg)]" />
        <RadarGlyph />
      </div>
      <div>
        <p className="text-sm font-extrabold leading-tight text-slate-50">
          Vigolo <span className="text-electric-400">Lead Radar</span>
        </p>
        <p className="text-[11px] text-slate-500">Prospección por zonas</p>
      </div>
    </div>
  )
}

function RadarGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="relative z-10" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#3EA6FF" strokeWidth="1.4" opacity="0.5" />
      <circle cx="12" cy="12" r="4.5" stroke="#3EA6FF" strokeWidth="1.4" opacity="0.8" />
      <circle cx="12" cy="12" r="1.6" fill="#3EA6FF" />
      <circle cx="17" cy="7" r="1.4" fill="#22c55e" />
    </svg>
  )
}
