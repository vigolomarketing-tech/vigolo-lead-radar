// =====================================================================
// Parser de comandos del Asesor IA: traduce lenguaje natural a filtros o
// campanas comerciales industriales.
// =====================================================================

import { CATEGORIES, PROVINCES } from '../config/argentina'
import { MACHINES } from '../config/machines'
import type { LeadFiltersState } from '../types'

function norm(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export interface ParsedCommand {
  type: 'filter' | 'campaign' | 'none'
  filters?: Partial<LeadFiltersState>
  campaign?: { province: string; city: string; category: string; recommendedMachine: string; target: number }
  label: string
}

function matchProvince(q: string): string {
  const n = norm(q)
  return PROVINCES.find((p) => n.includes(norm(p))) ?? ''
}

function matchCategory(q: string): string {
  const n = norm(q)
  return (
    CATEGORIES.find((c) => n.includes(norm(c))) ??
    CATEGORIES.find((c) => n.includes(norm(c).replace(/s$/, ''))) ??
    ''
  )
}

function matchMachine(q: string): string {
  const n = norm(q)
  const machine = MACHINES.find((m) =>
    [
      m.name,
      m.category,
      m.sku ?? '',
      ...m.keywords,
      ...m.targetIndustries,
    ].some((term) => term && n.includes(norm(term))),
  )
  return machine?.id ?? ''
}

export function parseCommand(question: string): ParsedCommand {
  const n = norm(question)
  const province = matchProvince(question)
  const category = matchCategory(question)
  const recommendedMachine = matchMachine(question)
  const wantsCampaign = /campan|campana|campaign/.test(n)
  const highOpp = /alta|oportunidad|caliente|probabilidad|prioridad/.test(n)
  const targetMatch = n.match(/(\d{2,4})/)
  const target = targetMatch ? Math.min(500, Number(targetMatch[1])) : 100

  if (wantsCampaign && (province || category || recommendedMachine)) {
    return {
      type: 'campaign',
      campaign: { province, city: '', category, recommendedMachine, target },
      label: `Crear campana "${target} ${category || 'oportunidades'}${province ? ' en ' + province : ''}"`,
    }
  }

  if (province || category || recommendedMachine || highOpp) {
    const filters: Partial<LeadFiltersState> = {
      query: '',
      province,
      category,
      recommendedMachine,
      opportunity: highOpp ? 'alta' : '',
      minScore: highOpp ? 72 : 0,
      stage: '',
      priority: '',
      city: '',
      zone: '',
    }
    const parts = [
      category || 'empresas industriales',
      province && `en ${province}`,
      recommendedMachine && 'por maquina recomendada',
      highOpp && 'de alta oportunidad',
    ].filter(Boolean)
    return {
      type: 'filter',
      filters,
      label: `Ver ${parts.join(' ')}`,
    }
  }

  return { type: 'none', label: '' }
}
