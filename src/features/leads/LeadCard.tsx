import { ScoreRing } from '../../components/ui/ScoreRing'
import { OpportunityBadge, PresenceBadge, SourceBadge, StageBadge } from '../../components/ui/badges'
import { Card } from '../../components/ui/primitives'
import { formatCurrency } from '../../lib/format'
import { useLeadStore } from '../../store/useLeadStore'
import type { Lead } from '../../types'

export function LeadCard({ lead }: { lead: Lead }) {
  const select = useLeadStore((s) => s.select)
  return (
    <Card hover className="w-full">
      <button onClick={() => select(lead.id)} className="flex w-full flex-col gap-3 p-4 text-left">
        <div className="flex items-start gap-3">
          <ScoreRing score={lead.score} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-slate-100">{lead.name}</h3>
            <p className="truncate text-xs text-slate-400">
              {lead.category} · {lead.city}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{lead.province}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <SourceBadge source={lead.source} />
          <OpportunityBadge score={lead.score} />
          <PresenceBadge presence={lead.digitalPresence} />
          <StageBadge stage={lead.stage} />
          {lead.analysis && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-300 ring-1 ring-inset ring-violet-400/30">
              ✦ Analizado
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-slate-400">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {lead.signals.whatsapp && <span>🟢 WhatsApp</span>}
            {lead.signals.instagram && <span className="truncate">📷 {lead.signals.instagram}</span>}
            {typeof lead.signals.reviewsCount === 'number' && <span>⭐ {lead.signals.reviewsCount}</span>}
          </span>
          <span className="shrink-0 font-semibold text-electric-300">{formatCurrency(lead.potentialValue)}</span>
        </div>
      </button>
    </Card>
  )
}
