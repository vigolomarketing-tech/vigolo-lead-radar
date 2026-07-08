// =====================================================================
// Dataset DEMO NACIONAL (toda Argentina) — 100% ficticio y marcado como
// tal (source: 'mock'). Sirve para probar la herramienta sin backend.
// Cuando se conecta Google Places, se reemplaza por empresas reales.
// NO representa empresas reales: los nombres son genéricos de ejemplo.
// =====================================================================

import { ARGENTINA } from '../../config/argentina'
import { INDUSTRY_NAMES } from '../../config/machines'
import { buildLead, type RawBusiness } from '../leadFactory'
import type { Lead } from '../../types'

// --- Leads curados (con historial de CRM para que la demo arranque viva) ---
const CURATED: RawBusiness[] = [
  {
    name: 'Metalúrgica del Sur (DEMO)', category: 'Metalúrgica', province: 'Buenos Aires', city: 'Lomas de Zamora', zone: 'Lomas de Zamora',
    address: 'Av. Meeks 1840, Lomas de Zamora', location: { lat: -34.761, lng: -58.401 }, openNow: true,
    signals: { phone: '011 4292-5510', whatsapp: '+54 9 11 3456-7890', website: 'https://metalurgicadelsur.com.ar', websiteQuality: 'aceptable', instagram: '@metalurgicadelsur', hasActiveInstagram: true, reviewsCount: 128, rating: 4.7, verified: true, email: 'ventas@metalurgicadelsur.com.ar' },
    stage: 'interesado', notes: 'Hoy tercerizan el corte de chapa. Interesados en la láser fibra 3015.', lastContactDate: '2026-06-28', nextFollowUpDate: '2026-07-04', tags: ['caliente', 'láser-fibra'],
  },
  {
    name: 'Herrería Artística Rivas (DEMO)', category: 'Herrería industrial', province: 'Buenos Aires', city: 'Burzaco', zone: 'Burzaco',
    address: 'Alsina 233, Burzaco', location: { lat: -34.822, lng: -58.396 }, openNow: true,
    signals: { whatsapp: '+54 9 11 3344-5566', instagram: '@herreriarivas', hasActiveInstagram: true, reviewsCount: 46, rating: 4.9, verified: true },
    stage: 'contactado', notes: 'Contestó por WhatsApp, pidió ficha técnica de corte de hierro.', lastContactDate: '2026-06-25', nextFollowUpDate: '2026-07-03', tags: ['caliente'],
  },
  {
    name: 'Cartelería Neón Digital (DEMO)', category: 'Cartelería / señalética', province: 'CABA', city: 'Caballito', zone: 'Caballito',
    address: 'Av. Rivadavia 5200, Caballito, CABA', location: { lat: -34.619, lng: -58.441 }, openNow: true,
    signals: { phone: '011 4903-2200', whatsapp: '+54 9 11 4455-2211', website: 'https://neondigital.com.ar', websiteQuality: 'moderna', instagram: '@neondigital.carteles', hasActiveInstagram: true, reviewsCount: 212, rating: 4.6, verified: true },
    stage: 'respondio', notes: 'Quieren cotización de CO2 100W para letras corpóreas de acrílico.', lastContactDate: '2026-06-30', nextFollowUpDate: '2026-07-02', tags: ['acrílico'],
  },
  {
    name: 'Muebles a Medida Nogal (DEMO)', category: 'Fábrica de muebles', province: 'Córdoba', city: 'Córdoba', zone: 'Córdoba',
    address: 'Av. Colón 3400, Córdoba', location: { lat: -31.420, lng: -64.188 }, openNow: true,
    signals: { phone: '0351 456-7788', whatsapp: '+54 9 351 667-1122', instagram: '@noguera.muebles', hasActiveInstagram: true, reviewsCount: 89, rating: 4.5, verified: true },
    stage: 'nuevo', tags: ['MDF'],
  },
  {
    name: 'Marmolería La Piedra (DEMO)', category: 'Marmolería', province: 'Santa Fe', city: 'Rosario', zone: 'Rosario',
    address: 'Bv. Oroño 2100, Rosario', location: { lat: -32.958, lng: -60.639 }, openNow: true,
    signals: { phone: '0341 425-9080', whatsapp: '+54 9 341 455-9080', reviewsCount: 57, rating: 4.8, verified: true },
    stage: 'nuevo', notes: 'Graban lápidas a mano. Candidata a grabadora fibra.', tags: ['piedra'],
  },
  {
    name: 'Taller Mecanizado Precisión (DEMO)', category: 'Mecanizado / CNC', province: 'Santa Fe', city: 'Rafaela', zone: 'Rafaela',
    address: 'Ruta 34 Km 227, Rafaela', location: { lat: -31.253, lng: -61.492 }, openNow: true,
    signals: { phone: '03492 42-1100', website: 'https://mecanizadoprecision.com.ar', websiteQuality: 'aceptable', reviewsCount: 74, rating: 4.7, verified: true },
    stage: 'nuevo', tags: ['metal'],
  },
  {
    name: 'Trofeos & Grabados Copa (DEMO)', category: 'Trofeos y premios', province: 'Mendoza', city: 'Mendoza', zone: 'Mendoza',
    address: 'San Martín 1450, Mendoza', location: { lat: -32.889, lng: -68.845 }, openNow: true,
    signals: { whatsapp: '+54 9 261 344-5566', instagram: '@copa.trofeos', hasActiveInstagram: true, reviewsCount: 33, rating: 4.9 },
    stage: 'nuevo', tags: ['personalización'],
  },
]

