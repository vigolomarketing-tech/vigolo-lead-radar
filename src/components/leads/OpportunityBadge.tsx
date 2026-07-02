import { Badge } from '../ui/Badge'
import { opportunityLevel } from '../../lib/scoring'
import {
  DIGITAL_PRESENCE_LABEL,
  DIGITAL_PRESENCE_STYLE,
  OPPORTUNITY_LABEL,
  OPPORTUNITY_STYLE,
} from '../../lib/labels'
import type { DigitalPresence } from '../../types'

export function OpportunityBadge({ score }: { score: number }) {
  const level = opportunityLevel(score)
  return <Badge className={OPPORTUNITY_STYLE[level]}>{OPPORTUNITY_LABEL[level]}</Badge>
}

export function PresenceBadge({ presence }: { presence: DigitalPresence }) {
  return (
    <Badge className={DIGITAL_PRESENCE_STYLE[presence]}>
      {DIGITAL_PRESENCE_LABEL[presence]}
    </Badge>
  )
}
