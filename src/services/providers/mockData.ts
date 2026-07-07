// =====================================================================
// Dataset DEMO nacional.
// Son empresas ficticias, marcadas como demo, para probar el flujo sin
// inventar companias reales. El provider Google reemplaza esto con datos vivos.
// =====================================================================

import { ARGENTINA, CATEGORIES } from '../../config/argentina'
import { recommendMachineForCategory } from '../../config/machines'
import type { BusinessSignals, Lead } from '../../types'
import { buildLead, type RawBusiness } from '../leadFactory'

const MATERIALS_BY_CATEGORY: Record<string, string[]> = {
  metalurgica: ['acero carbono', 'acero inoxidable', 'aluminio'],
  metalmecanica: ['acero carbono', 'aluminio', 'bronce'],
  autopartista: ['acero carbono', 'acero inoxidable', 'aluminio'],
  matriceria: ['acero', 'aluminio', 'herramientas'],
  carpinteria: ['MDF', 'madera', 'acrilico'],
  muebleria: ['MDF', 'madera'],
  carteleria: ['acrilico', 'MDF', 'aluminio compuesto'],
  constructora: ['hormigon', 'estructura metalica'],
  fabrica: ['acero', 'MDF', 'plastico tecnico'],
  packaging: ['carton', 'acrilico', 'madera fina'],
  grafica: ['acrilico', 'carton', 'goma'],
}

const CURATED: RawBusiness[] = [
  industrialDemo({
    name: 'Demo Metalurgica Sur (ficticia)',
    category: 'Metalurgica',
    province: 'Buenos Aires',
    city: 'Longchamps',
    lat: -34.858,
    lng: -58.392,
    stage: 'contactado',
    notes: 'DEMO: fabrica piezas de chapa y terceriza corte laser. Calificar volumen mensual y espacio disponible.',
    tags: ['demo', 'fibra', 'corte-chapa'],
    signals: {
      hasCnc: true,
      currentMachinery: ['plegadora', 'soldadura MIG', 'pantografo tercerizado'],
      productionSignals: ['series cortas', 'trabajos para estructuras'],
      materials: ['acero carbono', 'acero inoxidable'],
      reviewsCount: 42,
      rating: 4.6,
      phone: '+54 11 0000-1001',
      whatsapp: '+54 9 11 0000-1001',
      verified: true,
    },
  }),
  industrialDemo({
    name: 'Demo Carpinteria CNC Norte (ficticia)',
    category: 'Carpinteria',
    province: 'Buenos Aires',
    city: 'Adrogue',
    lat: -34.802,
    lng: -58.389,
    stage: 'interesado',
    notes: 'DEMO: produce muebles a medida y cocinas. Buen fit para CO2 por MDF y grabado.',
    tags: ['demo', 'co2', 'muebles'],
    signals: {
      currentMachinery: ['escuadradora', 'router tercerizado'],
      productionSignals: ['muebles a medida', 'cocinas'],
      materials: ['MDF', 'madera', 'acrilico'],
      reviewsCount: 71,
      rating: 4.8,
      instagram: '@demo.carpinteria',
      hasActiveInstagram: true,
      whatsapp: '+54 9 11 0000-1002',
      verified: true,
    },
  }),
  industrialDemo({
    name: 'Demo Carteleria Centro (ficticia)',
    category: 'Carteleria',
    province: 'CABA',
    city: 'Palermo',
    lat: -34.588,
    lng: -58.43,
    stage: 'respondio',
    notes: 'DEMO: trabaja acrilico y senaletica. Consultar mesa requerida y potencia actual.',
    tags: ['demo', 'co2', 'acrilico'],
    signals: {
      hasLaser: true,
      currentMachinery: ['plotter', 'laser CO2 chico'],
      productionSignals: ['senalizacion', 'letras corporeas'],
      materials: ['acrilico', 'MDF', 'aluminio compuesto'],
      reviewsCount: 105,
      rating: 4.5,
      website: 'https://demo-carteleria.example',
      websiteQuality: 'aceptable',
      phone: '+54 11 0000-1003',
      verified: true,
    },
  }),
  industrialDemo({
    name: 'Demo Autopartista Cordoba (ficticia)',
    category: 'Autopartista',
    province: 'Cordoba',
    city: 'Cordoba',
    lat: -31.42,
    lng: -64.188,
    stage: 'nuevo',
    tags: ['demo', 'fibra', 'autopartes'],
    signals: {
      hasCnc: true,
      exportsOrLargeClients: true,
      currentMachinery: ['torno CNC', 'soldadura', 'matriceria'],
      productionSignals: ['piezas seriadas', 'proveedor industrial'],
      materials: ['acero carbono', 'aluminio'],
      reviewsCount: 18,
      rating: 4.3,
      phone: '+54 351 000-1004',
      verified: true,
    },
  }),
  industrialDemo({
    name: 'Demo Matriceria Precision (ficticia)',
    category: 'Matriceria',
    province: 'Santa Fe',
    city: 'Rosario',
    lat: -32.958,
    lng: -60.639,
    stage: 'propuesta',
    proposalSent: true,
    tags: ['demo', 'grabadora-fibra', 'trazabilidad'],
    signals: {
      hasCnc: true,
      currentMachinery: ['centro de mecanizado', 'torno'],
      productionSignals: ['herramientas', 'piezas seriadas'],
      materials: ['acero', 'aluminio', 'herramientas'],
      reviewsCount: 12,
      rating: 4.7,
      whatsapp: '+54 9 341 000-1005',
      verified: true,
    },
  }),
  industrialDemo({
    name: 'Demo Escuela Tecnica Maker (ficticia)',
    category: 'Escuela tecnica',
    province: 'Mendoza',
    city: 'Mendoza',
    lat: -32.889,
    lng: -68.845,
    stage: 'nuevo',
    tags: ['demo', 'educacion', 'co2-compacta'],
    signals: {
      currentMachinery: ['impresoras 3D', 'kits de robotica'],
      productionSignals: ['aula taller', 'prototipado'],
      materials: ['MDF', 'acrilico', 'carton'],
      reviewsCount: 38,
      rating: 4.4,
      phone: '+54 261 000-1006',
      verified: true,
    },
  }),
]

