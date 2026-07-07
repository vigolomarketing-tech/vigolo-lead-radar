import { useState } from 'react'
import { Button, Card, Field, Input } from '../../components/ui/primitives'
import { useLeadStore } from '../../store/useLeadStore'
import { CRM_STAGE_LABEL, CRM_STAGE_ORDER, CRM_STAGE_STYLE } from '../../lib/labels'
import { formatCurrency, formatDate } from '../../lib/format'
import { cn } from '../../utils/cn'
import type { Lead } from '../../types'

const PRIORITY_STYLE: Record<string, string> = {
  alta: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
  media: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  baja: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
}
const SUGGESTED_TAGS = [
  'alta-inversion',
  'fibra',
  'co2',
  'grabadora-fibra',
  'financiacion',
  'visita-tecnica',
  'produccion',
  'terceriza-corte',
]

export function CrmPanel({ lead }: { lead: Lead }) {
  const { setStage, setPriority, toggleTag, addTask, toggleTask, removeTask, updateLead, addNote, addReminder, toggleReminder } = useLeadStore()
  const [note, setNote] = useState('')
  const [remDate, setRemDate] = useState('')
  const [remText, setRemText] = useState('')
  const [taskText, setTaskText] = useState('')
  const [tagText, setTagText] = useState('')

  return (
    <div className="space-y-4">
      {/* Pipeline + prioridad */}
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
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-400">Prioridad</p>
          <div className="flex gap-1.5">
            {(['alta', 'media', 'baja'] as const).map((pr) => (
              <button
                key={pr}
                onClick={() => setPriority(lead.id, pr)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset transition-all',
                  lead.priority === pr ? cn(PRIORITY_STYLE[pr], 'scale-105') : 'bg-transparent text-slate-400 ring-white/10 hover:bg-white/5',
                )}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Etiquetas */}
      <Card className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-100">Etiquetas</h4>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {lead.tags.map((t) => (
            <button key={t} onClick={() => toggleTag(lead.id, t)} className="inline-flex items-center gap-1 rounded-full bg-electric-500/15 px-2.5 py-0.5 text-xs font-semibold text-electric-300 ring-1 ring-inset ring-electric-400/30 hover:bg-electric-500/25">
              #{t} x
            </button>
          ))}
          {lead.tags.length === 0 && <span className="text-xs text-slate-500">Sin etiquetas.</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_TAGS.filter((t) => !lead.tags.includes(t)).map((t) => (
            <button key={t} onClick={() => toggleTag(lead.id, t)} className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400 ring-1 ring-inset ring-white/10 hover:bg-white/10">
              + {t}
            </button>
          ))}
          <form
            onSubmit={(e) => { e.preventDefault(); if (tagText.trim()) { toggleTag(lead.id, tagText.trim().toLowerCase()); setTagText('') } }}
            className="inline-flex"
          >
            <input value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="nueva..." className="w-24 rounded-full border border-white/10 bg-base-950/60 px-2.5 py-0.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none" />
          </form>
        </div>
      </Card>

      {/* Tareas */}
      <Card className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-100">Tareas</h4>
        <div className="space-y-2">
          {lead.tasks.length === 0 && <p className="text-xs text-slate-500">Sin tareas.</p>}
          {lead.tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(lead.id, t.id)} className="accent-electric-400" />
              <span className={cn('flex-1', t.done && 'text-slate-500 line-through')}>{t.text}</span>
              {t.dueDate && <span className="text-xs text-slate-500">{formatDate(t.dueDate)}</span>}
              <button onClick={() => removeTask(lead.id, t.id)} className="text-slate-600 hover:text-rose-400">x</button>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); if (taskText.trim()) { addTask(lead.id, taskText.trim()); setTaskText('') } }}
          className="mt-3 flex gap-2"
        >
          <Input placeholder="Nueva tarea..." value={taskText} onChange={(e) => setTaskText(e.target.value)} />
          <Button size="sm" type="submit">+</Button>
        </form>
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
          <Field label="Ultimo contacto">
            <Input
              type="date"
              value={lead.lastContactDate ?? ''}
              onChange={(e) => updateLead(lead.id, { lastContactDate: e.target.value || undefined })}
              className="[color-scheme:dark]"
            />
          </Field>
          <Field label="Proximo seguimiento">
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
          Cotizacion tecnico-comercial enviada
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
          <Input placeholder="Recordatorio..." value={remText} onChange={(e) => setRemText(e.target.value)} />
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
            placeholder="Agregar nota..."
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
          {lead.events.length === 0 && <li className="text-xs text-slate-500">Sin actividad todavia.</li>}
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

const ICON: Record<string, string> = { nota: 'N', contacto: 'C', estado: 'E', sistema: 'S' }
