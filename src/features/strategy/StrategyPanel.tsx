import { useMemo, useState } from 'react'
import { Button, Card } from '../../components/ui/primitives'
import { CopyButton } from '../../components/ui/CopyButton'
import { MessagesPanel } from '../messages/MessagesPanel'
import { buildStrategy } from '../../services/ai/companyIntel'
import { formatCurrency } from '../../lib/format'
import type { CommercialStrategy, Lead } from '../../types'

/** Playbook comercial completo, listo para que el vendedor lo use hoy. */
export function StrategyPanel({ lead }: { lead: Lead }) {
  const [strategy, setStrategy] = useState<CommercialStrategy | null>(null)

  const build = () => setStrategy(buildStrategy(lead))

  const fullText = useMemo(() => (strategy ? strategyToText(lead, strategy) : ''), [strategy, lead])

  if (!strategy) {
    return (
      <Card className="p-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-2xl">🎯</div>
        <p className="font-semibold text-slate-100">Preparar estrategia comercial</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
          Generá en un click todo lo que necesitás para venderle a{' '}
          <span className="font-semibold text-slate-200">{lead.name}</span>: mensajes por canal,
          guión de llamada, objeciones con respuesta, beneficios, argumentos y ROI.
        </p>
        <div className="mt-4 flex justify-center">
          <Button size="lg" variant="success" onClick={build}>
            🎯 Preparar estrategia comercial
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-100">Estrategia para {lead.name}</h4>
        <div className="flex gap-2">
          <CopyButton text={fullText} label="Copiar todo" />
          <Button size="sm" variant="ghost" onClick={build}>↻ Regenerar</Button>
        </div>
      </div>

      {/* ROI */}
      <Card className="border-emerald-400/20 bg-emerald-500/[0.06] p-4">
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">ROI estimado</h5>
        <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
          <Stat label="Ahorro mensual" value={formatCurrency(strategy.roi.monthlySaving)} />
          <Stat label="Repago" value={`~${strategy.roi.paybackMonths} meses`} />
          <Stat label="Inversión" value={formatCurrency(lead.machines[0]?.ticketArs ?? lead.potentialValue)} />
        </div>
        <p className="mt-3 text-xs text-slate-400">{strategy.roi.note}</p>
      </Card>

      <Section title="Beneficios específicos" items={strategy.benefits} icon="✅" />
      <Section title="Argumentos comerciales" items={strategy.arguments} icon="📌" />

      {/* Guión de llamada */}
      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h5 className="text-sm font-semibold text-slate-100">Guión de llamada</h5>
          <CopyButton text={strategy.callScript} label="Copiar" />
        </div>
        <pre className="whitespace-pre-wrap rounded-lg bg-base-950/70 p-3 text-xs leading-relaxed text-slate-300">{strategy.callScript}</pre>
      </Card>

      {/* Objeciones */}
      <Card className="p-4">
        <h5 className="mb-3 text-sm font-semibold text-slate-100">Objeciones y respuestas</h5>
        <div className="space-y-3">
          {strategy.objections.map((o) => (
            <div key={o.objection} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-sm font-semibold text-rose-300">“{o.objection}”</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-300/90">
                <span className="font-semibold">Respuesta:</span> {o.response}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Mensajes por canal (reusa el panel existente) */}
      <MessagesPanel lead={lead} />
    </div>
  )
}

function Section({ title, items, icon }: { title: string; items: string[]; icon: string }) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h5 className="text-sm font-semibold text-slate-100">{title}</h5>
        <CopyButton text={items.map((i) => `• ${i}`).join('\n')} label="Copiar" />
      </div>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-300">
            <span className="shrink-0">{icon}</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 py-2">
      <div className="text-base font-bold text-slate-50">{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  )
}

function strategyToText(lead: Lead, s: CommercialStrategy): string {
  const line = (arr: string[]) => arr.map((x) => `• ${x}`).join('\n')
  return [
    `ESTRATEGIA COMERCIAL — ${lead.name} (${lead.category}, ${lead.city})`,
    `Máquina recomendada: ${lead.machines[0]?.name ?? '—'}`,
    ``,
    `ROI: ${s.roi.note}`,
    ``,
    `BENEFICIOS:`,
    line(s.benefits),
    ``,
    `ARGUMENTOS:`,
    line(s.arguments),
    ``,
    `GUIÓN DE LLAMADA:`,
    s.callScript,
    ``,
    `OBJECIONES:`,
    s.objections.map((o) => `- "${o.objection}"\n  → ${o.response}`).join('\n'),
    ``,
    `MENSAJES:`,
    s.messages.map((m) => `[${m.label}]\n${m.text}`).join('\n\n'),
  ].join('\n')
}
