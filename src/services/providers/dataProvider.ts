// =====================================================================
// Data Provider: fachada única para buscar negocios.
//
//  MODO REAL (por defecto):
//    - Si hay backend configurado → llama a Google Places (New) vía el
//      backend/proxy (protege la API key) con paginación.
//    - Cae a datos demo SOLO cuando: no hay backend / no hay conexión /
//      Google devuelve error.
//  MODO DEMO:
//    - Siempre usa el dataset demo (respaldo, sin tocar Google).
//
//  Cada búsqueda devuelve un SearchOutcome con el ORIGEN de los datos
//  (google | mock) para que la UI muestre 🟢 real / 🟡 demo sin confundir.
//
//  Caché inteligente: guarda resultados reales recientes (TTL) para no
//  consultar Google innecesariamente ante búsquedas repetidas.
// =====================================================================

import { BACKEND_CONFIGURED, PROVIDERS } from '../../config/app'
import { buildLead, type RawBusiness } from '../leadFactory'
import { MOCK_LEADS } from './mockData'
import type { DataMode } from '../../store/useSettings'
import type { Lead, SearchParams } from '../../types'

/** Por qué una búsqueda terminó usando datos demo. */
export type DemoReason =
  | 'mode-demo' // el usuario eligió Modo Demo
  | 'no-config' // no hay backend configurado (VITE_API_BASE_URL)
  | 'no-connection' // no se pudo contactar el backend
  | 'api-error' // Google Places devolvió un error

export interface SearchOutcome {
  leads: Lead[]
  /** Origen real de los datos entregados. */
  source: 'google' | 'mock'
  /** Se pidió Modo Real pero se terminó usando demo (respaldo). */
  fellBack: boolean
  /** Motivo por el que se usó demo (si aplica). */
  reason?: DemoReason
  /** Resultado servido desde caché (sin volver a llamar a Google). */
  fromCache: boolean
  /** Mensaje legible para la UI. */
  note: string
}

export interface SearchOptions {
  mode?: DataMode // 'real' (default) | 'demo'
  force?: boolean // ignora la caché y vuelve a consultar Google
  maxPages?: number // páginas de Google Places a recorrer (paginación)
}

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
  await delay(200)
  return applyFilters(MOCK_LEADS, p)
}

// --------------------------------------------------------------------
// Caché inteligente (en memoria, TTL). Evita re-consultar Google ante
// búsquedas repetidas dentro de la sesión.
// --------------------------------------------------------------------
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 min
const cache = new Map<string, { at: number; leads: Lead[] }>()

/** Clave estable de caché a partir de los parámetros relevantes. */
function cacheKey(p: SearchParams, maxPages: number): string {
  return JSON.stringify({
    n: p.nationwide, pr: normalize(p.province), ci: normalize(p.city),
    q: normalize(p.query), cat: normalize(p.category), r: p.radiusKm,
    mr: p.minRating, mrv: p.minReviews, on: p.openNow, hw: p.hasWebsite,
    hp: p.hasPhone, hi: p.hasInstagram, vo: p.verifiedOnly, mp: maxPages,
  })
}

/** Limpia la caché (útil al cambiar de modo o al forzar refresco). */
export function clearSearchCache(): void {
  cache.clear()
}

class GoogleError extends Error {
  reason: DemoReason
  constructor(message: string, reason: DemoReason) {
    super(message)
    this.reason = reason
  }
}

/**
 * Consulta el backend/proxy que hace la Text Search en Google Places (New)
 * y devuelve `RawBusiness[]`, mapeados con `buildLead` para reutilizar el
 * score. La API key vive en el backend: nunca en el navegador.
 */
async function searchGoogle(params: SearchParams, maxPages: number): Promise<Lead[]> {
  if (!BACKEND_CONFIGURED) {
    throw new GoogleError('No hay backend configurado (VITE_API_BASE_URL).', 'no-config')
  }
  let res: Response
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 20000)
    res = await fetch(`${PROVIDERS.apiBaseUrl}/places/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, maxPages }),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
  } catch (e) {
    throw new GoogleError(
      e instanceof Error ? e.message : 'No se pudo contactar el backend.',
      'no-connection',
    )
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new GoogleError(`Google Places respondió ${res.status}. ${text}`.trim(), 'api-error')
  }
  const raw = (await res.json().catch(() => [])) as RawBusiness[]
  if (!Array.isArray(raw)) throw new GoogleError('Respuesta inválida del backend.', 'api-error')
  return raw.map((r) => buildLead({ ...r, source: 'google' }))
}

const REASON_NOTE: Record<DemoReason, string> = {
  'mode-demo': 'Modo Demo activo · datos de demostración',
  'no-config': 'Sin backend configurado · usando datos demo',
  'no-connection': 'Sin conexión con el backend · usando datos demo',
  'api-error': 'Google Places devolvió un error · usando datos demo',
}

/**
 * Búsqueda principal. Real-first con respaldo automático a demo.
 * Devuelve un SearchOutcome con el origen real de los datos.
 */
export async function searchBusinesses(
  params: SearchParams,
  opts: SearchOptions = {},
): Promise<SearchOutcome> {
  const mode: DataMode = opts.mode ?? 'real'
  const maxPages = opts.maxPages ?? 3

  // Modo Demo: nunca toca Google.
  if (mode === 'demo') {
    return {
      leads: await searchMock(params),
      source: 'mock',
      fellBack: false,
      reason: 'mode-demo',
      fromCache: false,
      note: REASON_NOTE['mode-demo'],
    }
  }

  // Modo Real: caché → Google → respaldo demo.
  const key = cacheKey(params, maxPages)
  if (!opts.force) {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return {
        leads: hit.leads,
        source: 'google',
        fellBack: false,
        fromCache: true,
        note: `Datos reales de Google (caché · ${hit.leads.length})`,
      }
    }
  }

  try {
    const leads = await searchGoogle(params, maxPages)
    cache.set(key, { at: Date.now(), leads })
    return {
      leads,
      source: 'google',
      fellBack: false,
      fromCache: false,
      note: `Datos reales de Google (${leads.length})`,
    }
  } catch (e) {
    const reason: DemoReason = e instanceof GoogleError ? e.reason : 'api-error'
    return {
      leads: await searchMock(params),
      source: 'mock',
      fellBack: true,
      reason,
      fromCache: false,
      note: REASON_NOTE[reason],
    }
  }
}

/** Provider de datos configurado en build (solo informativo). */
export const activeDataProvider = PROVIDERS.data