interface DemoInput {
  name: string
  category: string
  province: string
  city: string
  lat: number
  lng: number
  stage?: RawBusiness['stage']
  notes?: string
  tags?: string[]
  proposalSent?: boolean
  signals: BusinessSignals
}

function industrialDemo(input: DemoInput): RawBusiness {
  return {
    name: input.name,
    category: input.category,
    province: input.province,
    city: input.city,
    zone: input.city,
    address: `Calle Demo 100, ${input.city}`,
    location: { lat: input.lat, lng: input.lng },
    openNow: true,
    signals: input.signals,
    stage: input.stage,
    notes: input.notes,
    tags: input.tags,
    proposalSent: input.proposalSent,
  }
}

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

function normalized(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function materialsFor(category: string): string[] {
  const c = normalized(category)
  const found = Object.entries(MATERIALS_BY_CATEGORY).find(([k]) => c.includes(k))
  if (found) return found[1]
  return recommendMachineForCategory(category).materials.slice(0, 3)
}

function machineryFor(category: string): string[] {
  const c = normalized(category)
  if (/metal|autopart|fabrica|estructura|aluminio|acero/.test(c)) return ['plegadora', 'soldadora', 'corte tercerizado']
  if (/carpinter|mueble|cocina|abertura/.test(c)) return ['escuadradora', 'router tercerizado', 'lijadora']
  if (/cartel|grafica|packaging/.test(c)) return ['plotter', 'laminadora', 'laser chico']
  if (/matric|grabado/.test(c)) return ['torno', 'centro de mecanizado']
  if (/escuela|universidad|diseno/.test(c)) return ['impresoras 3D', 'aula taller']
  if (/construct|hormigon/.test(c)) return ['mezcladora', 'herramientas de obra']
  return ['herramientas de taller']
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
  const suffix = pick(['Sur', 'Norte', 'Centro', 'Industrial', 'Precision', 'Produccion'], r())
  const reviews = Math.floor(r() * 120)
  const rating = Math.round((3.8 + r() * 1.1) * 10) / 10
  const hasWeb = r() > 0.5
  const hasIg = r() > 0.55
  const normalizedCategory = normalized(category).replace(/[^a-z0-9]/g, '')
  const normalizedCity = normalized(city).replace(/[^a-z0-9]/g, '').slice(0, 8)

  return {
    name: `Demo ${category} ${suffix} (ficticia)`,
    category,
    province,
    city,
    zone: city,
    address: `Parque Industrial Demo ${100 + Math.floor(r() * 800)}, ${city}`,
    location: { lat: jitter(lat, r()), lng: jitter(lng, r()) },
    openNow: r() > 0.35,
    signals: {
      website: hasWeb ? `https://demo-${normalizedCategory}-${normalizedCity}.example` : undefined,
      websiteQuality: hasWeb ? pick(['vieja', 'aceptable', 'moderna'] as const, r()) : undefined,
      instagram: hasIg ? `@demo.${normalizedCategory.slice(0, 10)}` : undefined,
      hasActiveInstagram: hasIg && r() > 0.35,
      reviewsCount: reviews,
      rating,
      phone: r() > 0.25 ? `+54 9 11 0000-${Math.floor(1000 + r() * 8999)}` : undefined,
      whatsapp: r() > 0.4 ? `+54 9 11 0000-${Math.floor(1000 + r() * 8999)}` : undefined,
      verified: r() > 0.45,
      currentMachinery: machineryFor(category),
      materials: materialsFor(category),
      hasCnc: r() > 0.55,
      hasLaser: r() > 0.7,
      exportsOrLargeClients: r() > 0.78,
      productionSignals: pick(
        [
          ['series cortas', 'terceriza corte'],
          ['produccion a medida', 'entregas semanales'],
          ['prototipado', 'bajos lotes'],
          ['obra y montaje', 'trabajos por proyecto'],
        ],
        r(),
      ),
    },
  }
}

function generateNational(): RawBusiness[] {
  const out: RawBusiness[] = []
  let seed = 2203
  ARGENTINA.forEach((prov, pi) => {
    prov.cities.forEach((city, ci) => {
      const count = 3 + ((pi + ci) % 3)
      for (let i = 0; i < count; i += 1) {
        const category = CATEGORIES[(pi * 5 + ci * 3 + i * 7) % CATEGORIES.length]
        out.push(genBusiness(prov.name, city.name, city.lat, city.lng, category, (seed += 97)))
      }
    })
  })
  return out
}

export const MOCK_LEADS: Lead[] = [...CURATED, ...generateNational()].map((r) =>
  buildLead(r),
)
