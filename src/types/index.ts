// =====================================================================
// 2GTech3D Lead Radar - Modelo de dominio industrial
// =====================================================================

export type OpportunityLevel = 'alta' | 'media' | 'baja'

export type DigitalPresence =
  | 'sin-web'
  | 'web-vieja'
  | 'web-aceptable'
  | 'buen-potencial'

export type CompanySize = 'micro' | 'pyme' | 'industrial' | 'gran-industria'

export type IndustrialMaturity =
  | 'artesanal'
  | 'semi-industrial'
  | 'industrial'
  | 'alta-produccion'

export type MachinePriority = 'critica' | 'alta' | 'media' | 'baja'

/** Pipeline comercial estilo HubSpot, adaptado a venta consultiva B2B. */
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
  | 'obj-ya-tengo-maquina'
  | 'obj-no-responde'
  | 'quiere-reunion'

export type Priority = 'alta' | 'media' | 'baja'

export interface Task {
  id: string
  text: string
  done: boolean
  dueDate?: string
}

export interface GeoLocation {
  lat: number
  lng: number
}

export interface OpeningHours {
  openNow?: boolean
  weekdayText?: string[]
}

/** Senales crudas de una empresa industrial. */
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

  companySize?: CompanySize
  industrialMaturity?: IndustrialMaturity
  currentMachinery?: string[]
  materials?: string[]
  productionSignals?: string[]
  hasCnc?: boolean
  hasLaser?: boolean
  exportsOrLargeClients?: boolean
}

export interface ScoreFactor {
  key: string
  label: string
  points: number
  detail: string
}

export interface ScoreResult {
  score: number // 0..100
  level: OpportunityLevel
  digitalPresence: DigitalPresence
  factors: ScoreFactor[]
  headline: string
}

export interface AuditFinding {
  id: string
  area:
    | 'maquina'
    | 'produccion'
    | 'materiales'
    | 'financiacion'
    | 'contacto'
    | 'ubicacion'
    | 'competencia'
  title: string
  status: 'ok' | 'warn' | 'fail'
  priority: 'alta' | 'media' | 'baja'
  impact: string
  solution: string
}

export interface CompetitorDimension {
  dimension: string
  theirs: number
  target: number
}

export interface AnalysisReport {
  generatedAt: string
  summary: string
  findings: AuditFinding[]
  competitor?: CompetitorDimension[]
  metrics: {
    machineFit: number
    industrialNeed: number
    productionScale: number
    materialFit: number
    budgetFit: number
    urgency: number
    contactability: number
  }
}

export interface CrmEvent {
  id: string
  at: string
  type: 'nota' | 'contacto' | 'estado' | 'sistema'
  text: string
}

export interface Reminder {
  id: string
  date: string
  text: string
  done: boolean
}

export interface Lead {
  id: string
  name: string
  category: string
  industry: string
  province: string
  city: string
  zone: string
  address: string
  location?: GeoLocation
  mapsUrl?: string
  openingHours?: OpeningHours
  categories?: string[]

  signals: BusinessSignals
  score: number
  scoreLevel: OpportunityLevel
  digitalPresence: DigitalPresence
  scoreHeadline: string
  scoreFactors: ScoreFactor[]

  companySize: CompanySize
  industrialMaturity: IndustrialMaturity
  recommendedMachineId: string
  recommendedMachineName: string
  recommendedMachineCategory: string
  recommendedMachinePriority: MachinePriority
  recommendedApplications: string[]
  recommendedMaterials: string[]
  purchasePotential: OpportunityLevel
  ticketRange: string

  analysis?: AnalysisReport

  stage: CrmStage
  priority: Priority
  tags: string[]
  tasks: Task[]
  notes: string
  events: CrmEvent[]
  reminders: Reminder[]
  lastContactDate?: string
  nextFollowUpDate?: string
  potentialValue: number
  closeProbability: number
  proposalSent: boolean

  createdAt: string
  source: 'mock' | 'google'
}

export type LocationKind =
  | 'ciudad'
  | 'barrio'
  | 'provincia'
  | 'pais'
  | 'codigo-postal'

export interface SearchParams {
  nationwide: boolean
  province: string
  city: string
  query: string
  locationKind: LocationKind
  category: string
  recommendedMachine: string
  minScore: number
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
  recommendedMachine: string
  province: string
  city: string
  zone: string
  opportunity: OpportunityLevel | ''
  minScore: number
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
  bestMachine: string
  bestIndustry: string
}

export interface Campaign {
  id: string
  name: string
  province: string
  city: string
  category: string
  recommendedMachine: string
  target: number
  createdAt: string
}

export interface Goals {
  clientsTarget: number
  revenueTarget: number
}

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
