import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ScoreRing } from './ScoreRing'
import { OpportunityBadge, PresenceBadge } from './OpportunityBadge'
import { MessageGenerator } from '../messages/MessageGenerator'
import { useLeads } from '../../context/LeadsContext'
import { CRM_STATUS_LABEL, CRM_STATUS_ORDER, CRM_STATUS_STYLE } from '../../lib/labels'
import type { CrmStatus, Lead } from '../../types'

/** Panel detalle de un lead: datos + CRM + generador de mensajes. */
export function LeadDetail() {
  const { selectedLead, selectLead } = useLeads()
  const open = Boolean(selectedLead)

  return (
    <Modal open={open} onClose={() => selectLead(null)} labelledBy="lead-detail-title">
      {selectedLead && <LeadDetailContent lead={selectedLead} />}
    </Modal>
  )
}

function LeadDetailContent({ lead }: { lead: Lead }) {
  const { selectLead, updateLead, setCrmStatus, removeLead } = useLeads()

  return (
    <div className="max-h-[88vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/10 bg-base-900/95 p-5 backdrop-blur">
        <div className="flex items-start gap-3">
          <ScoreRing score={lead.score} size={60} />
          <div>
            <h2 id="lead-detail-title" className="text-lg font-bold text-slate-50">
              {lead.name}
            </h2>
            <p className="text-sm text-slate-400">
              {lead.category} &middot; {lead.zone}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <OpportunityBadge score={lead.score} />
              <PresenceBadge presence={lead.digitalPresence} />
            </div>
          </div>
        </div>
        <button
          onClick={() => selectLead(null)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label="Cerrar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-2">
        {/* Columna izquierda: datos + oportunidad */}
        <div className="space-y-4">
          <section>
            <SectionTitle>Datos del negocio</SectionTitle>
            <dl className="space-y-2 text-sm">
              <Row label="Dirección" value={lead.address} />
              <Row
                label="Teléfono"
                value={lead.phone}
                href={lead.phone ? `tel:${sanitizePhone(lead.phone)}` : undefined}
              />
              <Row
                label="WhatsApp"
                value={lead.whatsapp}
                href={lead.whatsapp ? waLink(lead.whatsapp) : undefined}
                hrefLabel="Abrir chat"
              />
              <Row
                label="Sitio web"
                value={lead.website ?? 'Sin web'}
                href={lead.website}
                hrefLabel="Visitar"
              />
              <Row
                label="Instagram"
                value={lead.instagram}
                href={lead.instagram ? igLink(lead.instagram) : undefined}
                hrefLabel="Ver perfil"
              />
              {typeof lead.reviewsCount === 'number' && (
                <Row
                  label="Google"
                  value={`${lead.reviewsCount} reseñas${
                    lead.rating ? ` · ${lead.rating}★` : ''
                  }`}
                />
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-white/10 bg-base-950/50 p-4">
            <SectionTitle>¿Por qué es una oportunidad?</SectionTitle>
            <p className="text-sm leading-relaxed text-slate-300">
              {lead.scoreReason}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Puntaje de oportunidad: {lead.score}/100
            </p>
          </section>
        </div>

        {/* Columna derecha: CRM */}
        <div className="space-y-4">
          <section className="rounded-xl border border-white/10 bg-base-950/50 p-4">
            <SectionTitle>Estado comercial (CRM)</SectionTitle>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {CRM_STATUS_ORDER.map((status) => (
                <StatusChip
                  key={status}
                  status={status}
                  active={lead.crmStatus === status}
                  onClick={() => setCrmStatus(lead.id, status)}
                />
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DateField
                label="Último contacto"
                value={lead.lastContactDate}
                onChange={(v) => updateLead(lead.id, { lastContactDate: v })}
              />
              <DateField
                label="Próximo seguimiento"
                value={lead.nextFollowUpDate}
                onChange={(v) => updateLead(lead.id, { nextFollowUpDate: v })}
              />
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium text-slate-400">
                Notas internas
              </span>
              <textarea
                value={lead.notes}
                onChange={(e) => updateLead(lead.id, { notes: e.target.value })}
                rows={4}
                placeholder="Anotá lo que hablaste, objeciones, precios..."
                className="w-full resize-y rounded-lg border border-white/10 bg-base-950/60 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-electric-400/60 focus:outline-none focus:ring-2 focus:ring-electric-400/30"
              />
            </label>
          </section>

          <MessageGenerator lead={lead} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-white/10 p-4">
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (confirm(`¿Descartar y eliminar "${lead.name}" de la lista?`)) {
              removeLead(lead.id)
            }
          }}
        >
          Eliminar lead
        </Button>
        <Button variant="secondary" size="sm" onClick={() => selectLead(null)}>
          Cerrar
        </Button>
      </div>
    </div>
  )
}

// --- helpers de UI ---
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </h3>
  )
}

function Row({
  label,
  value,
  href,
  hrefLabel,
}: {
  label: string
  value?: string
  href?: string
  hrefLabel?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 truncate text-right text-slate-200">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-electric-300 hover:text-electric-200 hover:underline"
          >
            {hrefLabel ?? value}
          </a>
        ) : (
          (value ?? '—')
        )}
      </dd>
    </div>
  )
}

function StatusChip({
  status,
  active,
  onClick,
}: {
  status: CrmStatus
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all ${
        active
          ? CRM_STATUS_STYLE[status] + ' scale-105'
          : 'bg-transparent text-slate-400 ring-white/10 hover:bg-white/5'
      }`}
    >
      {CRM_STATUS_LABEL[status]}
    </button>
  )
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (v: string | undefined) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      <input
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full rounded-lg border border-white/10 bg-base-950/60 px-3 py-2 text-sm text-slate-100 focus:border-electric-400/60 focus:outline-none focus:ring-2 focus:ring-electric-400/30 [color-scheme:dark]"
      />
    </label>
  )
}

// --- helpers de datos ---
function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}
function waLink(whatsapp: string): string {
  const num = whatsapp.replace(/[^\d]/g, '')
  return `https://wa.me/${num}`
}
function igLink(instagram: string): string {
  const handle = instagram.replace(/^@/, '').trim()
  return `https://instagram.com/${handle}`
}
