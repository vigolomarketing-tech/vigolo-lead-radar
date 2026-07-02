import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { CopyButton } from '../ui/CopyButton'
import { generateAllMessages } from '../../services/aiService'
import type { GeneratedMessage, Lead } from '../../types'

/**
 * Genera las 4 variantes de mensaje (WhatsApp, Instagram, Email, Seguimiento)
 * para un lead. Solo produce texto para copiar y pegar; NO envia nada.
 */
export function MessageGenerator({ lead }: { lead: Lead }) {
  const [messages, setMessages] = useState<GeneratedMessage[]>([])
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const result = await generateAllMessages(lead)
      setMessages(result)
      setActive(0)
    } finally {
      setLoading(false)
    }
  }

  // Regenera al cambiar de lead para que el texto quede personalizado.
  useEffect(() => {
    setMessages([])
    setActive(0)
  }, [lead.id])

  const current = messages[active]

  return (
    <div className="rounded-xl border border-white/10 bg-base-950/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">
            Mensajes de prospección
          </h4>
          <p className="text-xs text-slate-500">
            Generados con IA. Se copian y pegan a mano (no se envían solos).
          </p>
        </div>
        <Button size="sm" onClick={generate} disabled={loading}>
          {loading
            ? 'Generando...'
            : messages.length
              ? '↻ Regenerar'
              : '✨ Generar mensajes'}
        </Button>
      </div>

      {messages.length === 0 && !loading && (
        <p className="rounded-lg bg-white/5 px-3 py-6 text-center text-xs text-slate-400">
          Apretá <span className="font-semibold text-electric-300">Generar mensajes</span>{' '}
          para crear las 4 variantes para {lead.name}.
        </p>
      )}

      {messages.length > 0 && (
        <>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {messages.map((m, i) => (
              <button
                key={m.channel}
                onClick={() => setActive(i)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  i === active
                    ? 'bg-electric-500 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {current && (
            <div className="rounded-lg border border-white/10 bg-base-950/70">
              <textarea
                readOnly
                value={current.text}
                rows={current.channel === 'email' ? 12 : 6}
                className="w-full resize-none rounded-t-lg bg-transparent p-3 text-sm leading-relaxed text-slate-200 focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
                <span className="text-xs text-slate-500">
                  {current.text.length} caracteres
                </span>
                <CopyButton text={current.text} label="Copiar mensaje" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
