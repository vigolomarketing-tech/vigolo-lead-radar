// =====================================================================
// Datos mock / demo realistas
// ---------------------------------------------------------------------
// Negocios de la zona sur del GBA + CABA. Cada entrada define solo las
// senales crudas; el puntaje/presencia se calcula con el motor de scoring
// para mantener una unica fuente de verdad.
//
// Cuando se conecte Google Places (ver placesService.ts), estos datos se
// reemplazan por resultados reales con la misma forma.
// =====================================================================

import { computeScore } from '../lib/scoring'
import type { CrmStatus, Lead } from '../types'

interface RawBusiness {
  name: string
  category: string
  zone: string
  address: string
  phone?: string
  whatsapp?: string
  website?: string
  websiteQuality?: 'vieja' | 'aceptable'
  instagram?: string
  hasActiveInstagram?: boolean
  reviewsCount?: number
  rating?: number
  // Estado inicial de CRM (para que la demo no arranque toda en "nuevo")
  crmStatus?: CrmStatus
  notes?: string
  lastContactDate?: string
  nextFollowUpDate?: string
}

const RAW: RawBusiness[] = [
  {
    name: 'Barberia El Corte Fino',
    category: 'Barberia',
    zone: 'Longchamps',
    address: 'Av. Hipolito Yrigoyen 12450, Longchamps',
    whatsapp: '+54 9 11 3456-7890',
    instagram: '@elcortefino.barber',
    hasActiveInstagram: true,
    reviewsCount: 68,
    rating: 4.8,
  },
  {
    name: 'Gimnasio Titan Fit',
    category: 'Gimnasio',
    zone: 'Adrogue',
    address: 'Diagonal Brown 1520, Adrogue',
    phone: '011 4293-5510',
    whatsapp: '+54 9 11 6677-1122',
    instagram: '@titanfit.adrogue',
    hasActiveInstagram: true,
    reviewsCount: 145,
    rating: 4.6,
  },
  {
    name: 'Parrilla Don Ramon',
    category: 'Restaurante',
    zone: 'Burzaco',
    address: 'Av. Espora 980, Burzaco',
    phone: '011 4238-7744',
    website: 'http://parrilladonramon.com.ar',
    websiteQuality: 'vieja',
    instagram: '@donramon.parrilla',
    hasActiveInstagram: true,
    reviewsCount: 210,
    rating: 4.5,
  },
  {
    name: 'Estetica Bella Piel',
    category: 'Estetica',
    zone: 'Lomas de Zamora',
    address: 'Laprida 320, Lomas de Zamora',
    whatsapp: '+54 9 11 5566-4433',
    instagram: '@bellapiel.estetica',
    hasActiveInstagram: true,
    reviewsCount: 34,
    rating: 4.9,
  },
  {
    name: 'Ferreteria El Tornillo',
    category: 'Ferreteria',
    zone: 'Longchamps',
    address: 'Av. Mariano Castex 455, Longchamps',
    phone: '011 4295-3321',
    reviewsCount: 22,
    rating: 4.3,
  },
  {
    name: 'Cafe de Barrio',
    category: 'Cafeteria',
    zone: 'Adrogue',
    address: 'Esteban Adrogue 1140, Adrogue',
    whatsapp: '+54 9 11 2233-8899',
    instagram: '@cafedebarrio.adrogue',
    hasActiveInstagram: true,
    reviewsCount: 89,
    rating: 4.7,
  },
  {
    name: 'Inmobiliaria Sur Propiedades',
    category: 'Inmobiliaria',
    zone: 'Lomas de Zamora',
    address: 'Av. Meeks 540, Lomas de Zamora',
    phone: '011 4244-1200',
    website: 'https://surpropiedades.com.ar',
    websiteQuality: 'aceptable',
    instagram: '@surpropiedades',
    hasActiveInstagram: true,
    reviewsCount: 41,
    rating: 4.1,
  },
  {
    name: 'Electricista Matriculado Gomez',
    category: 'Electricista',
    zone: 'Burzaco',
    address: 'Alsina 233, Burzaco',
    whatsapp: '+54 9 11 3344-5566',
    reviewsCount: 17,
    rating: 4.9,
    crmStatus: 'contactado',
    notes: 'Contestó por WhatsApp, pidió que le pase ejemplos de webs.',
    lastContactDate: '2026-06-25',
    nextFollowUpDate: '2026-07-04',
  },
  {
    name: 'Peluqueria Studio Glam',
    category: 'Peluqueria',
    zone: 'CABA',
    address: 'Av. Rivadavia 5320, Caballito, CABA',
    whatsapp: '+54 9 11 7788-9900',
    instagram: '@studioglam.caba',
    hasActiveInstagram: true,
    reviewsCount: 126,
    rating: 4.7,
  },
  {
    name: 'Restaurante La Nonna',
    category: 'Restaurante',
    zone: 'CABA',
    address: 'Gorriti 4890, Palermo, CABA',
    phone: '011 4832-6600',
    website: 'https://lanonna-palermo.com',
    websiteQuality: 'aceptable',
    instagram: '@lanonna.palermo',
    hasActiveInstagram: true,
    reviewsCount: 512,
    rating: 4.4,
  },
  {
    name: 'Consultorio Odontologico Sonrisas',
    category: 'Odontologia',
    zone: 'Adrogue',
    address: 'Macias 165, Adrogue',
    phone: '011 4214-9080',
    whatsapp: '+54 9 11 4455-2211',
    reviewsCount: 58,
    rating: 4.8,
    crmStatus: 'interesado',
    notes: 'Le interesa una web con turnos online. Reunión a coordinar.',
    lastContactDate: '2026-06-28',
    nextFollowUpDate: '2026-07-03',
  },
  {
    name: 'Verduleria Organica Raiz',
    category: 'Verduleria',
    zone: 'Longchamps',
    address: 'Roca 780, Longchamps',
    instagram: '@raiz.organica',
    hasActiveInstagram: true,
    reviewsCount: 9,
    rating: 4.6,
  },
  {
    name: 'Taller Mecanico RPM',
    category: 'Taller mecanico',
    zone: 'Burzaco',
    address: 'Av. Monteverde 1450, Burzaco',
    phone: '011 4299-2100',
    reviewsCount: 73,
    rating: 4.2,
  },
  {
    name: 'Pastas Frescas La Emilia',
    category: 'Rotiseria',
    zone: 'Lomas de Zamora',
    address: 'Sarmiento 410, Lomas de Zamora',
    whatsapp: '+54 9 11 6611-2233',
    instagram: '@laemilia.pastas',
    hasActiveInstagram: false,
    reviewsCount: 47,
    rating: 4.5,
  },
  {
    name: 'Estudio Contable Balance',
    category: 'Estudio contable',
    zone: 'CABA',
    address: 'Lavalle 1620, CABA',
    phone: '011 4373-5500',
    website: 'https://estudiobalance.com.ar',
    websiteQuality: 'vieja',
    reviewsCount: 28,
    rating: 4.0,
  },
  {
    name: 'Gimnasio CrossBox Sur',
    category: 'Gimnasio',
    zone: 'Burzaco',
    address: 'Yrigoyen 4200, Burzaco',
    whatsapp: '+54 9 11 9900-1122',
    instagram: '@crossbox.sur',
    hasActiveInstagram: true,
    reviewsCount: 96,
    rating: 4.9,
    crmStatus: 'respondio',
    notes: 'Respondió el DM, quiere saber precios.',
    lastContactDate: '2026-06-30',
    nextFollowUpDate: '2026-07-02',
  },
  {
    name: 'Veterinaria Patitas',
    category: 'Veterinaria',
    zone: 'Adrogue',
    address: 'Somellera 340, Adrogue',
    phone: '011 4294-7788',
    instagram: '@vetpatitas.adrogue',
    hasActiveInstagram: true,
    reviewsCount: 64,
    rating: 4.8,
  },
  {
    name: 'Heladeria Cremosa',
    category: 'Heladeria',
    zone: 'Longchamps',
    address: 'Av. H. Yrigoyen 13100, Longchamps',
    whatsapp: '+54 9 11 5522-3344',
    instagram: '@cremosa.helados',
    hasActiveInstagram: true,
    reviewsCount: 38,
    rating: 4.7,
  },
  {
    name: 'Inmobiliaria Nuñez & Asoc.',
    category: 'Inmobiliaria',
    zone: 'CABA',
    address: 'Av. Cabildo 2280, Nuñez, CABA',
    phone: '011 4788-3300',
    website: 'https://nunezpropiedades.com.ar',
    websiteQuality: 'aceptable',
    reviewsCount: 71,
    rating: 4.2,
  },
  {
    name: 'Cerrajeria 24hs Llave Maestra',
    category: 'Cerrajeria',
    zone: 'Lomas de Zamora',
    address: 'Boedo 155, Lomas de Zamora',
    whatsapp: '+54 9 11 3322-7788',
    reviewsCount: 31,
    rating: 4.6,
    crmStatus: 'descartado',
    notes: 'No le interesa, ya trabaja solo con recomendados.',
    lastContactDate: '2026-06-20',
  },
]

