import { CURRENCY } from '../config/app'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(CURRENCY.locale).format(value)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function relativeDay(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const today = new Date()
  const diff = Math.round(
    (d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000,
  )
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  if (diff === -1) return 'Ayer'
  if (diff < 0) return `Hace ${Math.abs(diff)} días`
  return `En ${diff} días`
}
