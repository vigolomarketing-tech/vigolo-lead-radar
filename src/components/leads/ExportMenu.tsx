import { useState } from 'react'
import { Button } from '../ui/primitives'
import { exportCsv, exportExcel, exportJson, exportNotion, exportPdf, exportSheets } from '../../utils/exporters'
import type { Lead } from '../../types'

export function ExportMenu({ leads }: { leads: Lead[] }) {
  const [open, setOpen] = useState(false)
  const act = (fn: () => void) => {
    fn()
    setOpen(false)
  }
  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)} disabled={leads.length === 0}>
        ↓ Exportar
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-white/10 bg-base-900 shadow-card">
            {[
              ['CSV', () => exportCsv(leads)],
              ['Excel', () => exportExcel(leads)],
              ['JSON', () => exportJson(leads)],
              ['PDF', () => void exportPdf(leads)],
              ['Google Sheets', () => void exportSheets(leads)],
              ['Notion (Markdown)', () => exportNotion(leads)],
            ].map(([label, fn]) => (
              <button
                key={label as string}
                onClick={() => act(fn as () => void)}
                className="block w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5"
              >
                {label as string}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
