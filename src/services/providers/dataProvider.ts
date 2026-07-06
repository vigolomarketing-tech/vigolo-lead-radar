// =====================================================================
// Data Provider: fachada única para buscar negocios.
//  - 'mock'   → filtra el dataset demo (offline).
//  - 'google' → llama al backend/proxy (VITE_API_BASE_URL) que consulta
//               Google Places (New). Nunca se llama la API con la key
//               desde el navegador.
// La arquitectura permite sumar más proveedores sin tocar la UI.
// =====================================================================

import { PROVIDERS } from '../../config/app'
import { buildLead, type RawBusiness } from '../leadFactory'
import { MOCK_LEADS } from './mockData'
import type { Lead, SearchParams } from '../../types'

function normalize(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

/** Aplica los filtros de SearchParams a una lista de leads. */
function applyFilters(leads: Lead[], p: SearchParams): Lead[] {
  const zone = normalize(p.query)
  const cat = normalize(p.category)
  const prov = normalize(p.province)
  const city = normalize(p.city)
  return leads.filter((l) => {
    // Modo nacional ignora provincia/ciudad/texto de ubicación.
    if (!p.nationwide) {
      if (prov && normalize(l.province) !== prov) return false
      if (city && normalize(l.city) !== city) return false
      if (zone && !normalize(`${l.zone} ${l.city} ${l.address}`).includes(zone)) return false
    }
    if (cat && !normalize(`${l.category} ${l.categories?.join(' ') ?? ''}`).includes(cat)) return false
    if (p.minRating && (l.signals.rating ?? 0) < p.minRating) return false
    if (p.minReviews && (l.signals.reviewsCount ?? 0) < p.minReviews) return false
    if (p.openNow && !l.openingHours?.openNow) return false
    if (p.hasWebsite === 'yes' && l.digitalPresence === 'sin-web') return false
    if (p.hasWebsite === 'no' && l.digitalPresence !== 'sin-web') return false
    if (p.hasPhone && !l.signals.phone && !l.signals.whatsapp) return false
    if (p.hasInstagram && !l.signals.instagram) return false
    if (p.verifiedOnly && !l.signals.verified) return false
    return true
  })
}

async function searchMock(p: SearchParams): Promise<Lead[]> {
  await delay(650)
  return applyFilters(MOCK_LEADS, p)
}

/**
 * TODO(backend): implementar contra tu proxy. El proxy hace la Text Search +
 * Place Details en Google Places (New) y devuelve `RawBusiness[]`, que acá
 * mapeamos con `buildLead` para reutilizar el score.
 *
 *   const res = await fetch(`${PROVIDERS.apiBaseUrl}/places/search`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(params),
 *   })
 *   const raw: RawBusiness[] = await res.json()
 *   return raw.map((r) => buildLead({ ...r, source: 'google' }))
 */
async function searchGoogle(params: SearchParams): Promise<Lead[]> {
  if (!PROVIDERS.apiBaseUrl) {
    throw new Error(
      'Falta VITE_API_BASE_URL. El provider "google" requiere un backend/proxy que guarde la API key.',
    )
  }
  const res = await fetch(`${PROVIDERS.apiBaseUrl}/places/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`Backend respondió ${res.status}`)
  const raw: RawBusiness[] = await res.json()
  return raw.map((r) => buildLead({ ...r, source: 'google' }))
}

export async function searchBusinesses(params: SearchParams): Promise<Lead[]> {
  if (PROVIDERS.data === 'google') return searchGoogle(params)
  return searchMock(params)
}

export const activeDataProvider = PROVIDERS.data
