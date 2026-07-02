// =====================================================================
// Exportacion de leads a CSV
// =====================================================================

import { CRM_STATUS_LABEL, DIGITAL_PRESENCE_LABEL } from './labels'
import type { Lead } from '../types'

/** Escapa un valor para CSV (comillas + separadores + saltos de linea). */
function escapeCell(value: unknown): string {
  const s = value === undefined || value === null ? '' : String(value)
  if (/[",\n;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

const HEADERS = [
  'Nombre',
  'Rubro',
  'Zona',
  'Direccion',
  'Telefono',
  'WhatsApp',
  'Sitio web',
  'Instagram',
  'Presencia digital',
  'Puntaje',
  'Motivo',
  'Estado CRM',
  'Notas',
  'Ultimo contacto',
  'Proximo seguimiento',
]

/** Genera el contenido CSV (con BOM para que Excel respete acentos). */
export function leadsToCsv(leads: Lead[]): string {
  const rows = leads.map((l) =>
    [
      l.name,
      l.category,
      l.zone,
      l.address,
      l.phone ?? '',
      l.whatsapp ?? '',
      l.website ?? '',
      l.instagram ?? '',
      DIGITAL_PRESENCE_LABEL[l.digitalPresence],
      l.score,
      l.scoreReason,
      CRM_STATUS_LABEL[l.crmStatus],
      l.notes,
      l.lastContactDate ?? '',
      l.nextFollowUpDate ?? '',
    ]
      .map(escapeCell)
      .join(','),
  )
  return '\uFEFF' + [HEADERS.join(','), ...rows].join('\n')
}

/** Dispara la descarga del CSV en el navegador. */
export function downloadLeadsCsv(leads: Lead[], filename = 'vigolo-leads.csv'): void {
  const csv = leadsToCsv(leads)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
