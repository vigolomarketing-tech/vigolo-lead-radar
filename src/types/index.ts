// =====================================================================
// 2GTech3D Lead Radar — Modelo de dominio
// Herramienta para detectar empresas argentinas que podrían comprar las
// máquinas láser/CNC de 2GTech3D (corte fibra, grabado fibra, CO2).
// =====================================================================

export type OpportunityLevel = 'alta' | 'media' | 'baja'

/**
 * Ajuste de la empresa con las máquinas 2GTech3D según su rubro y actividad.
 *  - 'ideal'        : el rubro USA directamente estas máquinas (metalúrgica,
 *                     cartelería, herrería…). Máxima probabilidad de compra.
 *  - 'alto'         : rubro que se beneficia mucho (muebles, marmolería…).
 *  - 'medio'        : podría incorporarla para diferenciarse.
 *  - 'exploratorio' : encaje indirecto / a validar antes de invertir tiempo.
 */
export type MachineFit = 'ideal' | 'alto' | 'medio' | 'exploratorio'

/** Línea de producto de 2GTech3D. */
export type MachineLine =
  | 'laser-fibra' // corte de metal / chapa
  | 'grabadora-fibra' // grabado metal y piedra
  | 'co2' // corte y grabado de madera, MDF, acrílico, cuero, tela
  | 'construccion' // vibradores de hormigón, andamios

/** Máquina recomendada para un lead (con motivo y ticket estimado). */
export interface MachineMatch {
  machineId: string
  name: string
  line: MachineLine
  ticketArs: number
  reason: string
}

/** Nivel de urgencia comercial del lead. */
export type UrgencyLevel = 'alta' | 'media' | 'baja'

export interface Urgency {
  level: UrgencyLevel
  reason: string
}

/** ROI estimado de incorporar la máquina. */
export interface RoiEstimate {
  /** Gasto mensual estimado en tercerización / costo evitable (ARS). */
  monthlySaving: number
  /** Meses aproximados de repago. */
  paybackMonths: number
  note: string
}

/**
 * Inteligencia inferida de la empresa a partir de su rubro + señales.
 * Análisis específico (no genérico) para calificar y abordar el lead.
 */
export interface CompanyIntel {
  fabricates: string // qué fabrica / a qué se dedica
  materials: string[] // materiales que usa
  processes: string[] // procesos que realiza
  productionType: string // tipo de producción (unitaria, serie, lote…)
  likelyMachinery: string[] // maquinaria que probablemente ya usa
  opportunities: string[] // oportunidades de mejora detectadas
  recommendedMachine?: MachineMatch
  whyThisMachine: string // por qué esa máquina
  reasonToBuy: string // razón de compra específica
  urgency: Urgency
  roi: RoiEstimate
  sizeLabel: string // tamaño estimado (Pyme, mediana, grande…)
}

/** Playbook comercial generado para un lead. */
export interface CommercialStrategy {
  benefits: string[]
  arguments: string[]
  objections: { objection: string; response: string }[]
  callScript: string
  roi: RoiEstimate
  messages: GeneratedMessage[]
}

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
  | 'obj-tercerizo'
  | 'obj-ya-tengo'
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
  email?: string
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
  machineFit: MachineFit
  machines: MachineMatch[]
  factors: ScoreFactor[]
  headline: string // resumen de una línea
}

/** Señal de oportunidad de la evaluación / diagnóstico. */
export interface AuditFinding {
  id: string
  area: 'produccion' | 'costos' | 'capacidad' | 'calidad' | 'demanda' | 'competencia' | 'material'
  title: string
  status: 'ok' | 'warn' | 'fail'
  priority: 'alta' | 'media' | 'baja'
  impact: string // por qué le conviene / qué problema tiene hoy
  solution: string // cómo lo resuelve una máquina 2GTech3D
}

/** Comparativa: capacidad actual vs. con una máquina 2GTech3D. */
export interface CompetitorDimension {
  dimension: string
  theirs: number // 0..100 (situación actual)
  conMaquina: number // 0..100 (con la máquina 2GTech3D)
}

/** Informe completo generado por la IA analista. */
export interface AnalysisReport {
  generatedAt: string
  summary: string
  findings: AuditFinding[]
  competitor?: CompetitorDimension[]
  metrics: {
    ajusteRubro: number
    volumen: number
    capacidadPago: number
    urgencia: number
    contactabilidad: number
    competencia: number
    tamano: number
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

/** Lead = empresa potencial con análisis + CRM. */
export interface Lead {
  id: string
  // Identidad de la empresa
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
  machineFit: MachineFit
  machines: MachineMatch[]
  scoreHeadline: string
  scoreFactors: ScoreFactor[]
  /** Razón de compra específica (por qué necesitaría la máquina). */
  reasonToBuy: string
  /** Nivel de urgencia comercial + explicación. */
  urgency: Urgency

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
  potentialValue: number // ARS estimado (máquina recomendada)
  closeProbability: number // 0..100
  proposalSent: boolean

  // Metadata
  createdAt: string
  source: 'mock' | 'google'
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
  urgency: UrgencyLevel | ''
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

/** Campaña de prospección (ej: "50 Metalúrgicas en Córdoba"). */
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

/** Ficha técnica (one-pager) generada para un lead. */
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
