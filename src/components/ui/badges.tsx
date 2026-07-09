import { Badge } from './primitives'
import { levelFromScore } from '../../lib/scoring'
import {
  CRM_STAGE_LABEL,
  CRM_STAGE_STYLE,
  DIGITAL_PRESENCE_LABEL,
  DIGITAL_PRESENCE_STYLE,
  OPPORTUNITY_LABEL,
  OPPORTUNITY_STYLE,
} from '../../lib/labels'
import type { CrmStage, DigitalPresence, Priority } from '../../types'

const PRIORITY_STYLE: Record<Priority, string> = {
  alta: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
  media: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  baja: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={PRIORITY_STYLE[priority]} title="Prioridad">🚩 {priority}</Badge>
}

export function OpportunityBadge({ score }: { score: number }) {
  const lvl = levelFromScore(score)
  return <Badge className={OPPORTUNITY_STYLE[lvl]}>{OPPORTUNITY_LABEL[lvl]}</Badge>
}

export function PresenceBadge({ presence }: { presence: DigitalPresence }) {
  return <Badge className={DIGITAL_PRESENCE_STYLE[presence]}>{DIGITAL_PRESENCE_LABEL[presence]}</Badge>
}

export function StageBadge({ stage }: { stage: CrmStage }) {
  return <Badge className={CRM_STAGE_STYLE[stage]}>{CRM_STAGE_LABEL[stage]}</Badge>
}

/** Indica claramente el origen del dato: 🟢 Google real / 🟡 Demo. */
export function SourceBadge({ source }: { source: 'mock' | 'google' }) {
  return source === 'google' ? (
    <Badge
      className="bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
      title="Datos reales obtenidos de Google Places"
    >
      🟢 Datos reales de Google
    </Badge>
  ) : (
    <Badge
      className="bg-amber-500/15 text-amber-300 ring-amber-400/30"
      title="Datos de demostración (no reales)"
    >
      🟡 Datos demo
    </Badge>
  )
}
