import { Badge } from '../ui/Badge'
import { CRM_STATUS_LABEL, CRM_STATUS_STYLE } from '../../lib/labels'
import type { CrmStatus } from '../../types'

export function StatusBadge({ status }: { status: CrmStatus }) {
  return (
    <Badge className={CRM_STATUS_STYLE[status]}>{CRM_STATUS_LABEL[status]}</Badge>
  )
}
