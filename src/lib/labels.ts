import type {
  CrmStage,
  MachineFit,
  OpportunityLevel,
  UrgencyLevel,
} from '../types'

export const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  alta: 'Urgencia alta',
  media: 'Urgencia media',
  baja: 'Urgencia baja',
}

export const URGENCY_STYLE: Record<UrgencyLevel, string> = {
  alta: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
  media: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  baja: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
}

export const URGENCY_ICON: Record<UrgencyLevel, string> = {
  alta: '🔥',
  media: '⚡',
  baja: '💤',
}

export const MACHINE_FIT_LABEL: Record<MachineFit, string> = {
  ideal: 'Rubro ideal',
  alto: 'Encaje alto',
  medio: 'Encaje medio',
  exploratorio: 'A validar',
}

export const MACHINE_FIT_STYLE: Record<MachineFit, string> = {
  ideal: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  alto: 'bg-electric-500/15 text-electric-300 ring-electric-400/30',
  medio: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  exploratorio: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
}

export const OPPORTUNITY_LABEL: Record<OpportunityLevel, string> = {
  alta: 'Oportunidad alta',
  media: 'Oportunidad media',
  baja: 'Oportunidad baja',
}

export const OPPORTUNITY_HEX: Record<OpportunityLevel, string> = {
  alta: '#34d399',
  media: '#fbbf24',
  baja: '#94a3b8',
}

export const OPPORTUNITY_STYLE: Record<OpportunityLevel, string> = {
  alta: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  media: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  baja: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
}

export const CRM_STAGE_LABEL: Record<CrmStage, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  respondio: 'Respondió',
  interesado: 'Interesado',
  reunion: 'Reunión',
  propuesta: 'Propuesta',
  ganado: 'Ganado',
  perdido: 'Perdido',
}

export const CRM_STAGE_ORDER: CrmStage[] = [
  'nuevo',
  'contactado',
  'respondio',
  'interesado',
  'reunion',
  'propuesta',
  'ganado',
  'perdido',
]

export const CRM_STAGE_ACCENT: Record<CrmStage, string> = {
  nuevo: '#94a3b8',
  contactado: '#3EA6FF',
  respondio: '#22d3ee',
  interesado: '#a78bfa',
  reunion: '#fbbf24',
  propuesta: '#f472b6',
  ganado: '#34d399',
  perdido: '#fb7185',
}

export const CRM_STAGE_STYLE: Record<CrmStage, string> = {
  nuevo: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
  contactado: 'bg-electric-500/15 text-electric-300 ring-electric-400/30',
  respondio: 'bg-cyan-500/15 text-cyan-300 ring-cyan-400/30',
  interesado: 'bg-violet-500/15 text-violet-300 ring-violet-400/30',
  reunion: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  propuesta: 'bg-pink-500/15 text-pink-300 ring-pink-400/30',
  ganado: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  perdido: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
}
