import { useState } from 'react'
import { Button, Card, ProgressBar } from '../../components/ui/primitives'
import { Spinner } from '../../components/ui/primitives'
import { useLeadStore } from '../../store/useLeadStore'
import { generateAuditPdf } from '../../services/audit/pdf'
import { analyzeCompetition } from '../../lib/competition'
import type { AuditFinding, Lead } from '../../types'

const PRIORITY_STYLE: Record<string, string> = {
  alta: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
  media: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  baja: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
}
const STATUS_ICON: Record<string, string> = { ok: '✓', warn: '▲', fail: '✕' }
const STATUS_COLOR: Record<string, string> = {
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  fail: 'text-rose-400',
}

export function AnalysisPanel({ lead }: { lead: Lead }) {
  const analyze = useLeadStore((s) => s.analyze)
  const analyzing = useLeadStore((s) => s.analyzingIds.includes(lead.id))
  const [pdfLoading, setPdfLoading] = useState(false)

  const report = lead.analysis

  const downloadPdf = async () => {
    setPdfLoading(true)
    try {
      await generateAuditPdf(lead)
    } finally {
      setPdfLoading(false)
    }
  }

  if (!report) {
    return (
      <div className="space-y-4">
        <ScoreBreakdown lead={lead} />
        <Card className="p-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-violet-500/15 text-2xl text-violet-300">
            ✦
          </div>
          <p className="font-semibold text-slate-100">Analizar negocio con IA</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
            La IA revisa web, Google Business, Instagram, Facebook y LinkedIn, y genera un
            diagnóstico completo con impacto y solución.
          </p>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => analyze(lead.id)} disabled={analyzing} size="lg">
              {analyzing ? (
                <>
                  <Spinner /> Analizando…
                </>
              ) : (
                '✦ Analizar negocio'
              )}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-100">Diagnóstico inteligente</h4>
          <Button size="sm" variant="secondary" onClick={downloadPdf} disabled={pdfLoading}>
            {pdfLoading ? <Spinner /> : '📄'} Auditoría PDF
          </Button>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{report.summary}</p>
      </Card>

      {/* Métricas */}
      <Card className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-100">Métricas de presencia digital</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(report.metrics).map(([k, v]) => (
            <div key={k}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="capitalize text-slate-400">{METRIC_LABEL[k] ?? k}</span>
                <span className="font-semibold text-slate-200">{v}/100</span>
              </div>
              <ProgressBar value={v} color={v >= 70 ? '#34d399' : v >= 45 ? '#fbbf24' : '#fb7185'} />
            </div>
          ))}
        </div>
      </Card>

      <ScoreBreakdown lead={lead} />

      {/* Hallazgos */}
      <Card className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-100">
          Problemas encontrados ({report.findings.length})
        </h4>
        <div className="space-y-3">
          {report.findings.map((f) => (
            <FindingRow key={f.id} f={f} />
          ))}
        </div>
      </Card>

      <CityCompetition lead={lead} />

      {report.competitor && <CompetitorCompare lead={lead} />}
    </div>
  )
}

function CityCompetition({ lead }: { lead: Lead }) {
  const allLeads = useLeadStore((s) => s.leads)
  const insight = analyzeCompetition(lead, allLeads)
  if (!insight) return null
  return (
    <Card className="p-4">
      <h4 className="mb-1 text-sm font-semibold text-slate-100">
        Competencia en {lead.city}
      </h4>
      <p className="mb-3 text-sm text-slate-300">{insight.summary}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white/5 py-2">
          <div className="text-lg font-bold text-slate-50">#{insight.reviewsRank}</div>
          <div className="text-[10px] text-slate-400">en reseñas</div>
        </div>
        <div className="rounded-lg bg-white/5 py-2">
          <div className="text-lg font-bold text-slate-50">{insight.peers}</div>
          <div className="text-[10px] text-slate-400">competidores</div>
        </div>
        <div className="rounded-lg bg-white/5 py-2">
          <div className="text-lg font-bold text-slate-50">{insight.webBetterThan}%</div>
          <div className="text-[10px] text-slate-400">web superada</div>
        </div>
      </div>
      {(insight.bestReviews || insight.bestWeb) && (
        <div className="mt-3 space-y-1 text-xs text-slate-400">
          {insight.bestReviews && <p>🏆 Más reseñas: <span className="text-slate-200">{insight.bestReviews.name}</span> ({insight.bestReviews.signals.reviewsCount})</p>}
          {insight.bestWeb && <p>🌐 Mejor web: <span className="text-slate-200">{insight.bestWeb.name}</span></p>}
        </div>
      )}
    </Card>
  )
}

const METRIC_LABEL: Record<string, string> = {
  performance: 'Velocidad', seo: 'SEO', ux: 'UX', branding: 'Branding',
  conversion: 'Conversión', mobile: 'Móvil', trust: 'Confianza',
}

function FindingRow({ f }: { f: AuditFinding }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className={`mt-0.5 ${STATUS_COLOR[f.status]}`}>{STATUS_ICON[f.status]}</span>
          <p className="text-sm font-semibold text-slate-100">{f.title}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${PRIORITY_STYLE[f.priority]}`}>
          {f.priority}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Impacto:</span> {f.impact}
      </p>
      <p className="mt-1 text-xs text-emerald-300/90">
        <span className="font-semibold">Solución:</span> {f.solution}
      </p>
    </div>
  )
}

export function ScoreBreakdown({ lead }: { lead: Lead }) {
  return (
    <Card className="p-4">
      <h4 className="mb-1 text-sm font-semibold text-slate-100">¿Por qué este score? ({lead.score}/100)</h4>
      <p className="mb-3 text-xs text-slate-400">{lead.scoreHeadline}</p>
      <div className="space-y-1.5">
        {lead.scoreFactors.map((f) => (
          <div key={f.key} className="flex items-center gap-2 text-xs">
            <span
              className={`w-10 shrink-0 text-right font-bold ${f.points >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {f.points >= 0 ? '+' : ''}
              {f.points}
            </span>
            <span className="font-medium text-slate-300">{f.label}</span>
            <span className="truncate text-slate-500">— {f.detail}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function CompetitorCompare({ lead }: { lead: Lead }) {
  const dims = lead.analysis?.competitor
  if (!dims) return null
  return (
    <Card className="p-4">
      <h4 className="mb-1 text-sm font-semibold text-slate-100">
        Comparación vs. una web de Vigolo
      </h4>
      <p className="mb-3 text-xs text-slate-400">
        Por qué una web moderna generaría mejores resultados que la actual.
      </p>
      <div className="space-y-3">
        {dims.map((d) => (
          <div key={d.dimension}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-slate-400">{d.dimension}</span>
              <span className="text-slate-300">
                <span className="text-rose-300">{d.theirs}</span> →{' '}
                <span className="font-semibold text-emerald-300">{d.vigolo}</span>
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="absolute inset-y-0 left-0 rounded-full bg-rose-500/40" style={{ width: `${d.theirs}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-400/80" style={{ width: `${d.vigolo}%`, mixBlendMode: 'screen' }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
