import { useState } from 'react'
import { Drawer } from '../../components/ui/Drawer'
import { ScoreRing } from '../../components/ui/ScoreRing'
import { OpportunityBadge, MachineFitBadge, PriorityBadge, StageBadge } from '../../components/ui/badges'
import { formatCurrency } from '../../lib/format'
import { Button } from '../../components/ui/primitives'
import { AnalysisPanel } from '../analysis/AnalysisPanel'
import { MessagesPanel } from '../messages/MessagesPanel'
import { CrmPanel } from './CrmPanel'
import { useLeadStore } from '../../store/useLeadStore'
import { generateDemoHtml, openDemo } from '../../services/demo/generateDemo'
import { cn } from '../../utils/cn'
import type { Lead } from '../../types'

type Tab = 'resumen' | 'analisis' | 'mensajes' | 'crm'
const TABS: { id: Tab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'analisis', label: 'Análisis IA' },
  { id: 'mensajes', label: 'Mensajes' },
  { id: 'crm', label: 'CRM' },
]

export function LeadDrawer() {
  const selectedId = useLeadStore((s) => s.selectedId)
  const lead = useLeadStore((s) => s.leads.find((l) => l.id === s.selectedId) ?? null)
  const select = useLeadStore((s) => s.select)
  return (
    <Drawer open={Boolean(selectedId)} onClose={() => select(null)}>
      {lead && <DrawerBody lead={lead} onClose={() => select(null)} />}
    </Drawer>
  )
}

function DrawerBody({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('resumen')
  const removeLead = useLeadStore((s) => s.removeLead)
  const addDemo = useLeadStore((s) => s.addDemo)

  const createDemo = () => {
    const html = generateDemoHtml(lead)
    addDemo({ leadId: lead.id, leadName: lead.name, html })
    openDemo(html)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-base-950/90 p-5 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ScoreRing score={lead.score} size={60} />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-50">{lead.name}</h2>
              <p className="text-sm text-slate-400">{lead.category} · {lead.city}, {lead.province}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <OpportunityBadge score={lead.score} />
                <MachineFitBadge fit={lead.machineFit} />
                <StageBadge stage={lead.stage} />
                <PriorityBadge priority={lead.priority} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-4 flex gap-1 rounded-xl bg-white/5 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors',
                tab === t.id ? 'bg-electric-500 text-white' : 'text-slate-300 hover:text-white',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 p-5">
        {tab === 'resumen' && <Overview lead={lead} />}
        {tab === 'analisis' && <AnalysisPanel lead={lead} />}
        {tab === 'mensajes' && <MessagesPanel lead={lead} />}
        {tab === 'crm' && <CrmPanel lead={lead} />}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-white/10 bg-base-950/90 p-4 backdrop-blur">
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (confirm(`¿Eliminar "${lead.name}" de la lista?`)) removeLead(lead.id)
          }}
        >
          Eliminar
        </Button>
        <div className="flex gap-2">
          <Button variant="success" size="sm" onClick={createDemo} title="Generar una propuesta / ficha de la máquina para enviar al cliente">
            ✨ Crear propuesta
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

function Overview({ lead }: { lead: Lead }) {
  const rows: [string, string | undefined, string?][] = [
    ['Provincia', lead.province],
    ['Ciudad', lead.city],
    ['Dirección', lead.address],
    ['Teléfono', lead.signals.phone, lead.signals.phone ? `tel:${lead.signals.phone.replace(/[^\d+]/g, '')}` : undefined],
    ['WhatsApp', lead.signals.whatsapp, lead.signals.whatsapp ? `https://wa.me/${lead.signals.whatsapp.replace(/[^\d]/g, '')}` : undefined],
    ['Email', lead.signals.email, lead.signals.email ? `mailto:${lead.signals.email}` : undefined],
    ['Sitio web', lead.signals.website, lead.signals.website],
    ['Instagram', lead.signals.instagram, lead.signals.instagram ? `https://instagram.com/${lead.signals.instagram.replace(/^@/, '')}` : undefined],
    ['Facebook', lead.signals.facebook],
    ['LinkedIn', lead.signals.linkedin],
    ['Google', lead.signals.reviewsCount != null ? `${lead.signals.reviewsCount} reseñas · ${lead.signals.rating?.toFixed(1) ?? '—'}★` : undefined],
    ['Estado', lead.openingHours?.openNow === undefined ? undefined : lead.openingHours.openNow ? 'Abierto ahora' : 'Cerrado'],
    ['Maps', 'Ver en Google Maps', lead.mapsUrl],
  ]
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Datos del negocio</h4>
        <dl className="space-y-2 text-sm">
          {rows.filter(([, v]) => v).map(([label, value, href]) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-slate-500">{label}</dt>
              <dd className="min-w-0 truncate text-right text-slate-200">
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="text-electric-300 hover:underline">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="rounded-2xl border border-electric-400/20 bg-electric-500/[0.06] p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-electric-300">Máquinas recomendadas</h4>
        {lead.machines.length === 0 ? (
          <p className="text-sm text-slate-400">Sin recomendación (rubro a validar).</p>
        ) : (
          <ul className="space-y-2">
            {lead.machines.map((m) => (
              <li key={m.machineId} className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-100">🛠️ {m.name}</span>
                  <span className="block text-xs text-slate-400">{m.reason}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-electric-300">{formatCurrency(m.ticketArs)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Por qué es oportunidad</h4>
        <p className="text-sm text-slate-300">{lead.scoreHeadline}</p>
      </div>
    </div>
  )
}
