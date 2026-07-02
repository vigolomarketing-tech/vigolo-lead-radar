// =====================================================================
// Persistencia local (localStorage)
// ---------------------------------------------------------------------
// MVP: guardamos los leads en el navegador para no perder el trabajo de
// CRM entre recargas. Cuando se conecte una base de datos / Google Sheets
// (ver src/services), reemplazar estas funciones por llamadas al backend.
// =====================================================================

import type { Lead } from '../types'

const STORAGE_KEY = 'vigolo-lead-radar:leads:v1'

export function loadLeads(): Lead[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed as Lead[]
  } catch {
    return null
  }
}

export function saveLeads(leads: Lead[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  } catch {
    // Silencioso: si falla (modo incognito / cuota), la app sigue en memoria.
  }
}

export function clearLeads(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
}
