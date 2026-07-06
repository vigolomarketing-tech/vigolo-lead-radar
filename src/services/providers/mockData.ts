// =====================================================================
// Dataset demo NACIONAL (toda Argentina).
// Combina leads "curados" del GBA (con estado de CRM para la demo) con
// negocios generados determinísticamente por provincia/ciudad/rubro.
// Cuando se conecte Google Places, se reemplaza por resultados reales.
// =====================================================================

import { ARGENTINA, CATEGORIES } from '../../config/argentina'
import { buildLead, type RawBusiness } from '../leadFactory'
import type { Lead } from '../../types'

// --- Leads curados (con historial de CRM para que la demo arranque viva) ---
const CURATED: RawBusiness[] = [
  {
    name: 'Barbería El Corte Fino', category: 'Barbería', province: 'Buenos Aires', city: 'Longchamps', zone: 'Longchamps',
    address: 'Av. Hipólito Yrigoyen 12450, Longchamps', location: { lat: -34.858, lng: -58.392 }, openNow: true,
    signals: { whatsapp: '+54 9 11 3456-7890', instagram: '@elcortefino.barber', hasActiveInstagram: true, reviewsCount: 68, rating: 4.8, verified: true },
  },
  {
    name: 'Gimnasio Titán Fit', category: 'Gimnasio', province: 'Buenos Aires', city: 'Adrogué', zone: 'Adrogué',
    address: 'Diagonal Brown 1520, Adrogué', location: { lat: -34.802, lng: -58.389 }, openNow: true,
    signals: { phone: '011 4293-5510', whatsapp: '+54 9 11 6677-1122', instagram: '@titanfit.adrogue', hasActiveInstagram: true, reviewsCount: 145, rating: 4.6, verified: true },
  },
  {
    name: 'Electricista Matriculado Gómez', category: 'Electricista', province: 'Buenos Aires', city: 'Burzaco', zone: 'Burzaco',
    address: 'Alsina 233, Burzaco', location: { lat: -34.822, lng: -58.396 }, openNow: true,
    signals: { whatsapp: '+54 9 11 3344-5566', reviewsCount: 17, rating: 4.9 },
    stage: 'contactado', notes: 'Contestó por WhatsApp, pidió ejemplos de webs.', lastContactDate: '2026-06-25', nextFollowUpDate: '2026-07-04', tags: ['caliente'],
  },
  {
    name: 'Consultorio Odontológico Sonrisas', category: 'Odontología', province: 'Buenos Aires', city: 'Adrogué', zone: 'Adrogué',
    address: 'Macías 165, Adrogué', location: { lat: -34.804, lng: -58.386 }, openNow: true,
    signals: { phone: '011 4214-9080', whatsapp: '+54 9 11 4455-2211', reviewsCount: 58, rating: 4.8, verified: true },
    stage: 'interesado', notes: 'Le interesa una web con turnos online. Reunión a coordinar.', lastContactDate: '2026-06-28', nextFollowUpDate: '2026-07-03', tags: ['turnos', 'caliente'],
  },
  {
    name: 'Gimnasio CrossBox Sur', category: 'Gimnasio', province: 'Buenos Aires', city: 'Burzaco', zone: 'Burzaco',
    address: 'Yrigoyen 4200, Burzaco', location: { lat: -34.831, lng: -58.388 }, openNow: true,
    signals: { whatsapp: '+54 9 11 9900-1122', instagram: '@crossbox.sur', hasActiveInstagram: true, reviewsCount: 96, rating: 4.9, verified: true },
    stage: 'respondio', notes: 'Respondió el DM, quiere saber precios.', lastContactDate: '2026-06-30', nextFollowUpDate: '2026-07-02',
  },
  {
    name: 'Restaurante La Nonna', category: 'Restaurante', province: 'CABA', city: 'Palermo', zone: 'Palermo',
    address: 'Gorriti 4890, Palermo, CABA', location: { lat: -34.588, lng: -58.430 }, openNow: true,
    signals: { phone: '011 4832-6600', website: 'https://lanonna-palermo.com', websiteQuality: 'aceptable', instagram: '@lanonna.palermo', hasActiveInstagram: true, reviewsCount: 512, rating: 4.4, verified: true },
  },
  {
    name: 'Cervecería Patagonia Sur', category: 'Bar', province: 'Río Negro', city: 'Bariloche', zone: 'Bariloche',
    address: 'Mitre 320, Bariloche', location: { lat: -41.133, lng: -71.310 }, openNow: true,
    signals: { instagram: '@patagoniasur.beer', hasActiveInstagram: true, reviewsCount: 233, rating: 4.7, verified: true },
    stage: 'nuevo', tags: ['turístico'],
  },
]

