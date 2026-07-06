// =====================================================================
// Fábrica de Leads: convierte señales crudas (mock o Google) en un Lead
// completo con score + valores de CRM por defecto. Fuente única de verdad.
// =====================================================================

import { DEFAULT_TICKET } from '../config/app'
import { computeScore, isHighIntentCategory } from '../lib/scoring'
import { slugify, uid } from '../lib/id'
import type { BusinessSignals, CrmStage, GeoLocation, Lead, Priority } from '../types'

export interface RawBusiness {
  name: string
  category: string
  province?: string
  city?: string
  zone: string
  address: string
  location?: GeoLocation
  mapsUrl?: string
  categories?: string[]
  openNow?: boolean
  signals: BusinessSignals
  source?: 'mock' | 'google'
  // Estado inicial opcional (para poblar la demo)
  stage?: CrmStage
  priority?: Priority
  tags?: string[]
  notes?: string
  lastContactDate?: string
  nextFollowUpDate?: string
  proposalSent?: boolean
  potentialValue?: number
}

function priorityFromScore(score: number): Priority {
  if (score >= 70) return 'alta'
  if (score >= 45) return 'media'
  return 'baja'
}

/** Estima el valor potencial de venta según rubro + oportunidad. */
function estimateValue(category: string, score: number): number {
  const base = isHighIntentCategory(category) ? DEFAULT_TICKET * 1.4 : DEFAULT_TICKET
  const multiplier = 0.7 + (score / 100) * 0.9 // 0.7 .. 1.6
  return Math.round((base * multiplier) / 50) * 50
}

/** Probabilidad de cierre inicial derivada del score. */
function initialProbability(score: number, stage: CrmStage): number {
  const stageBoost: Record<CrmStage, number> = {
    nuevo: 0,
    contactado: 8,
    respondio: 18,
    interesado: 32,
    reunion: 45,
    propuesta: 60,
    ganado: 100,
    perdido: 0,
  }
  return Math.min(95, Math.round(score * 0.5) + stageBoost[stage])
}

export function buildLead(raw: RawBusiness, createdAt = '2026-07-01'): Lead {
  const scoring = computeScore(raw.signals, raw.category)
  const stage = raw.stage ?? 'nuevo'
  return {
    id: slugify(`${raw.name}-${raw.city ?? raw.zone}`),
    name: raw.name,
    category: raw.category,
    province: raw.province ?? 'Buenos Aires',
    city: raw.city ?? raw.zone,
    zone: raw.zone,
    address: raw.address,
    location: raw.location,
    mapsUrl:
      raw.mapsUrl ??
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${raw.name} ${raw.address}`,
      )}`,
    openingHours: raw.openNow !== undefined ? { openNow: raw.openNow } : undefined,
    categories: raw.categories,
    signals: raw.signals,
    score: scoring.score,
    scoreLevel: scoring.level,
    digitalPresence: scoring.digitalPresence,
    scoreHeadline: scoring.headline,
    scoreFactors: scoring.factors,
    stage,
    priority: raw.priority ?? priorityFromScore(scoring.score),
    tags: raw.tags ?? [],
    tasks: [],
    notes: raw.notes ?? '',
    events: raw.notes
      ? [{ id: uid('ev'), at: createdAt, type: 'nota', text: raw.notes }]
      : [],
    reminders: [],
    lastContactDate: raw.lastContactDate,
    nextFollowUpDate: raw.nextFollowUpDate,
    potentialValue: raw.potentialValue ?? estimateValue(raw.category, scoring.score),
    closeProbability: initialProbability(scoring.score, stage),
    proposalSent: raw.proposalSent ?? false,
    createdAt,
    source: raw.source ?? 'mock',
  }
}