// --- Generación determinística nacional (empresas ficticias de ejemplo) ---
const PREFIX = ['Industrias', 'Grupo', 'Taller', 'Fábrica', 'Metal', 'Tecno', 'Súper', 'Don']
const CORE = ['del Plata', 'Norte', 'Sur', 'Argentina', 'Andina', 'Central', 'Pampa', 'Litoral', 'Cuyo', 'Austral']
const SUFFIX = ['S.R.L.', 'S.A.', 'Hnos.', '& Cía.', 'Industrial', 'Group', '', '']

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

function slugCity(city: string): string {
  return city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '').slice(0, 8)
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
  const shortCat = category.split(' ')[0].split('/')[0]
  const name = `${pick(PREFIX, r())} ${shortCat} ${pick(CORE, r())} ${pick(SUFFIX, r())}`.replace(/\s+/g, ' ').trim()
  const reviews = Math.floor(r() * 180)
  const rating = Math.round((3.8 + r() * 1.2) * 10) / 10
  const roll = r()
  // Empresas industriales: ~55% tienen web (más formales que un comercio).
  const website =
    roll < 0.45
      ? undefined
      : `${roll < 0.65 ? 'http' : 'https'}://${slugCity(shortCat)}-${slugCity(city)}.com.ar`
  const websiteQuality = !website ? undefined : roll < 0.65 ? 'vieja' : roll < 0.85 ? 'aceptable' : 'moderna'
  const hasIg = r() > 0.35
  return {
    name,
    category,
    province,
    city,
    zone: city,
    address: `${pick(['Parque Industrial', 'Av. San Martín', 'Ruta 8 Km', 'Av. Circunvalación', 'Belgrano', 'Ruta 9 Km'], r())} ${100 + Math.floor(r() * 3800)}, ${city}`,
    location: { lat: jitter(lat, r()), lng: jitter(lng, r()) },
    openNow: r() > 0.4,
    signals: {
      website,
      websiteQuality,
      instagram: hasIg ? `@${slugCity(shortCat)}.${slugCity(city)}` : undefined,
      hasActiveInstagram: hasIg && r() > 0.3,
      facebook: r() > 0.6 ? 'fb-page' : undefined,
      reviewsCount: reviews,
      rating,
      phone: r() > 0.25 ? `0${Math.floor(r() * 3) + 2}${Math.floor(1000000 + r() * 8999999)}` : undefined,
      whatsapp: r() > 0.4 ? `+54 9 11 ${Math.floor(1000 + r() * 8999)}-${Math.floor(1000 + r() * 8999)}` : undefined,
      verified: r() > 0.5,
    },
  }
}

function generateNational(): RawBusiness[] {
  const out: RawBusiness[] = []
  let seed = 1337
  ARGENTINA.forEach((prov, pi) => {
    prov.cities.forEach((city, ci) => {
      // 4-6 empresas por ciudad, rubros industriales rotados.
      const count = 4 + ((pi + ci) % 3)
      for (let i = 0; i < count; i++) {
        const category = INDUSTRY_NAMES[(pi * 7 + ci * 3 + i * 5) % INDUSTRY_NAMES.length]
        out.push(genBusiness(prov.name, city.name, city.lat, city.lng, category, (seed += 101)))
      }
    })
  })
  return out
}

export const MOCK_LEADS: Lead[] = [...CURATED, ...generateNational()].map((r) =>
  buildLead(r),
)
