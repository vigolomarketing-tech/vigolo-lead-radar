import { Brand } from './Sidebar'
import { useLeads } from '../../context/LeadsContext'
import { downloadLeadsCsv } from '../../lib/csv'
import { Button } from '../ui/Button'

/** Barra superior: marca (solo mobile) + fecha + exportar todo. */
export function Topbar() {
  const { leads } = useLeads()
  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-base-950/80 px-4 py-3 backdrop-blur sm:px-6">
      <div className="lg:hidden">
        <Brand />
      </div>
      <div className="hidden lg:block">
        <h1 className="text-lg font-bold text-slate-50">Dashboard</h1>
        <p className="text-xs capitalize text-slate-500">{today}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => downloadLeadsCsv(leads)}
          disabled={leads.length === 0}
          title="Exportar todos los leads a CSV"
        >
          ↓ Exportar todo
        </Button>
      </div>
    </header>
  )
}
