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
import type { CrmStage, DigitalPresence } from '../../types'

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
