// =====================================================================
// Exportadores de oportunidades: CSV, JSON, Excel (.xls), Notion y PDF.
// =====================================================================

import { CRM_STAGE_LABEL, DIGITAL_PRESENCE_LABEL } from '../lib/labels'
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
  'Empresa',
  'Industria',
  'Provincia',
  'Ciudad',
  'Direccion',
  'Telefono',
  'WhatsApp',
  'Web',
  'Instagram',
  'Presencia digital',
  'Maquina recomendada',
  'Categoria maquina',
  'Ticket probable',
  'Tamanio empresa',
  'Nivel industrial',
  'Score',
  'Nivel oportunidad',
  'Estado CRM',
  'Valor potencial',
  'Prob. cierre %',
  'Resenas',
  'Rating',
  'Notas',
  'Ultimo contacto',
  'Proximo seguimiento',
  'Maps',
]

function row(l: Lead): (string | number)[] {
  return [
    l.name,
    l.industry,
    l.province,
    l.city,
    l.address,
    l.signals.phone ?? '',
    l.signals.whatsapp ?? '',
    l.signals.website ?? '',
    l.signals.instagram ?? '',
    DIGITAL_PRESENCE_LABEL[l.digitalPresence],
    l.recommendedMachineName,
    l.recommendedMachineCategory,
    l.ticketRange,
    l.companySize,
    l.industrialMaturity,
    l.score,
    l.scoreLevel,
    CRM_STAGE_LABEL[l.stage],
    l.potentialValue,
    l.closeProbability,
    l.signals.reviewsCount ?? 0,
    l.signals.rating ?? '',
    l.notes,
    l.lastContactDate ?? '',
    l.nextFollowUpDate ?? '',
    l.mapsUrl ?? '',
  ]
}

function esc(v: unknown): string {
  const s = v == null ? '' : String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportCsv(leads: Lead[], filename = '2gtech3d-oportunidades.csv'): void {
  const body = leads.map((l) => row(l).map(esc).join(',')).join('\n')
  const csv = '\uFEFF' + [HEADERS.join(','), body].join('\n')
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

export function exportJson(leads: Lead[], filename = '2gtech3d-oportunidades.json'): void {
  const json = JSON.stringify(leads, null, 2)
  triggerDownload(new Blob([json], { type: 'application/json;charset=utf-8;' }), filename)
}

export function exportExcel(leads: Lead[], filename = '2gtech3d-oportunidades.xls'): void {
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
  triggerDownload(new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' }), filename)
}

export async function exportSheets(leads: Lead[]): Promise<void> {
  const tsv = [
    HEADERS.join('\t'),
    ...leads.map((l) => row(l).map((c) => String(c).replace(/\t/g, ' ')).join('\t')),
  ].join('\n')
  try {
    await navigator.clipboard.writeText(tsv)
    window.open('https://sheets.new', '_blank', 'noopener')
  } catch {
    exportCsv(leads, '2gtech3d-oportunidades-sheets.csv')
  }
}

export function exportNotion(leads: Lead[], filename = '2gtech3d-oportunidades.md'): void {
  const cols = ['Empresa', 'Industria', 'Maquina', 'Provincia', 'Ciudad', 'Score', 'Estado', 'Ticket', 'Valor']
  const line = (cells: (string | number)[]) => `| ${cells.join(' | ')} |`
  const body = leads.map((l) =>
    line([
      l.name,
      l.industry,
      l.recommendedMachineName,
      l.province,
      l.city,
      l.score,
      CRM_STAGE_LABEL[l.stage],
      l.ticketRange,
      l.potentialValue,
    ]),
  )
  const md = [
    '# 2GTech3D Lead Radar - Oportunidades',
    '',
    line(cols),
    line(cols.map(() => '---')),
    ...body,
  ].join('\n')
  triggerDownload(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), filename)
}

export async function exportPdf(leads: Lead[], filename = '2gtech3d-oportunidades.pdf'): Promise<void> {
  const { default: JsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new JsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' })
  doc.setFontSize(16)
  doc.setTextColor('#0f172a')
  doc.text('2GTech3D Lead Radar - Oportunidades', 40, 40)
  doc.setFontSize(10)
  doc.setTextColor('#64748b')
  doc.text(`${leads.length} oportunidades · ${new Date().toLocaleDateString('es-AR')}`, 40, 58)
  autoTable(doc, {
    startY: 72,
    head: [['Empresa', 'Industria', 'Maquina', 'Provincia', 'Ciudad', 'Score', 'Ticket', 'Valor']],
    body: leads.map((l) => [
      l.name,
      l.industry,
      l.recommendedMachineName,
      l.province,
      l.city,
      l.score,
      l.ticketRange,
      l.potentialValue,
    ]),
    styles: { fontSize: 8, cellPadding: 5 },
    headStyles: { fillColor: [15, 23, 42] },
    margin: { left: 40, right: 40 },
  })
  doc.save(filename)
}
