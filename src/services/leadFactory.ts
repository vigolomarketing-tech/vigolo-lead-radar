// =====================================================================
// Fabrica de leads: convierte senales crudas (demo o proveedor real) en
// oportunidades industriales completas para 2GTech3D.
// =====================================================================

import {
  estimateCompanySize,
  estimateIndustrialMaturity,
  estimateMachineTicket,
  recommendMachineForCategory,
} from '../config/machines'
import { computeScore } from '../lib/scoring'
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
  if (score >= 72) return 'alta'
  if (score >= 48) return 'media'
  return 'baja'
}

function initialProbability(score: number, stage: CrmStage): number {
  const stageBoost: Record<CrmStage, number> = {
    nuevo: 0,
    contactado: 8,
    respondio: 18,
    interesado: 32,
    reunion: 45,
    propuesta: 62,
    ganado: 100,
    perdido: 0,
  }
  if (stage === 'ganado') return 100
  if (stage === 'perdido') return 0
  return Math.min(95, Math.round(score * 0.48) + stageBoost[stage])
}

export function buildLead(raw: RawBusiness, createdAt = '2026-07-01'): Lead {
  const province = raw.province ?? 'Buenos Aires'
  const machine = recommendMachineForCategory(raw.category, raw.signals)
  const companySize = estimateCompanySize(raw.category, raw.signals)
  const industrialMaturity = estimateIndustrialMaturity(raw.category, raw.signals)
  const scoring = computeScore(raw.signals, raw.category, province)
  const stage = raw.stage ?? 'nuevo'
  const potentialValue =
    raw.potentialValue ?? estimateMachineTicket(machine, companySize)

  return {
    id: slugify(`${raw.name}-${raw.city ?? raw.zone}`),
    name: raw.name,
    category: raw.category,
    industry: raw.category,
    province,
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
    companySize,
    industrialMaturity,
    recommendedMachineId: machine.id,
    recommendedMachineName: machine.name,
    recommendedMachineCategory: machine.category,
    recommendedMachinePriority: machine.priority,
    recommendedApplications: machine.applications,
    recommendedMaterials: machine.materials,
    purchasePotential: scoring.level,
    ticketRange: machine.ticketRange,
    stage,
    priority: raw.priority ?? priorityFromScore(scoring.score),
    tags: raw.tags ?? [machine.category],
    tasks: [],
    notes: raw.notes ?? '',
    events: raw.notes
      ? [{ id: uid('ev'), at: createdAt, type: 'nota', text: raw.notes }]
      : [],
    reminders: [],
    lastContactDate: raw.lastContactDate,
    nextFollowUpDate: raw.nextFollowUpDate,
    potentialValue,
    closeProbability: initialProbability(scoring.score, stage),
    proposalSent: raw.proposalSent ?? false,
    createdAt,
    source: raw.source ?? 'mock',
  }
}
