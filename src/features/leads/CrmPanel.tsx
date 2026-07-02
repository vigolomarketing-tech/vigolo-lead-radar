import { useState } from 'react'
import { Button, Card, Field, Input } from '../../components/ui/primitives'
import { useLeadStore } from '../../store/useLeadStore'
import { CRM_STAGE_LABEL, CRM_STAGE_ORDER, CRM_STAGE_STYLE } from '../../lib/labels'
import { formatCurrency, formatDate } from '../../lib/format'
import { cn } from '../../utils/cn'
import type { Lead } from '../../types'

export function CrmPanel({ lead }: { lead: Lead }) {
  const { setStage, updateLead, addNote, addReminder, toggleReminder } = useLeadStore()
  const [note, setNote] = useState('')
  const [remDate, setRemDate] = useState('')
  const [remText, setRemText] = useState('')

  return (
    <div className="space-y-4">
      {/* Pipeline */}
      <Card className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-100">Estado en el pipeline</h4>
        <div className="flex flex-wrap gap-1.5">
          {CRM_STAGE_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setStage(lead.id, s)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all',
                lead.stage === s ? cn(CRM_STAGE_STYLE[s], 'scale-105') : 'bg-transparent text-slate-400 ring-white/10 hover:bg-white/5',
              )}
            >
              {CRM_STAGE_LABEL[s]}
            </button>
          ))}
        </div>
      </Card>

      {/* Valor + probabilidad */}
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Valor potencial">
            <Input
              type="number"
              value={lead.potentialValue}
              onChange={(e) => updateLead(lead.id, { potentialValue: Number(e.target.value) || 0 })}
            />
            <span className="mt-1 block text-xs text-slate-500">{formatCurrency(lead.potentialValue)}</span>
          </Field>
          <Field label={`Probabilidad de cierre: ${lead.closeProbability}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={lead.closeProbability}
              onChange={(e) => updateLead(lead.id, { closeProbability: Number(e.target.value) })}
              className="w-full accent-electric-400"
            />
          </Field>
          <Field label="Último contacto">
            <Input
              type="date"
              value={lead.lastContactDate ?? ''}
              onChange={(e) => updateLead(lead.id, { lastContactDate: e.target.value || undefined })}
              className="[color-scheme:dark]"
            />
          </Field>
          <Field label="Próximo seguimiento">
            <Input
              type="date"
              value={lead.nextFollowUpDate ?? ''}
              onChange={(e) => updateLead(lead.id, { nextFollowUpDate: e.target.value || undefined })}
              className="[color-scheme:dark]"
            />
          </Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={lead.proposalSent}
            onChange={(e) => updateLead(lead.id, { proposalSent: e.target.checked })}
            className="accent-electric-400"
          />
          Presupuesto / propuesta enviada
        </label>
      </Card>

      {/* Recordatorios */}
      <Card className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-100">Recordatorios</h4>
        <div className="space-y-2">
          {lead.reminders.length === 0 && <p className="text-xs text-slate-500">Sin recordatorios.</p>}
          {lead.reminders.map((r) => (
            <label key={r.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={r.done} onChange={() => toggleReminder(lead.id, r.id)} className="accent-electric-400" />
              <span className={cn('flex-1', r.done && 'text-slate-500 line-through')}>{r.text}</span>
              <span className="text-xs text-slate-500">{formatDate(r.date)}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input type="date" value={remDate} onChange={(e) => setRemDate(e.target.value)} className="[color-scheme:dark] max-w-[150px]" />
          <Input placeholder="Recordatorio…" value={remText} onChange={(e) => setRemText(e.target.value)} />
          <Button
            size="sm"
            onClick={() => {
              if (remDate && remText.trim()) {
                addReminder(lead.id, remDate, remText.trim())
                setRemDate('')
                setRemText('')
              }
            }}
          >
            +
          </Button>
        </div>
      </Card>

      {/* Notas + historial */}
      <Card className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-100">Notas e historial</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Agregar nota…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && note.trim()) {
                addNote(lead.id, note.trim())
                setNote('')
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              if (note.trim()) {
                addNote(lead.id, note.trim())
                setNote('')
              }
            }}
          >
            Agregar
          </Button>
        </div>
        <ul className="mt-3 space-y-2">
          {lead.events.length === 0 && <li className="text-xs text-slate-500">Sin actividad todavía.</li>}
          {lead.events.map((ev) => (
            <li key={ev.id} className="flex gap-2 text-xs">
              <span className="mt-0.5 text-slate-600">{ICON[ev.type]}</span>
              <div>
                <p className="text-slate-300">{ev.text}</p>
                <p className="text-slate-600">{formatDate(ev.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

const ICON: Record<string, string> = { nota: '📝', contacto: '📞', estado: '🔀', sistema: '✦' }
