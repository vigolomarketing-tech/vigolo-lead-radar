// =====================================================================
// Informe PDF de oportunidad industrial para 2GTech3D.
// =====================================================================

import type { jsPDF } from 'jspdf'
import { APP } from '../../config/app'
import { MACHINE_BY_ID } from '../../config/machines'
import { formatCurrency } from '../../lib/format'
import { analyzeLead } from '../ai/localAnalyst'
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
  const machine = MACHINE_BY_ID[lead.recommendedMachineId]
  const doc: jsPDF = new JsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 48
  let y = 0

  doc.setFillColor(NAVY)
  doc.rect(0, 0, W, H, 'F')
  doc.setFillColor(BLUE)
  doc.circle(W - 60, 80, 6, 'F')

  doc.setTextColor(BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(APP.agency.name.toUpperCase(), M, 90)

  doc.setTextColor('#ffffff')
  doc.setFontSize(30)
  doc.text('Informe de oportunidad industrial', M, H / 2 - 52)
  doc.setTextColor(BLUE)
  doc.setFontSize(24)
  doc.text(lead.name, M, H / 2 - 14)

  doc.setTextColor('#cbd5e1')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(`${lead.category} · ${lead.city}, ${lead.province}`, M, H / 2 + 18)
  doc.text(machine.name, M, H / 2 + 38)
  doc.text(`Score ${lead.score}/100 · Ticket ${lead.ticketRange}`, M, H / 2 + 58)

  doc.setFontSize(11)
  doc.setTextColor(GRAY)
  doc.text(`Generado el ${new Date().toLocaleDateString('es-AR')}`, M, H - 70)
  doc.setTextColor(BLUE)
  doc.text(APP.name, M, H - 50)

  doc.addPage()
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

  heading('Datos de la oportunidad')
  paragraph(
    [
      `Empresa: ${lead.name}`,
      `Industria: ${lead.industry}`,
      `Ubicacion: ${lead.city}, ${lead.province}`,
      `Direccion: ${lead.address}`,
      `Contacto: ${lead.signals.phone ?? lead.signals.whatsapp ?? '-'}`,
      `Tamanio estimado: ${lead.companySize}`,
      `Nivel industrial: ${lead.industrialMaturity}`,
      `Valor ponderado: ${formatCurrency(lead.potentialValue)}`,
    ].join('\n'),
  )

  ensureSpace(90)
  heading('Maquina recomendada')
  paragraph(
    [
      `${machine.name} (${machine.category})`,
      `SKU: ${machine.sku ?? '-'}`,
      `Ticket: ${machine.ticketRange}`,
      `Aplicaciones: ${machine.applications.join(', ')}`,
      `Materiales: ${machine.materials.join(', ')}`,
      `Beneficios: ${machine.benefits.join(', ')}`,
    ].join('\n'),
  )

  ensureSpace(80)
  heading('Resumen ejecutivo')
  paragraph(report.summary)

  ensureSpace(60)
  heading('Hallazgos')
  const { default: autoTable } = await import('jspdf-autotable')
  autoTable(doc, {
    startY: y,
    head: [['Prioridad', 'Area', 'Hallazgo', 'Impacto']],
    body: report.findings.map((f) => [
      f.priority.toUpperCase(),
      f.area,
      f.title,
      f.impact,
    ]),
    styles: { fontSize: 8.5, cellPadding: 6, valign: 'top' },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 70 },
      2: { cellWidth: 155 },
      3: { cellWidth: 'auto' },
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
  y = ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 24

  ensureSpace(80)
  heading('Proximo paso comercial')
  report.findings.slice(0, 5).forEach((f) => {
    ensureSpace(40)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(BLUE)
    doc.text(`- ${f.title}`, M, y)
    y += 14
    paragraph(f.solution)
  })

  ensureSpace(80)
  heading('Cierre')
  paragraph(
    `${lead.name} debe abordarse como venta consultiva B2B. La conversacion inicial tiene que validar materiales, volumen mensual, procesos tercerizados, espacio, energia disponible y financiacion. Con esa informacion se confirma si ${machine.name} es la mejor opcion o si conviene derivar a otra maquina del catalogo 2GTech3D.`,
  )

  doc.setFontSize(9)
  doc.setTextColor(GRAY)
  doc.text(`${APP.agency.name} · ${APP.name} · ${lead.name}`, M, H - 24)

  doc.save(`oportunidad-${lead.id}.pdf`)
}
