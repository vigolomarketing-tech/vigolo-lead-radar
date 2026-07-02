import { LeadCard } from './LeadCard'
import { useLeads } from '../../context/LeadsContext'

/** Grilla de resultados. Muestra estado vacio si no hay coincidencias. */
export function LeadList() {
  const { filteredLeads, leads } = useLeads()

  if (filteredLeads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-base-900/40 p-10 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-2xl">
          🔍
        </div>
        <p className="font-semibold text-slate-200">
          {leads.length === 0
            ? 'Todavía no hay leads.'
            : 'Ningún lead coincide con los filtros.'}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {leads.length === 0
            ? 'Hacé un sondeo por zona y rubro para empezar.'
            : 'Probá ajustar o limpiar los filtros.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {filteredLeads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  )
}
