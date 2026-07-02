// =====================================================================
// Tipos centrales de Vigolo Lead Radar
// =====================================================================

/** Estado de la presencia digital detectada para un negocio. */
export type DigitalPresence =
  | 'sin-web'
  | 'web-vieja'
  | 'web-aceptable'
  | 'buen-potencial'

/** Nivel de oportunidad derivado del puntaje. */
export type OpportunityLevel = 'alta' | 'media' | 'baja'

/** Estados del CRM comercial. */
export type CrmStatus =
  | 'nuevo'
  | 'contactado'
  | 'respondio'
  | 'interesado'
  | 'reunion'
  | 'cerrado'
  | 'descartado'

/** Canales soportados por el generador de mensajes. */
export type MessageChannel = 'whatsapp' | 'instagram' | 'email' | 'seguimiento'

/**
 * Lead = negocio potencial detectado en un sondeo.
 * Combina datos "de fuente" (Google Places / mock) con datos "de CRM"
 * que el usuario edita manualmente.
 */
export interface Lead {
  id: string

  // --- Datos del negocio ---
  name: string
  category: string // rubro
  zone: string // zona / barrio
  address: string
  phone?: string
  whatsapp?: string
  website?: string
  instagram?: string

  // --- Senales usadas para el scoring ---
  reviewsCount?: number // cantidad de resenas en Google Business
  rating?: number // puntuacion promedio (0-5)
  hasActiveInstagram?: boolean

  // --- Analisis de oportunidad (calculado) ---
  digitalPresence: DigitalPresence
  score: number // 1-100
  scoreReason: string

  // --- CRM ---
  crmStatus: CrmStatus
  notes: string
  lastContactDate?: string // ISO date
  nextFollowUpDate?: string // ISO date

  // --- Metadata ---
  createdAt: string // ISO date
  source: 'mock' | 'google'
}

/** Parametros de un sondeo por zona + rubro. */
export interface SearchParams {
  zone: string
  category: string
}

/** Filtros aplicados sobre la lista de leads. */
export interface LeadFiltersState {
  query: string // buscador por nombre
  category: string // '' = todos
  zone: string // '' = todos
  opportunity: OpportunityLevel | '' // '' = todos
  status: CrmStatus | '' // '' = todos
}

/** Estadisticas agregadas para el dashboard. */
export interface DashboardStats {
  total: number
  highOpportunity: number
  contacted: number
  interested: number
  closed: number
}

/** Un mensaje generado listo para copiar y pegar. */
export interface GeneratedMessage {
  channel: MessageChannel
  label: string
  text: string
}
