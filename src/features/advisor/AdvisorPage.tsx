import { useRef, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Button, Card, Input, Spinner } from '../../components/ui/primitives'
import { aiAdvisor } from '../../services/ai/aiProvider'
import { useLeadStore } from '../../store/useLeadStore'
import { cn } from '../../utils/cn'

interface Msg {
  role: 'user' | 'ai'
  text: string
}

const SUGGESTIONS = [
  '¿Qué negocio conviene contactar primero?',
  '¿Qué zona tiene mejores oportunidades?',
  '¿Qué rubro está funcionando mejor?',
  '¿Qué precio recomendarías?',
  '¿Cómo le vendería una web / respondo objeciones?',
]

export function AdvisorPage() {
  const leads = useLeadStore((s) => s.leads)
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'ai',
      text: 'Soy tu Asesor IA comercial. Analizo tus leads y te ayudo a priorizar, definir precios y responder objeciones. Preguntame lo que quieras 👇',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const ask = async (question: string) => {
    if (!question.trim() || loading) return
    setMessages((m) => [...m, { role: 'user', text: question }])
    setInput('')
    setLoading(true)
    try {
      const answer = await aiAdvisor(question, { leads })
      setMessages((m) => [...m, { role: 'ai', text: answer }])
    } finally {
      setLoading(false)
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }))
    }
  }

  return (
    <AppShell title="Asesor IA" subtitle="Tu consultor comercial impulsado por IA">
      <Card className="flex h-[70vh] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-electric-500 text-white'
                    : 'bg-white/5 text-slate-200 ring-1 ring-inset ring-white/10',
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white/5 px-4 py-2.5 ring-1 ring-inset ring-white/10">
                <Spinner />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 ring-1 ring-inset ring-white/10 hover:bg-white/10"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
            className="flex gap-2"
          >
            <Input placeholder="Escribí tu pregunta…" value={input} onChange={(e) => setInput(e.target.value)} />
            <Button type="submit" disabled={loading || !input.trim()}>Enviar</Button>
          </form>
        </div>
      </Card>
    </AppShell>
  )
}