/** Genera un id estable simple a partir del nombre + zona. */
function slugId(name: string, zone: string): string {
  return (
    (name + '-' + zone)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  )
}

/** Convierte una senal cruda en un Lead completo (con scoring aplicado). */
export function buildLead(raw: RawBusiness, createdAt = '2026-07-01'): Lead {
  const scoring = computeScore(raw)
  return {
    id: slugId(raw.name, raw.zone),
    name: raw.name,
    category: raw.category,
    zone: raw.zone,
    address: raw.address,
    phone: raw.phone,
    whatsapp: raw.whatsapp,
    website: raw.website,
    instagram: raw.instagram,
    reviewsCount: raw.reviewsCount,
    rating: raw.rating,
    hasActiveInstagram: raw.hasActiveInstagram,
    digitalPresence: scoring.digitalPresence,
    score: scoring.score,
    scoreReason: scoring.scoreReason,
    crmStatus: raw.crmStatus ?? 'nuevo',
    notes: raw.notes ?? '',
    lastContactDate: raw.lastContactDate,
    nextFollowUpDate: raw.nextFollowUpDate,
    createdAt,
    source: 'mock',
  }
}

/** Set inicial de leads demo. */
export const MOCK_LEADS: Lead[] = RAW.map((r) => buildLead(r))

/** Rubros y zonas presentes en la demo (para autocompletar / filtros). */
export const DEMO_CATEGORIES = Array.from(
  new Set(RAW.map((r) => r.category)),
).sort()

export const DEMO_ZONES = Array.from(new Set(RAW.map((r) => r.zone))).sort()
