// =====================================================================
// Exportadores de leads: CSV, JSON, Excel (.xls) y PDF.
// PDF/Excel pesados se generan bajo demanda.
// =====================================================================

import { CRM_STAGE_LABEL, MACHINE_FIT_LABEL } from '../lib/labels'
import type { Lead } from '../types'

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const HEADERS = [
  'Nombre', 'Rubro', 'Provincia', 'Ciudad', 'Dirección', 'Teléfono', 'WhatsApp',
  'Email', 'Sitio web', 'Instagram', 'Ajuste rubro', 'Máquina sugerida',
  'Score', 'Nivel', 'Estado CRM', 'Ticket potencial (ARS)', 'Prob. cierre %',
  'Reseñas', 'Rating', 'Motivo', 'Notas', 'Último contacto', 'Próximo seguimiento', 'Maps',
]

function row(l: Lead): (string | number)[] {
  return [
    l.name, l.category, l.province, l.city, l.address,
    l.signals.phone ?? '', l.signals.whatsapp ?? '', l.signals.email ?? '',
    l.signals.website ?? '', l.signals.instagram ?? '',
    MACHINE_FIT_LABEL[l.machineFit], l.machines[0]?.name ?? '',
    l.score, l.scoreLevel, CRM_STAGE_LABEL[l.stage], l.potentialValue, l.closeProbability,
    l.signals.reviewsCount ?? 0, l.signals.rating ?? '', l.scoreHeadline, l.notes,
    l.lastContactDate ?? '', l.nextFollowUpDate ?? '', l.mapsUrl ?? '',
  ]
}

function esc(v: unknown): string {
  const s = v == null ? '' : String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportCsv(leads: Lead[], filename = '2gtech3d-leads.csv'): void {
  const body = leads.map((l) => row(l).map(esc).join(',')).join('\n')
  const csv = '\uFEFF' + [HEADERS.join(','), body].join('\n')
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

export function exportJson(leads: Lead[], filename = '2gtech3d-leads.json'): void {
  const json = JSON.stringify(leads, null, 2)
  triggerDownload(
    new Blob([json], { type: 'application/json;charset=utf-8;' }),
    filename,
  )
}

/** Excel via HTML table (Excel abre .xls sin dependencias externas). */
export function exportExcel(leads: Lead[], filename = '2gtech3d-leads.xls'): void {
  const th = HEADERS.map((h) => `<th>${h}</th>`).join('')
  const trs = leads
    .map(
      (l) =>
        `<tr>${row(l)
          .map((c) => `<td>${String(c).replace(/</g, '&lt;')}</td>`)
          .join('')}</tr>`,
    )
    .join('')
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table border="1"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></body></html>`
  triggerDownload(
    new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' }),
    filename,
  )
}

/**
 * Google Sheets: copia los datos como TSV al portapapeles y abre una hoja
 * nueva (sheets.new) para pegar con Ctrl+V. Sin backend ni OAuth.
 */
export async function exportSheets(leads: Lead[]): Promise<void> {
  const tsv = [
    HEADERS.join('\t'),
    ...leads.map((l) => row(l).map((c) => String(c).replace(/\t/g, ' ')).join('\t')),
  ].join('\n')
  try {
    await navigator.clipboard.writeText(tsv)
    window.open('https://sheets.new', '_blank', 'noopener')
  } catch {
    // Fallback: descargar CSV si el portapapeles no está disponible.
    exportCsv(leads, '2gtech3d-leads-sheets.csv')
  }
}

/** Notion: descarga una tabla en Markdown lista para pegar en Notion. */
export function exportNotion(leads: Lead[], filename = '2gtech3d-leads.md'): void {
  const cols = ['Nombre', 'Rubro', 'Provincia', 'Ciudad', 'Ajuste', 'Máquina', 'Score', 'Estado', 'Prioridad', 'Ticket']
  const line = (cells: (string | number)[]) => `| ${cells.join(' | ')} |`
  const body = leads.map((l) =>
    line([
      l.name, l.category, l.province, l.city,
      MACHINE_FIT_LABEL[l.machineFit], l.machines[0]?.name ?? '—', l.score,
      CRM_STAGE_LABEL[l.stage], l.priority, l.potentialValue,
    ]),
  )
  const md = [
    '# 2GTech3D Lead Radar — Leads',
    '',
    line(cols),
    line(cols.map(() => '---')),
    ...body,
  ].join('\n')
  triggerDownload(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), filename)
}

/** PDF con la lista de leads (resumen) usando jsPDF + autotable. */
export async function exportPdf(leads: Lead[], filename = '2gtech3d-leads.pdf'): Promise<void> {
  const { default: JsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new JsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' })
  doc.setFontSize(16)
  doc.setTextColor('#0f172a')
  doc.text('2GTech3D Lead Radar — Leads', 40, 40)
  doc.setFontSize(10)
  doc.setTextColor('#64748b')
  doc.text(`${leads.length} leads · ${new Date().toLocaleDateString('es-AR')}`, 40, 58)
  autoTable(doc, {
    startY: 72,
    head: [['Empresa', 'Rubro', 'Ciudad', 'Ajuste', 'Máquina sugerida', 'Score', 'Estado']],
    body: leads.map((l) => [
      l.name, l.category, l.city,
      MACHINE_FIT_LABEL[l.machineFit], l.machines[0]?.name ?? '—', l.score,
      CRM_STAGE_LABEL[l.stage],
    ]),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [15, 23, 42] },
    margin: { left: 40, right: 40 },
  })
  doc.save(filename)
}
