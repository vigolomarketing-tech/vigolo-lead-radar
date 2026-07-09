// =====================================================================
// Vigolo Lead Radar — Modelo de dominio (v2 SaaS)
// =====================================================================

export type OpportunityLevel = 'alta' | 'media' | 'baja'

export type DigitalPresence =
  | 'sin-web'
  | 'web-vieja'
  | 'web-aceptable'
  | 'buen-potencial'

/** Pipeline comercial estilo HubSpot. */
export type CrmStage =
  | 'nuevo'
  | 'contactado'
  | 'respondio'
  | 'interesado'
  | 'reunion'
  | 'propuesta'
  | 'ganado'
  | 'perdido'

export type MessageChannel =
  | 'whatsapp'
  | 'instagram'
  | 'email'
  | 'linkedin'
  | 'seguimiento-1'
  | 'seguimiento-2'
  | 'seguimiento-3'
  | 'obj-precio'
  | 'obj-pensarlo'
  | 'obj-ya-tengo-web'
  | 'obj-no-responde'
  | 'quiere-reunion'

/** Prioridad comercial manual. */
export type Priority = 'alta' | 'media' | 'baja'

/** Tarea del CRM. */
export interface Task {
  id: string
  text: string
  done: boolean
  dueDate?: string
}

/** Ubicación normalizada de un negocio. */
export interface GeoLocation {
  lat: number
  lng: number
}

/** Horario simplificado. */
export interface OpeningHours {
  openNow?: boolean
  weekdayText?: string[]
}

/** Señales crudas de un negocio (vienen del provider: mock o Google Places). */
export interface BusinessSignals {
  website?: string
  websiteQuality?: 'vieja' | 'aceptable' | 'moderna'
  instagram?: string
  facebook?: string
  linkedin?: string
  hasActiveInstagram?: boolean
  reviewsCount?: number
  rating?: number
  phone?: string
  whatsapp?: string
  verified?: boolean
  photos?: string[]
}

/** Un factor individual del score, con su aporte y explicación. */
export interface ScoreFactor {
  key: string
  label: string
  points: number // aporte (puede ser negativo)
  detail: string
}

export interface ScoreResult {
  score: number // 1..100
  level: OpportunityLevel
  digitalPresence: DigitalPresence
  factors: ScoreFactor[]
  headline: string // resumen de una línea
}

/** Hallazgo de la auditoría / diagnóstico. */
export interface AuditFinding {
  id: string
  area: 'web' | 'seo' | 'performance' | 'social' | 'confianza' | 'conversion'
  title: string
  status: 'ok' | 'warn' | 'fail'
  priority: 'alta' | 'media' | 'baja'
  impact: string // cómo impacta / por qué pierde clientes
  solution: string // cómo lo resuelve una web nueva
}

/** Comparativa contra un estándar "Vigolo". */
export interface CompetitorDimension {
  dimension: string
  theirs: number // 0..100
  vigolo: number // 0..100
}

/** Informe completo generado por la IA analista. */
export interface AnalysisReport {
  generatedAt: string
  summary: string
  findings: AuditFinding[]
  competitor?: CompetitorDimension[]
  metrics: {
    performance: number
    seo: number
    ux: number
    branding: number
    conversion: number
    mobile: number
    trust: number
  }
}

/** Nota / evento del historial del lead. */
export interface CrmEvent {
  id: string
  at: string // ISO
  type: 'nota' | 'contacto' | 'estado' | 'sistema'
  text: string
}

/** Recordatorio / seguimiento. */
export interface Reminder {
  id: string
  date: string // ISO date
  text: string
  done: boolean
}

/** Lead = negocio potencial con análisis + CRM. */
export interface Lead {
  id: string
  // Identidad del negocio
  name: string
  category: string
  province: string
  city: string
  zone: string // barrio / localidad (compat.)
  address: string
  location?: GeoLocation
  mapsUrl?: string
  openingHours?: OpeningHours
  categories?: string[]

  // Señales + score (calculado)
  signals: BusinessSignals
  score: number
  scoreLevel: OpportunityLevel
  digitalPresence: DigitalPresence
  scoreHeadline: string
  scoreFactors: ScoreFactor[]

  // Análisis IA (opcional hasta que se ejecute "Analizar")
  analysis?: AnalysisReport

  // CRM
  stage: CrmStage
  priority: Priority
  tags: string[]
  tasks: Task[]
  notes: string
  events: CrmEvent[]
  reminders: Reminder[]
  lastContactDate?: string
  nextFollowUpDate?: string
  potentialValue: number // ARS/USD estimado
  closeProbability: number // 0..100
  proposalSent: boolean

  // Metadata
  createdAt: string
  source: 'mock' | 'google'
  placeId?: string // Google Place ID (solo datos reales)
}

// --- Búsqueda / filtros ---
export type LocationKind =
  | 'ciudad'
  | 'barrio'
  | 'provincia'
  | 'pais'
  | 'codigo-postal'

export interface SearchParams {
  nationwide: boolean // "Buscar en toda Argentina"
  province: string // '' = todas
  city: string // '' = todas
  query: string // texto libre de ubicación (barrio, CP, etc.)
  locationKind: LocationKind
  category: string
  radiusKm: number
  minRating: number
  minReviews: number
  openNow: boolean
  hasWebsite: 'any' | 'yes' | 'no'
  hasPhone: boolean
  hasInstagram: boolean
  verifiedOnly: boolean
}

export interface LeadFiltersState {
  query: string
  category: string
  province: string
  city: string
  zone: string
  opportunity: OpportunityLevel | ''
  stage: CrmStage | ''
  priority: Priority | ''
}

export interface DashboardStats {
  total: number
  analyzed: number
  highOpportunity: number
  contacted: number
  interested: number
  won: number
  lost: number
  potentialRevenue: number
  realRevenue: number
  responseRate: number
  closeRate: number
  bestProvince: string
  bestCity: string
  bestZone: string
  bestCategory: string
}

/** Campaña de prospección (ej: "100 Barberías en Córdoba"). */
export interface Campaign {
  id: string
  name: string
  province: string
  city: string
  category: string
  target: number
  createdAt: string
}

/** Metas / objetivos comerciales. */
export interface Goals {
  clientsTarget: number
  revenueTarget: number
}

/** Demo (landing) generada para un negocio. */
export interface Demo {
  id: string
  leadId: string
  leadName: string
  html: string
  createdAt: string
}

export interface GeneratedMessage {
  channel: MessageChannel
  label: string
  text: string
}
