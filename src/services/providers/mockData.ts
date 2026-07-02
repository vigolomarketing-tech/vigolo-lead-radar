// =====================================================================
// Datos demo realistas (GBA sur + CABA) con coordenadas para el mapa.
// Cuando se conecte Google Places, se reemplazan por resultados reales.
// =====================================================================

import { buildLead, type RawBusiness } from '../leadFactory'
import type { Lead } from '../../types'

const RAW: RawBusiness[] = [
  {
    name: 'Barbería El Corte Fino', category: 'Barbería', zone: 'Longchamps',
    address: 'Av. Hipólito Yrigoyen 12450, Longchamps',
    location: { lat: -34.858, lng: -58.392 }, openNow: true,
    signals: { whatsapp: '+54 9 11 3456-7890', instagram: '@elcortefino.barber', hasActiveInstagram: true, reviewsCount: 68, rating: 4.8, verified: true },
  },
  {
    name: 'Gimnasio Titán Fit', category: 'Gimnasio', zone: 'Adrogué',
    address: 'Diagonal Brown 1520, Adrogué',
    location: { lat: -34.802, lng: -58.389 }, openNow: true,
    signals: { phone: '011 4293-5510', whatsapp: '+54 9 11 6677-1122', instagram: '@titanfit.adrogue', hasActiveInstagram: true, reviewsCount: 145, rating: 4.6, verified: true },
  },
  {
    name: 'Parrilla Don Ramón', category: 'Restaurante', zone: 'Burzaco',
    address: 'Av. Espora 980, Burzaco',
    location: { lat: -34.826, lng: -58.393 }, openNow: false,
    signals: { phone: '011 4238-7744', website: 'http://parrilladonramon.com.ar', websiteQuality: 'vieja', instagram: '@donramon.parrilla', hasActiveInstagram: true, facebook: 'donramonparrilla', reviewsCount: 210, rating: 4.5, verified: true },
  },
  {
    name: 'Estética Bella Piel', category: 'Estética', zone: 'Lomas de Zamora',
    address: 'Laprida 320, Lomas de Zamora',
    location: { lat: -34.760, lng: -58.401 }, openNow: true,
    signals: { whatsapp: '+54 9 11 5566-4433', instagram: '@bellapiel.estetica', hasActiveInstagram: true, reviewsCount: 34, rating: 4.9 },
  },
  {
    name: 'Ferretería El Tornillo', category: 'Ferretería', zone: 'Longchamps',
    address: 'Av. Mariano Castex 455, Longchamps',
    location: { lat: -34.861, lng: -58.385 }, openNow: true,
    signals: { phone: '011 4295-3321', reviewsCount: 22, rating: 4.3 },
  },
  {
    name: 'Café de Barrio', category: 'Cafetería', zone: 'Adrogué',
    address: 'Esteban Adrogué 1140, Adrogué',
    location: { lat: -34.799, lng: -58.392 }, openNow: true,
    signals: { whatsapp: '+54 9 11 2233-8899', instagram: '@cafedebarrio.adrogue', hasActiveInstagram: true, reviewsCount: 89, rating: 4.7, verified: true },
  },
  {
    name: 'Inmobiliaria Sur Propiedades', category: 'Inmobiliaria', zone: 'Lomas de Zamora',
    address: 'Av. Meeks 540, Lomas de Zamora',
    location: { lat: -34.762, lng: -58.406 }, openNow: false,
    signals: { phone: '011 4244-1200', website: 'https://surpropiedades.com.ar', websiteQuality: 'aceptable', instagram: '@surpropiedades', hasActiveInstagram: true, reviewsCount: 41, rating: 4.1, verified: true },
  },
  {
    name: 'Electricista Matriculado Gómez', category: 'Electricista', zone: 'Burzaco',
    address: 'Alsina 233, Burzaco',
    location: { lat: -34.822, lng: -58.396 }, openNow: true,
    signals: { whatsapp: '+54 9 11 3344-5566', reviewsCount: 17, rating: 4.9 },
    stage: 'contactado', notes: 'Contestó por WhatsApp, pidió ejemplos de webs.', lastContactDate: '2026-06-25', nextFollowUpDate: '2026-07-04',
  },
  {
    name: 'Peluquería Studio Glam', category: 'Peluquería', zone: 'CABA',
    address: 'Av. Rivadavia 5320, Caballito, CABA',
    location: { lat: -34.619, lng: -58.441 }, openNow: true,
    signals: { whatsapp: '+54 9 11 7788-9900', instagram: '@studioglam.caba', hasActiveInstagram: true, reviewsCount: 126, rating: 4.7, verified: true },
  },
  {
    name: 'Restaurante La Nonna', category: 'Restaurante', zone: 'CABA',
    address: 'Gorriti 4890, Palermo, CABA',
    location: { lat: -34.588, lng: -58.430 }, openNow: true,
    signals: { phone: '011 4832-6600', website: 'https://lanonna-palermo.com', websiteQuality: 'aceptable', instagram: '@lanonna.palermo', hasActiveInstagram: true, reviewsCount: 512, rating: 4.4, verified: true },
  },
  {
    name: 'Consultorio Odontológico Sonrisas', category: 'Odontología', zone: 'Adrogué',
    address: 'Macías 165, Adrogué',
    location: { lat: -34.804, lng: -58.386 }, openNow: true,
    signals: { phone: '011 4214-9080', whatsapp: '+54 9 11 4455-2211', reviewsCount: 58, rating: 4.8, verified: true },
    stage: 'interesado', notes: 'Le interesa una web con turnos online. Reunión a coordinar.', lastContactDate: '2026-06-28', nextFollowUpDate: '2026-07-03', proposalSent: false,
  },
  {
    name: 'Verdulería Orgánica Raíz', category: 'Verdulería', zone: 'Longchamps',
    address: 'Roca 780, Longchamps',
    location: { lat: -34.856, lng: -58.389 }, openNow: true,
    signals: { instagram: '@raiz.organica', hasActiveInstagram: true, reviewsCount: 9, rating: 4.6 },
  },
  {
    name: 'Taller Mecánico RPM', category: 'Taller mecánico', zone: 'Burzaco',
    address: 'Av. Monteverde 1450, Burzaco',
    location: { lat: -34.829, lng: -58.401 }, openNow: false,
    signals: { phone: '011 4299-2100', reviewsCount: 73, rating: 4.2, verified: true },
  },
  {
    name: 'Pastas Frescas La Emilia', category: 'Rotisería', zone: 'Lomas de Zamora',
    address: 'Sarmiento 410, Lomas de Zamora',
    location: { lat: -34.759, lng: -58.399 }, openNow: true,
    signals: { whatsapp: '+54 9 11 6611-2233', instagram: '@laemilia.pastas', hasActiveInstagram: false, reviewsCount: 47, rating: 4.5 },
  },
  {
    name: 'Estudio Contable Balance', category: 'Estudio contable', zone: 'CABA',
    address: 'Lavalle 1620, CABA',
    location: { lat: -34.604, lng: -58.393 }, openNow: false,
    signals: { phone: '011 4373-5500', website: 'https://estudiobalance.com.ar', websiteQuality: 'vieja', linkedin: 'estudio-balance', reviewsCount: 28, rating: 4.0 },
  },
  {
    name: 'Gimnasio CrossBox Sur', category: 'Gimnasio', zone: 'Burzaco',
    address: 'Yrigoyen 4200, Burzaco',
    location: { lat: -34.831, lng: -58.388 }, openNow: true,
    signals: { whatsapp: '+54 9 11 9900-1122', instagram: '@crossbox.sur', hasActiveInstagram: true, reviewsCount: 96, rating: 4.9, verified: true },
    stage: 'respondio', notes: 'Respondió el DM, quiere saber precios.', lastContactDate: '2026-06-30', nextFollowUpDate: '2026-07-02',
  },
  {
    name: 'Veterinaria Patitas', category: 'Veterinaria', zone: 'Adrogué',
    address: 'Somellera 340, Adrogué',
    location: { lat: -34.806, lng: -58.390 }, openNow: true,
    signals: { phone: '011 4294-7788', instagram: '@vetpatitas.adrogue', hasActiveInstagram: true, reviewsCount: 64, rating: 4.8, verified: true },
  },
  {
    name: 'Heladería Cremosa', category: 'Heladería', zone: 'Longchamps',
    address: 'Av. H. Yrigoyen 13100, Longchamps',
    location: { lat: -34.863, lng: -58.383 }, openNow: true,
    signals: { whatsapp: '+54 9 11 5522-3344', instagram: '@cremosa.helados', hasActiveInstagram: true, reviewsCount: 38, rating: 4.7 },
  },
  {
    name: 'Inmobiliaria Núñez & Asoc.', category: 'Inmobiliaria', zone: 'CABA',
    address: 'Av. Cabildo 2280, Núñez, CABA',
    location: { lat: -34.556, lng: -58.456 }, openNow: false,
    signals: { phone: '011 4788-3300', website: 'https://nunezpropiedades.com.ar', websiteQuality: 'aceptable', reviewsCount: 71, rating: 4.2, verified: true },
  },
  {
    name: 'Cerrajería 24hs Llave Maestra', category: 'Cerrajería', zone: 'Lomas de Zamora',
    address: 'Boedo 155, Lomas de Zamora',
    location: { lat: -34.761, lng: -58.408 }, openNow: true,
    signals: { whatsapp: '+54 9 11 3322-7788', reviewsCount: 31, rating: 4.6 },
    stage: 'perdido', notes: 'No le interesa, ya trabaja solo con recomendados.', lastContactDate: '2026-06-20',
  },
  {
    name: 'Spa Urbano Zen', category: 'Spa', zone: 'CABA',
    address: 'Thames 1450, Palermo, CABA',
    location: { lat: -34.587, lng: -58.428 }, openNow: true,
    signals: { whatsapp: '+54 9 11 4400-5500', instagram: '@zen.spa.urbano', hasActiveInstagram: true, reviewsCount: 154, rating: 4.9, verified: true },
  },
  {
    name: 'Estudio Jurídico Torres', category: 'Abogado', zone: 'Lomas de Zamora',
    address: 'Manuel Castro 220, Lomas de Zamora',
    location: { lat: -34.763, lng: -58.402 }, openNow: false,
    signals: { phone: '011 4292-1010', linkedin: 'estudio-torres', reviewsCount: 19, rating: 4.4 },
  },
  {
    name: 'Indumentaria Urbana Kief', category: 'Indumentaria', zone: 'Adrogué',
    address: 'Av. Espora 250, Adrogué',
    location: { lat: -34.800, lng: -58.387 }, openNow: true,
    signals: { instagram: '@kief.indumentaria', hasActiveInstagram: true, reviewsCount: 27, rating: 4.7 },
  },
  {
    name: 'Turismo Aventura Sur', category: 'Turismo', zone: 'CABA',
    address: 'Av. Corrientes 3200, CABA',
    location: { lat: -34.603, lng: -58.410 }, openNow: true,
    signals: { phone: '011 4861-2200', website: 'http://aventurasur.tur.ar', websiteQuality: 'vieja', instagram: '@aventurasur', hasActiveInstagram: true, reviewsCount: 88, rating: 4.5, verified: true },
  },
]

export const MOCK_LEADS: Lead[] = RAW.map((r) => buildLead(r))
