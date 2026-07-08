import { MachineFitBadge, UrgencyBadge } from '../ui/badges'
import { useLeadStore } from '../../store/useLeadStore'
import { formatCurrency } from '../../lib/format'
import { CRM_STAGE_LABEL } from '../../lib/labels'
import { cn } from '../../utils/cn'
import type { Lead } from '../../types'

const URGENCY_RANK: Record<Lead['urgency']['level'], number> = { alta: 0, media: 1, baja: 2 }

/** Vista tabla densa, pensada para trabajar muchos leads de un vistazo. */
export function LeadTable({ leads }: { leads: Lead[] }) {
  const select = useLeadStore((s) => s.select)
  const rows = [...leads].sort(
    (a, b) => URGENCY_RANK[a.urgency.level] - URGENCY_RANK[b.urgency.level] || b.score - a.score,
  )

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
            <Th className="pl-4">Empresa</Th>
            <Th>Urgencia</Th>
            <Th className="text-center">Score</Th>
            <Th>Máquina sugerida</Th>
            <Th>Razón de compra</Th>
            <Th className="text-right">Ticket</Th>
            <Th className="pr-4 text-right">Contacto</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr
              key={l.id}
              onClick={() => select(l.id)}
              className="cursor-pointer border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
            >
              <td className="max-w-[220px] py-2.5 pl-4 pr-3">
                <div className="truncate font-semibold text-slate-100">{l.name}</div>
                <div className="truncate text-xs text-slate-500">{l.category} · {l.city}</div>
              </td>
              <td className="px-3"><UrgencyBadge level={l.urgency.level} title={l.urgency.reason} /></td>
              <td className="px-3 text-center">
                <span className={cn('inline-grid h-9 w-9 place-items-center rounded-full text-xs font-bold ring-2', scoreStyle(l.score))}>
                  {l.score}
                </span>
              </td>
              <td className="max-w-[200px] px-3">
                <div className="truncate text-xs text-slate-300">{l.machines[0]?.name ?? '—'}</div>
                <div className="mt-0.5"><MachineFitBadge fit={l.machineFit} /></div>
              </td>
              <td className="max-w-[280px] px-3">
                <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">{l.reasonToBuy}</p>
              </td>
              <td className="whitespace-nowrap px-3 text-right text-xs font-semibold text-electric-300">
                {formatCurrency(l.potentialValue)}
                <div className="text-[10px] font-normal text-slate-500">{CRM_STAGE_LABEL[l.stage]}</div>
              </td>
              <td className="py-2.5 pl-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-1.5">
                  {l.signals.whatsapp && (
                    <IconLink href={`https://wa.me/${l.signals.whatsapp.replace(/[^\d]/g, '')}`} title="WhatsApp">🟢</IconLink>
                  )}
                  {l.signals.website && <IconLink href={l.signals.website} title="Sitio web">🌐</IconLink>}
                  {l.mapsUrl && <IconLink href={l.mapsUrl} title="Google Maps">📍</IconLink>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn('py-2.5 px-3 font-semibold', className)}>{children}</th>
}

function IconLink({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 text-xs ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10"
    >
      {children}
    </a>
  )
}

function scoreStyle(score: number): string {
  if (score >= 70) return 'text-emerald-300 ring-emerald-400/40'
  if (score >= 45) return 'text-amber-300 ring-amber-400/40'
  return 'text-slate-300 ring-slate-400/30'
}
