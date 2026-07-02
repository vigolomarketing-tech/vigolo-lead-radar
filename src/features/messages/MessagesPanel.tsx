import { useEffect, useState } from 'react'
import { Button, Card, Spinner } from '../../components/ui/primitives'
import { CopyButton } from '../../components/ui/CopyButton'
import { aiAllMessages } from '../../services/ai/aiProvider'
import { cn } from '../../utils/cn'
import type { GeneratedMessage, Lead } from '../../types'

export function MessagesPanel({ lead }: { lead: Lead }) {
  const [messages, setMessages] = useState<GeneratedMessage[]>([])
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMessages([])
    setActive(0)
  }, [lead.id])

  const generate = async () => {
    setLoading(true)
    try {
      setMessages(await aiAllMessages(lead))
      setActive(0)
    } finally {
      setLoading(false)
    }
  }

  const current = messages[active]

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">IA Comercial</h4>
          <p className="text-xs text-slate-500">12 variantes con tono argentino. Solo copiar y pegar (no se envían solos).</p>
        </div>
        <Button size="sm" onClick={generate} disabled={loading}>
          {loading ? <Spinner /> : messages.length ? '↻ Regenerar' : '✨ Generar'}
        </Button>
      </div>

      {messages.length === 0 && !loading && (
        <p className="rounded-lg bg-white/5 px-3 py-6 text-center text-xs text-slate-400">
          Generá los mensajes personalizados para <span className="font-semibold text-slate-200">{lead.name}</span>.
        </p>
      )}

      {messages.length > 0 && (
        <>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {messages.map((m, i) => (
              <button
                key={m.channel}
                onClick={() => setActive(i)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                  i === active ? 'bg-electric-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10',
                )}
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
                <span className="text-xs text-slate-500">{current.text.length} caracteres</span>
                <CopyButton text={current.text} label="Copiar" />
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