// --- Generación determinística nacional ---
const NAMES: Record<string, string[]> = {
  default: ['Don', 'La', 'El', 'Nuevo', 'Central', 'Express', 'Premium', 'Sur', 'Norte'],
}
const SUFFIX = ['& Cía.', 'SRL', 'Center', 'Studio', 'Pro', 'Plus', 'Hnos.', '', '', '']

/** RNG determinístico (mulberry32) para datos estables entre recargas. */
function rng(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length]
}

function jitter(base: number, r: number): number {
  return base + (r - 0.5) * 0.06
}

function genBusiness(
  province: string,
  city: string,
  lat: number,
  lng: number,
  category: string,
  seed: number,
): RawBusiness {
  const r = rng(seed)
  const nameCore = `${pick(NAMES.default, r())} ${category.split(' ')[0]} ${pick(SUFFIX, r())}`.trim()
  const reviews = Math.floor(r() * 260)
  const rating = Math.round((3.6 + r() * 1.3) * 10) / 10
  const roll = r()
  // Distribución: 45% sin web, 25% web vieja, 18% aceptable, 12% buena.
  const website =
    roll < 0.45
      ? undefined
      : `${roll < 0.7 ? 'http' : 'https'}://${category.toLowerCase().replace(/[^a-z]/g, '')}-${city.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)}.com.ar`
  const websiteQuality = !website ? undefined : roll < 0.7 ? 'vieja' : roll < 0.88 ? 'aceptable' : 'moderna'
  const hasIg = r() > 0.4
  return {
    name: nameCore,
    category,
    province,
    city,
    zone: city,
    address: `${pick(['Av. San Martín', 'Belgrano', 'Mitre', 'Rivadavia', 'Sarmiento', 'España'], r())} ${100 + Math.floor(r() * 3800)}, ${city}`,
    location: { lat: jitter(lat, r()), lng: jitter(lng, r()) },
    openNow: r() > 0.4,
    signals: {
      website,
      websiteQuality,
      instagram: hasIg ? `@${category.toLowerCase().replace(/[^a-z]/g, '').slice(0, 6)}.${city.toLowerCase().replace(/[^a-z]/g, '').slice(0, 6)}` : undefined,
      hasActiveInstagram: hasIg && r() > 0.3,
      facebook: r() > 0.7 ? 'fb-page' : undefined,
      reviewsCount: reviews,
      rating,
      phone: r() > 0.3 ? `0${Math.floor(r() * 3) + 2}${Math.floor(1000000 + r() * 8999999)}` : undefined,
      whatsapp: r() > 0.45 ? `+54 9 11 ${Math.floor(1000 + r() * 8999)}-${Math.floor(1000 + r() * 8999)}` : undefined,
      verified: r() > 0.55,
    },
  }
}

function generateNational(): RawBusiness[] {
  const out: RawBusiness[] = []
  let seed = 1337
  ARGENTINA.forEach((prov, pi) => {
    prov.cities.forEach((city, ci) => {
      // 4-6 negocios por ciudad, rubros rotados.
      const count = 4 + ((pi + ci) % 3)
      for (let i = 0; i < count; i++) {
        const category = CATEGORIES[(pi * 7 + ci * 3 + i * 5) % CATEGORIES.length]
        out.push(genBusiness(prov.name, city.name, city.lat, city.lng, category, (seed += 101)))
      }
    })
  })
  return out
}

export const MOCK_LEADS: Lead[] = [...CURATED, ...generateNational()].map((r) =>
  buildLead(r),
)
