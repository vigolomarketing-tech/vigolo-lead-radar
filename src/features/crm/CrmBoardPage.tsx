import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { ExportMenu } from '../../components/leads/ExportMenu'
import { ScoreRing } from '../../components/ui/ScoreRing'
import { useLeadStore } from '../../store/useLeadStore'
import { CRM_STAGE_ACCENT, CRM_STAGE_LABEL, CRM_STAGE_ORDER } from '../../lib/labels'
import { formatCurrency } from '../../lib/format'
import { cn } from '../../utils/cn'
import type { CrmStage, Lead } from '../../types'

export function CrmBoardPage() {
  const leads = useLeadStore((s) => s.leads)
  const setStage = useLeadStore((s) => s.setStage)
  const select = useLeadStore((s) => s.select)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<CrmStage | null>(null)

  const byStage = (stage: CrmStage) => leads.filter((l) => l.stage === stage)

  const drop = (stage: CrmStage) => {
    if (dragId) setStage(dragId, stage)
    setDragId(null)
    setOverStage(null)
  }

  return (
    <AppShell title="CRM" subtitle="Pipeline comercial · arrastrá las tarjetas entre columnas">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{leads.length} leads en el pipeline</p>
        <ExportMenu leads={leads} />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {CRM_STAGE_ORDER.map((stage) => {
          const items = byStage(stage)
          const total = items.reduce((s, l) => s + l.potentialValue, 0)
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault()
                setOverStage(stage)
              }}
              onDrop={() => drop(stage)}
              className={cn(
                'flex w-72 shrink-0 flex-col rounded-2xl border bg-white/[0.02] p-3 transition-colors',
                overStage === stage ? 'border-electric-400/50 bg-electric-500/5' : 'border-white/10',
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: CRM_STAGE_ACCENT[stage] }} />
                  <span className="text-sm font-semibold text-slate-200">{CRM_STAGE_LABEL[stage]}</span>
                  <span className="rounded-full bg-white/10 px-1.5 text-xs text-slate-400">{items.length}</span>
                </div>
                <span className="text-[11px] text-slate-500">{formatCurrency(total)}</span>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {items.map((l) => (
                  <BoardCard
                    key={l.id}
                    lead={l}
                    onClick={() => select(l.id)}
                    onDragStart={() => setDragId(l.id)}
                    dragging={dragId === l.id}
                  />
                ))}
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 py-6 text-center text-xs text-slate-600">
                    Soltá acá
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}

function BoardCard({
  lead,
  onClick,
  onDragStart,
  dragging,
}: {
  lead: Lead
  onClick: () => void
  onDragStart: () => void
  dragging: boolean
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        'cursor-grab rounded-xl border border-white/10 bg-base-900/70 p-3 transition-all hover:border-electric-400/40 active:cursor-grabbing',
        dragging && 'opacity-40',
      )}
    >
      <div className="flex items-start gap-2">
        <ScoreRing score={lead.score} size={38} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">{lead.name}</p>
          <p className="truncate text-xs text-slate-400">{lead.category} · {lead.city}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-electric-300">{formatCurrency(lead.potentialValue)}</span>
        <span className="text-slate-500">{lead.closeProbability}%</span>
      </div>
    </div>
  )
}
