// =====================================================================
// Geografía de Argentina para cobertura nacional.
// Provincias + ciudades principales con coordenadas aproximadas.
// =====================================================================

export interface CityGeo {
  name: string
  lat: number
  lng: number
}
export interface ProvinceGeo {
  name: string
  cities: CityGeo[]
}

export const ARGENTINA: ProvinceGeo[] = [
  { name: 'Buenos Aires', cities: [
    { name: 'La Plata', lat: -34.921, lng: -57.954 },
    { name: 'Mar del Plata', lat: -38.005, lng: -57.542 },
    { name: 'Bahía Blanca', lat: -38.716, lng: -62.266 },
    { name: 'Tandil', lat: -37.322, lng: -59.133 },
    { name: 'Lomas de Zamora', lat: -34.761, lng: -58.401 },
    { name: 'Longchamps', lat: -34.858, lng: -58.392 },
    { name: 'Adrogué', lat: -34.802, lng: -58.389 },
    { name: 'Burzaco', lat: -34.826, lng: -58.393 },
  ]},
  { name: 'CABA', cities: [
    { name: 'Palermo', lat: -34.588, lng: -58.430 },
    { name: 'Caballito', lat: -34.619, lng: -58.441 },
    { name: 'Belgrano', lat: -34.562, lng: -58.456 },
    { name: 'Recoleta', lat: -34.588, lng: -58.393 },
  ]},
  { name: 'Córdoba', cities: [
    { name: 'Córdoba', lat: -31.420, lng: -64.188 },
    { name: 'Villa Carlos Paz', lat: -31.424, lng: -64.497 },
    { name: 'Río Cuarto', lat: -33.123, lng: -64.349 },
    { name: 'Villa María', lat: -32.407, lng: -63.240 },
  ]},
  { name: 'Santa Fe', cities: [
    { name: 'Rosario', lat: -32.958, lng: -60.639 },
    { name: 'Santa Fe', lat: -31.633, lng: -60.700 },
    { name: 'Rafaela', lat: -31.253, lng: -61.492 },
    { name: 'Venado Tuerto', lat: -33.746, lng: -61.968 },
  ]},
  { name: 'Mendoza', cities: [
    { name: 'Mendoza', lat: -32.889, lng: -68.845 },
    { name: 'San Rafael', lat: -34.617, lng: -68.330 },
    { name: 'Godoy Cruz', lat: -32.928, lng: -68.842 },
  ]},
  { name: 'Tucumán', cities: [
    { name: 'San Miguel de Tucumán', lat: -26.808, lng: -65.217 },
    { name: 'Yerba Buena', lat: -26.813, lng: -65.317 },
    { name: 'Tafí Viejo', lat: -26.732, lng: -65.259 },
  ]},
  { name: 'Salta', cities: [
    { name: 'Salta', lat: -24.789, lng: -65.410 },
    { name: 'San Ramón de la Nueva Orán', lat: -23.135, lng: -64.323 },
    { name: 'Tartagal', lat: -22.516, lng: -63.799 },
  ]},
  { name: 'Neuquén', cities: [
    { name: 'Neuquén', lat: -38.951, lng: -68.059 },
    { name: 'San Martín de los Andes', lat: -40.157, lng: -71.353 },
    { name: 'Cutral Có', lat: -38.939, lng: -69.230 },
  ]},
  { name: 'Río Negro', cities: [
    { name: 'Bariloche', lat: -41.133, lng: -71.310 },
    { name: 'General Roca', lat: -39.033, lng: -67.583 },
    { name: 'Viedma', lat: -40.813, lng: -62.996 },
  ]},
  { name: 'Entre Ríos', cities: [
    { name: 'Paraná', lat: -31.745, lng: -60.518 },
    { name: 'Concordia', lat: -31.393, lng: -58.017 },
    { name: 'Gualeguaychú', lat: -33.009, lng: -58.512 },
  ]},
  { name: 'Chaco', cities: [
    { name: 'Resistencia', lat: -27.451, lng: -58.987 },
    { name: 'Presidencia Roque Sáenz Peña', lat: -26.789, lng: -60.438 },
  ]},
  { name: 'Corrientes', cities: [
    { name: 'Corrientes', lat: -27.469, lng: -58.830 },
    { name: 'Goya', lat: -29.140, lng: -59.263 },
  ]},
  { name: 'Misiones', cities: [
    { name: 'Posadas', lat: -27.367, lng: -55.896 },
    { name: 'Puerto Iguazú', lat: -25.599, lng: -54.573 },
    { name: 'Oberá', lat: -27.487, lng: -55.120 },
  ]},
  { name: 'San Juan', cities: [
    { name: 'San Juan', lat: -31.537, lng: -68.526 },
    { name: 'Rawson', lat: -31.573, lng: -68.535 },
  ]},
  { name: 'Jujuy', cities: [
    { name: 'San Salvador de Jujuy', lat: -24.185, lng: -65.299 },
    { name: 'Palpalá', lat: -24.257, lng: -65.211 },
  ]},
  { name: 'San Luis', cities: [
    { name: 'San Luis', lat: -33.301, lng: -66.337 },
    { name: 'Villa Mercedes', lat: -33.675, lng: -65.458 },
  ]},
  { name: 'Santiago del Estero', cities: [
    { name: 'Santiago del Estero', lat: -27.795, lng: -64.261 },
    { name: 'La Banda', lat: -27.735, lng: -64.242 },
  ]},
  { name: 'Catamarca', cities: [
    { name: 'San Fernando del Valle de Catamarca', lat: -28.469, lng: -65.779 },
  ]},
  { name: 'La Rioja', cities: [
    { name: 'La Rioja', lat: -29.413, lng: -66.856 },
  ]},
  { name: 'La Pampa', cities: [
    { name: 'Santa Rosa', lat: -36.617, lng: -64.290 },
    { name: 'General Pico', lat: -35.657, lng: -63.756 },
  ]},
  { name: 'Formosa', cities: [
    { name: 'Formosa', lat: -26.185, lng: -58.174 },
  ]},
  { name: 'Chubut', cities: [
    { name: 'Comodoro Rivadavia', lat: -45.864, lng: -67.496 },
    { name: 'Trelew', lat: -43.253, lng: -65.309 },
    { name: 'Puerto Madryn', lat: -42.769, lng: -65.038 },
  ]},
  { name: 'Santa Cruz', cities: [
    { name: 'Río Gallegos', lat: -51.623, lng: -69.216 },
    { name: 'Caleta Olivia', lat: -46.440, lng: -67.528 },
  ]},
  { name: 'Tierra del Fuego', cities: [
    { name: 'Ushuaia', lat: -54.801, lng: -68.303 },
    { name: 'Río Grande', lat: -53.787, lng: -67.710 },
  ]},
]

export const PROVINCES = ARGENTINA.map((p) => p.name)

export function citiesOfProvince(province: string): CityGeo[] {
  return ARGENTINA.find((p) => p.name === province)?.cities ?? []
}

/** Rubros frecuentes para prospección de webs. */
export const CATEGORIES = [
  'Barbería', 'Peluquería', 'Gimnasio', 'Estética', 'Spa', 'Restaurante',
  'Cafetería', 'Bar', 'Rotisería', 'Heladería', 'Panadería', 'Verdulería',
  'Inmobiliaria', 'Electricista', 'Plomero', 'Ferretería', 'Cerrajería',
  'Taller mecánico', 'Odontología', 'Consultorio médico', 'Veterinaria',
  'Abogado', 'Estudio contable', 'Indumentaria', 'Turismo', 'Hotel',
  'Metalúrgica', 'Corralón', 'Óptica', 'Farmacia',
]
