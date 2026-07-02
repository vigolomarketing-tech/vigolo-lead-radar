import { ScoreRing } from './ScoreRing'
import { OpportunityBadge, PresenceBadge } from './OpportunityBadge'
import { StatusBadge } from './StatusBadge'
import { useLeads } from '../../context/LeadsContext'
import type { Lead } from '../../types'

/** Tarjeta resumida de un lead dentro de la grilla. */
export function LeadCard({ lead }: { lead: Lead }) {
  const { selectLead } = useLeads()

  return (
    <button
      onClick={() => selectLead(lead.id)}
      className="animate-fade-in group flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-base-900/70 p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-electric-400/40 hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400/60"
    >
      <div className="flex items-start gap-3">
        <ScoreRing score={lead.score} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-100 group-hover:text-white">
            {lead.name}
          </h3>
          <p className="truncate text-xs text-slate-400">
            {lead.category} &middot; {lead.zone}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{lead.address}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <OpportunityBadge score={lead.score} />
        <PresenceBadge presence={lead.digitalPresence} />
        <StatusBadge status={lead.crmStatus} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
        {lead.whatsapp && <IconLine icon="wsp" text="WhatsApp" />}
        {lead.instagram && <IconLine icon="ig" text={lead.instagram} />}
        {lead.website ? (
          <IconLine icon="web" text="Con web" />
        ) : (
          <IconLine icon="noweb" text="Sin web" />
        )}
        {typeof lead.reviewsCount === 'number' && (
          <IconLine icon="star" text={`${lead.reviewsCount} reseñas`} />
        )}
      </div>
    </button>
  )
}

function IconLine({ icon, text }: { icon: string; text: string }) {
  const map: Record<string, string> = {
    wsp: '🟢',
    ig: '📷',
    web: '🌐',
    noweb: '⚠️',
    star: '⭐',
  }
  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden>{map[icon]}</span>
      <span className="truncate">{text}</span>
    </span>
  )
}
