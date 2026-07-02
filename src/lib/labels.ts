// =====================================================================
// Etiquetas legibles + estilos para enums (presencia, oportunidad, CRM)
// =====================================================================

import type {
  CrmStatus,
  DigitalPresence,
  OpportunityLevel,
} from '../types'

export const DIGITAL_PRESENCE_LABEL: Record<DigitalPresence, string> = {
  'sin-web': 'Sin web',
  'web-vieja': 'Web vieja',
  'web-aceptable': 'Web aceptable',
  'buen-potencial': 'Buen potencial',
}

export const OPPORTUNITY_LABEL: Record<OpportunityLevel, string> = {
  alta: 'Oportunidad alta',
  media: 'Oportunidad media',
  baja: 'Oportunidad baja',
}

export const CRM_STATUS_LABEL: Record<CrmStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  respondio: 'Respondio',
  interesado: 'Interesado',
  reunion: 'Reunion',
  cerrado: 'Cerrado',
  descartado: 'Descartado',
}

/** Orden canonico del pipeline comercial. */
export const CRM_STATUS_ORDER: CrmStatus[] = [
  'nuevo',
  'contactado',
  'respondio',
  'interesado',
  'reunion',
  'cerrado',
  'descartado',
]

/** Clases de color por estado CRM (chips). */
export const CRM_STATUS_STYLE: Record<CrmStatus, string> = {
  nuevo: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
  contactado: 'bg-electric-500/15 text-electric-300 ring-electric-400/30',
  respondio: 'bg-cyan-500/15 text-cyan-300 ring-cyan-400/30',
  interesado: 'bg-violet-500/15 text-violet-300 ring-violet-400/30',
  reunion: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  cerrado: 'bg-opp-high/15 text-emerald-300 ring-emerald-400/30',
  descartado: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
}

/** Clases de color por nivel de oportunidad. */
export const OPPORTUNITY_STYLE: Record<OpportunityLevel, string> = {
  alta: 'bg-opp-high/15 text-emerald-300 ring-emerald-400/30',
  media: 'bg-opp-mid/15 text-amber-300 ring-amber-400/30',
  baja: 'bg-opp-low/15 text-slate-300 ring-slate-400/30',
}

/** Color hex del anillo de score segun nivel (para SVG). */
export const OPPORTUNITY_HEX: Record<OpportunityLevel, string> = {
  alta: '#22c55e',
  media: '#facc15',
  baja: '#94a3b8',
}

export const DIGITAL_PRESENCE_STYLE: Record<DigitalPresence, string> = {
  'sin-web': 'bg-opp-high/15 text-emerald-300 ring-emerald-400/30',
  'web-vieja': 'bg-opp-mid/15 text-amber-300 ring-amber-400/30',
  'web-aceptable': 'bg-electric-500/15 text-electric-300 ring-electric-400/30',
  'buen-potencial': 'bg-opp-low/15 text-slate-300 ring-slate-400/30',
}
