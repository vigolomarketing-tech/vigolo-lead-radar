// =====================================================================
// Parser de comandos del Panel IA: interpreta pedidos en lenguaje natural
// y los traduce en acciones concretas (filtrar leads, crear campaña).
// =====================================================================

import { CATEGORIES, PROVINCES } from '../config/argentina'
import type { LeadFiltersState } from '../types'

function norm(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export interface ParsedCommand {
  type: 'filter' | 'campaign' | 'none'
  filters?: Partial<LeadFiltersState>
  campaign?: { province: string; city: string; category: string; target: number }
  label: string
}

function matchProvince(q: string): string {
  const n = norm(q)
  return PROVINCES.find((p) => n.includes(norm(p))) ?? ''
}
function matchCategory(q: string): string {
  const n = norm(q)
  // singular/plural tolerante
  return (
    CATEGORIES.find((c) => n.includes(norm(c))) ??
    CATEGORIES.find((c) => n.includes(norm(c).replace(/s$/, ''))) ??
    ''
  )
}

export function parseCommand(question: string): ParsedCommand {
  const n = norm(question)
  const province = matchProvince(question)
  const category = matchCategory(question)
  const wantsCampaign = /campan|campana|campaign/.test(n)
  const noWeb = /sin web|no tiene web|sin pagina|sin sitio/.test(n)
  const highOpp = /alta|oportunidad|caliente|probabilidad/.test(n)
  const targetMatch = n.match(/(\d{2,4})/)
  const target = targetMatch ? Math.min(500, Number(targetMatch[1])) : 100

  if (wantsCampaign && (province || category)) {
    return {
      type: 'campaign',
      campaign: { province, city: '', category, target },
      label: `Crear campaña "${target} ${category || 'negocios'}${province ? ' en ' + province : ''}"`,
    }
  }

  if (province || category || noWeb || highOpp) {
    const filters: Partial<LeadFiltersState> = {
      query: '',
      province,
      category,
      opportunity: highOpp ? 'alta' : '',
      stage: '',
      priority: '',
      city: '',
    }
    const parts = [
      category || 'negocios',
      province && `en ${province}`,
      noWeb && '(sin web)',
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
