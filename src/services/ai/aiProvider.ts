// =====================================================================
// AI Provider: fachada para análisis / mensajes / asesor.
//  - 'mock'   → usa el analista local (determinístico, offline).
//  - 'openai' → delega en el backend/proxy (VITE_API_BASE_URL) que llama
//               a OpenAI con la key guardada del lado del servidor.
// La UI siempre usa estas funciones; cambiar de provider no toca la UI.
// =====================================================================

import { PROVIDERS } from '../../config/app'
import {
  advisorAnswer,
  allMessages,
  analyzeLead,
  messageFor,
  type AdvisorContext,
} from './localAnalyst'
import type {
  AnalysisReport,
  GeneratedMessage,
  Lead,
  MessageChannel,
} from '../../types'

const useOpenAI = PROVIDERS.ai === 'openai' && Boolean(PROVIDERS.apiBaseUrl)

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${PROVIDERS.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`IA backend respondió ${res.status}`)
  return res.json() as Promise<T>
}

/** Valida que el informe del backend tenga la forma mínima esperada. */
function isValidReport(r: unknown): r is AnalysisReport {
  const rep = r as AnalysisReport
  return Boolean(
    rep &&
      typeof rep.summary === 'string' &&
      Array.isArray(rep.findings) &&
      rep.metrics &&
      typeof rep.metrics.performance === 'number',
  )
}

/** Analiza un negocio y devuelve el informe (web, GBP, redes). */
export async function aiAnalyze(lead: Lead): Promise<AnalysisReport> {
  await new Promise((r) => setTimeout(r, 500)) // UX "pensando..."
  if (useOpenAI) {
    try {
      const report = await post<AnalysisReport>('/ai/analyze', { lead })
      // Si el backend devuelve algo incompleto, completamos con el análisis
      // local para que la UI nunca se rompa.
      if (isValidReport(report)) {
        const local = analyzeLead(lead)
        return { ...local, ...report, competitor: report.competitor ?? local.competitor }
      }
      return analyzeLead(lead)
    } catch {
      return analyzeLead(lead) // fallback resiliente
    }
  }
  return analyzeLead(lead)
}

export async function aiMessage(
  lead: Lead,
  channel: MessageChannel,
): Promise<string> {
  if (useOpenAI) {
    try {
      const r = await post<{ text: string }>('/ai/message', { lead, channel })
      return r.text
    } catch {
      return messageFor(lead, channel)
    }
  }
  return messageFor(lead, channel)
}

export async function aiAllMessages(lead: Lead): Promise<GeneratedMessage[]> {
  await new Promise((r) => setTimeout(r, 350))
  if (useOpenAI) {
    try {
      return await post<GeneratedMessage[]>('/ai/messages', { lead })
    } catch {
      return allMessages(lead)
    }
  }
  return allMessages(lead)
}

export async function aiAdvisor(
  question: string,
  ctx: AdvisorContext,
): Promise<string> {
  await new Promise((r) => setTimeout(r, 450))
  if (useOpenAI) {
    try {
      const r = await post<{ answer: string }>('/ai/advisor', {
        question,
        leads: ctx.leads,
      })
      return r.answer
    } catch {
      return advisorAnswer(question, ctx)
    }
  }
  return advisorAnswer(question, ctx)
}

export const activeAiProvider = PROVIDERS.ai
