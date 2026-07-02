// =====================================================================
// Servicio de busqueda de negocios
// ---------------------------------------------------------------------
// Abstrae la fuente de datos detras de una unica funcion `searchBusinesses`.
// Hoy devuelve datos mock; el dia de manana, con la key de Google Places,
// se activa la rama real sin tocar el resto de la app.
// =====================================================================

import { buildLead, MOCK_LEADS } from '../data/mockLeads'
import type { Lead, SearchParams } from '../types'

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? 'mock'
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/** Simula latencia de red para que la UI de "buscando..." se vea real. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Busca negocios en mock filtrando por zona y rubro de forma tolerante
 * (coincidencia parcial, sin acentos).
 */
async function searchMock(params: SearchParams): Promise<Lead[]> {
  await delay(700)
  const zone = normalize(params.zone)
  const category = normalize(params.category)

  return MOCK_LEADS.filter((lead) => {
    const zoneMatch = !zone || normalize(lead.zone).includes(zone)
    const categoryMatch =
      !category || normalize(lead.category).includes(category)
    return zoneMatch && categoryMatch
  })
}

/**
 * TODO(API real): implementar con Google Places API (Text Search + Details).
 *
 * Flujo sugerido:
 *   1. Text Search: `${category} en ${zone}` -> lista de place_id.
 *   2. Place Details por cada uno -> nombre, direccion, telefono, website,
 *      rating, user_ratings_total.
 *   3. Mapear cada resultado con `buildLead(raw)` para reutilizar el scoring.
 *
 * Ejemplo (pseudocodigo):
 *   const res = await fetch(
 *     `https://places.googleapis.com/v1/places:searchText`,
 *     {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
 *         'X-Goog-FieldMask':
 *           'places.displayName,places.formattedAddress,places.websiteUri,' +
 *           'places.internationalPhoneNumber,places.rating,places.userRatingCount',
 *       },
 *       body: JSON.stringify({ textQuery: `${category} en ${zone}` }),
 *     },
 *   )
 *   const data = await res.json()
 *   return data.places.map((p) => buildLead({ ...map fields... }))
 *
 * OJO: la Places API no expone Instagram; se puede enriquecer despues.
 */
async function searchGoogle(_params: SearchParams): Promise<Lead[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error(
      'Falta VITE_GOOGLE_PLACES_API_KEY. Configurala en .env para usar Google Places.',
    )
  }
  // Placeholder: mientras no este implementada la llamada real, avisamos claro.
  // Reemplazar por la integracion descripta arriba y devolver Lead[].
  // Se referencia buildLead para dejar el punto de mapeo listo.
  void buildLead
  throw new Error('Google Places API todavia no esta implementada (ver placesService.ts).')
}

/** Punto de entrada unico usado por la app. */
export async function searchBusinesses(params: SearchParams): Promise<Lead[]> {
  if (DATA_SOURCE === 'google') {
    return searchGoogle(params)
  }
  return searchMock(params)
}

export const dataSource = DATA_SOURCE
