// =====================================================================
// Generador de Auditoría PDF profesional (jsPDF)
// Identidad visual de Vigolo Web Studio. Listo para enviar al cliente.
// Se importa dinámicamente (code-splitting) para no pesar el bundle.
// =====================================================================

import type { jsPDF } from 'jspdf'
import { APP } from '../../config/app'
import { analyzeLead } from '../ai/localAnalyst'
import { formatCurrency } from '../../lib/format'
import type { AnalysisReport, Lead } from '../../types'

const NAVY = '#050816'
const BLUE = '#3EA6FF'
const GRAY = '#64748b'

function priorityColor(p: string): [number, number, number] {
  if (p === 'alta') return [239, 68, 68]
  if (p === 'media') return [245, 158, 11]
  return [100, 116, 139]
}

export async function generateAuditPdf(lead: Lead): Promise<void> {
  const { default: JsPDF } = await import('jspdf')
  const report: AnalysisReport = lead.analysis ?? analyzeLead(lead)
  const doc: jsPDF = new JsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 48
  let y = 0

  // ---------- Portada ----------
  doc.setFillColor(NAVY)
  doc.rect(0, 0, W, H, 'F')
  doc.setFillColor(BLUE)
  doc.circle(W - 60, 80, 6, 'F')
  doc.setFillColor(34, 197, 94)
  doc.circle(W - 40, 110, 4, 'F')

  doc.setTextColor(BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(APP.agency.name.toUpperCase(), M, 90)

  doc.setTextColor('#ffffff')
  doc.setFontSize(34)
  doc.text('Auditoría Digital', M, H / 2 - 40)
  doc.setTextColor(BLUE)
  doc.text(lead.name, M, H / 2)

  doc.setTextColor('#cbd5e1')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(`${lead.category}  ·  ${lead.zone}`, M, H / 2 + 28)
  doc.text(lead.address, M, H / 2 + 46)

  doc.setFontSize(11)
  doc.setTextColor(GRAY)
  doc.text(
    `Informe generado el ${new Date().toLocaleDateString('es-AR')}`,
    M,
    H - 70,
  )
  doc.setTextColor(BLUE)
  doc.text(`Score de oportunidad: ${lead.score}/100`, M, H - 50)

  // ---------- Página de contenido ----------
  doc.addPage()
  doc.setTextColor('#0f172a')
  y = M

  const heading = (t: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(NAVY)
    doc.text(t, M, y)
    doc.setDrawColor(BLUE)
    doc.setLineWidth(2)
    doc.line(M, y + 6, M + 40, y + 6)
    y += 26
  }
  const paragraph = (t: string, color = '#334155') => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10.5)
    doc.setTextColor(color)
    const lines = doc.splitTextToSize(t, W - M * 2)
    doc.text(lines, M, y)
    y += lines.length * 14 + 6
  }
  const ensureSpace = (needed: number) => {
    if (y + needed > H - M) {
      doc.addPage()
      y = M
    }
  }

  // Datos del negocio
  heading('Datos del negocio')
  paragraph(
    [
      `Negocio: ${lead.name}`,
      `Rubro: ${lead.category}`,
      `Zona: ${lead.zone}`,
      `Dirección: ${lead.address}`,
      `Teléfono: ${lead.signals.phone ?? lead.signals.whatsapp ?? '—'}`,
      `Sitio web: ${lead.signals.website ?? 'No tiene'}`,
      `Instagram: ${lead.signals.instagram ?? '—'}`,
      `Reseñas Google: ${lead.signals.reviewsCount ?? 0}  ·  Rating: ${lead.signals.rating?.toFixed(1) ?? '—'}★`,
    ].join('\n'),
  )

  // Resumen ejecutivo
  ensureSpace(80)
  heading('Resumen ejecutivo')
  paragraph(report.summary)

  // Problemas encontrados (tabla)
  ensureSpace(60)
  heading('Problemas encontrados')
  const { default: autoTable } = await import('jspdf-autotable')
  autoTable(doc, {
    startY: y,
    head: [['Prioridad', 'Problema', 'Impacto']],
    body: report.findings.map((f) => [
      f.priority.toUpperCase(),
      f.title,
      f.impact,
    ]),
    styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 150 },
      2: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const p = report.findings[data.row.index].priority
        data.cell.styles.textColor = priorityColor(p)
        data.cell.styles.fontStyle = 'bold'
      }
    },
    margin: { left: M, right: M },
  })
  // @ts-expect-error autotable agrega lastAutoTable al doc
  y = (doc.lastAutoTable?.finalY ?? y) + 24

  // Recomendaciones / beneficios
  ensureSpace(80)
  heading('Recomendaciones')
  report.findings.slice(0, 6).forEach((f) => {
    ensureSpace(40)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(BLUE)
    doc.text(`• ${f.title}`, M, y)
    y += 14
    paragraph(f.solution)
  })

  // Beneficios de mejorar
  ensureSpace(80)
  heading('Beneficios de una web profesional')
  paragraph(
    'Más consultas por WhatsApp, mejor posicionamiento en Google, imagen profesional que permite cobrar más, y capacidad de medir y escalar con campañas. Una web moderna convierte la demanda que hoy se pierde en clientes reales.',
  )

  // Conclusión
  ensureSpace(80)
  heading('Conclusión')
  paragraph(
    `${lead.name} tiene una oportunidad clara de crecimiento digital. Con una inversión estimada de ${formatCurrency(lead.potentialValue)}, ${APP.agency.name} puede resolver los puntos detectados y transformar su presencia online en una máquina de captar clientes.`,
  )

  // Pie
  doc.setFontSize(9)
  doc.setTextColor(GRAY)
  doc.text(`${APP.agency.name}  ·  Auditoría digital  ·  ${lead.name}`, M, H - 24)

  doc.save(`auditoria-${lead.id}.pdf`)
}
