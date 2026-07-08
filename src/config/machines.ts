// =====================================================================
// Catálogo de máquinas 2GTech3D + mapeo Rubro → Máquina.
// ---------------------------------------------------------------------
// Datos tomados de la tienda pública de 2GTech3D (www.2gtech3d.com).
// Precios en ARS a modo de referencia comercial (ticket estimado); se
// pueden ajustar por env/CMS sin tocar la lógica.
// =====================================================================

import type { MachineFit, MachineLine, MachineMatch } from '../types'

export interface Machine {
  id: string
  name: string
  line: MachineLine
  priceArs: number
  /** Para qué sirve (pitch corto). */
  useFor: string
  /** Materiales que procesa. */
  materials: string[]
}

/** Líneas de producto con su etiqueta comercial. */
export const MACHINE_LINE_LABEL: Record<MachineLine, string> = {
  'laser-fibra': 'Corte Láser Fibra (metal)',
  'grabadora-fibra': 'Grabado Láser Fibra (metal/piedra)',
  co2: 'CNC Láser CO2 (madera/acrílico)',
  construccion: 'Línea Construcción',
}

/** Catálogo real de 2GTech3D. */
export const MACHINES: Machine[] = [
  // --- Corte láser fibra (metal) ---
  {
    id: 'fibra-3015-3kw',
    name: 'Cortadora Láser Fibra CNC 3015 3kW + Compresor 20kW',
    line: 'laser-fibra',
    priceArs: 69542000,
    useFor: 'Corte de metales de alta velocidad y precisión (chapa, acero, aluminio, inoxidable).',
    materials: ['Acero al carbono', 'Acero inoxidable', 'Aluminio', 'Bronce', 'Chapa'],
  },
  // --- Grabado láser fibra (metal / piedra) ---
  {
    id: 'grab-fibra-60w',
    name: 'Grabadora Láser Fibra 60W Profesional (Metal / Piedra)',
    line: 'grabadora-fibra',
    priceArs: 16955000,
    useFor: 'Grabado profundo y marcado en metal y piedra a alta velocidad.',
    materials: ['Metal', 'Acero', 'Aluminio', 'Piedra', 'Granito', 'Mármol'],
  },
  {
    id: 'grab-fibra-30w',
    name: 'Grabadora Láser Fibra 30W Profesional (Metal / Piedra)',
    line: 'grabadora-fibra',
    priceArs: 9414000,
    useFor: 'Grabado y marcado permanente en metales y piedra. Ideal para series y trazabilidad.',
    materials: ['Metal', 'Acero inoxidable', 'Aluminio', 'Piedra'],
  },
  // --- CO2 (madera, MDF, acrílico, cuero, tela) ---
  {
    id: 'co2-50w-500x300',
    name: 'Grabadora / Cortadora Láser CNC CO2 50W (500 x 300)',
    line: 'co2',
    priceArs: 3450000,
    useFor: 'Corte y grabado de precisión en materiales blandos. Entrada ideal para talleres chicos.',
    materials: ['MDF', 'Madera fina', 'Acrílico', 'Cuero', 'Tela', 'Goma'],
  },
  {
    id: 'co2-130w-1000x600',
    name: 'Grabadora / Cortadora Láser CNC CO2 130W (1000 x 600)',
    line: 'co2',
    priceArs: 11975000,
    useFor: 'Corte y grabado de mediano formato con más potencia y velocidad.',
    materials: ['MDF', 'Madera', 'Acrílico', 'Cuero', 'Telas'],
  },
  {
    id: 'co2-100w-1300x900',
    name: 'Grabadora / Cortadora Láser CNC CO2 100W (1300 x 900)',
    line: 'co2',
    priceArs: 12800550,
    useFor: 'Gran área de trabajo para producción de carteles, muebles y piezas grandes.',
    materials: ['MDF', 'Madera', 'Acrílico', 'Telas', 'Cuero'],
  },
  {
    id: 'co2-150w-1300x900',
    name: 'Grabadora / Cortadora Láser CNC CO2 150W (1300 x 900)',
    line: 'co2',
    priceArs: 17150000,
    useFor: 'Máxima potencia CO2 para corte de espesores mayores y producción industrial.',
    materials: ['MDF', 'Madera', 'Acrílico', 'Cuero', 'Telas'],
  },
  // --- Línea construcción ---
  {
    id: 'vibrador-3hp-35',
    name: 'Vibrador de Hormigón Monofásico 3HP (sonda 4m / 35mm)',
    line: 'construccion',
    priceArs: 690880,
    useFor: 'Compactación de hormigón en obra.',
    materials: ['Hormigón'],
  },
  {
    id: 'vibrador-3hp-50',
    name: 'Vibrador de Hormigón Monofásico 3HP (sonda 4m / 50mm)',
    line: 'construccion',
    priceArs: 715880,
    useFor: 'Compactación de hormigón con sonda de mayor diámetro.',
    materials: ['Hormigón'],
  },
  {
    id: 'andamio-electrico-1000',
    name: 'Andamio Colgante Eléctrico Balancín (1000 kg)',
    line: 'construccion',
    priceArs: 14150456,
    useFor: 'Trabajo en altura sobre fachadas con capacidad de 1000 kg.',
    materials: ['Fachadas', 'Estructuras'],
  },
]

export const MACHINE_BY_ID: Record<string, Machine> = Object.fromEntries(
  MACHINES.map((m) => [m.id, m]),
)

/** La máquina de referencia (más económica) por cada línea. */
function cheapestOfLine(line: MachineLine): Machine {
  return MACHINES.filter((m) => m.line === line).sort((a, b) => a.priceArs - b.priceArs)[0]
}

// =====================================================================
// Rubros objetivo (industrias) → línea de máquina + ajuste + motivo.
// =====================================================================

export interface Industry {
  name: string
  /** Líneas de máquina que le sirven, en orden de prioridad. */
  lines: MachineLine[]
  fit: MachineFit
  /** Por qué este rubro necesitaría la máquina. */
  reason: string
  /** Palabras clave para detectar el rubro en nombres/consultas. */
  keywords: string[]
}

export const INDUSTRIES: Industry[] = [
  // ---- Metal: corte láser fibra (núcleo del negocio) ----
  { name: 'Metalúrgica', lines: ['laser-fibra', 'grabadora-fibra'], fit: 'ideal',
    reason: 'Cortan y procesan chapa/metal todos los días: el láser fibra reemplaza plasma/oxicorte con más precisión, velocidad y menos desperdicio.',
    keywords: ['metalurgica', 'metalúrgica', 'metalurgia', 'metalmecanica', 'metalmecánica'] },
  { name: 'Taller industrial', lines: ['laser-fibra'], fit: 'ideal',
    reason: 'Un taller que trabaja metal gana capacidad y calidad de corte incorporando láser fibra en lugar de tercerizar.',
    keywords: ['taller industrial', 'taller metalurgico', 'taller metalúrgico', 'taller'] },
  { name: 'Herrería industrial', lines: ['laser-fibra', 'grabadora-fibra'], fit: 'ideal',
    reason: 'Herrería y herrería artística: cortan hierro y chapa para rejas, estructuras y diseño. El láser abre trabajos de mayor valor agregado.',
    keywords: ['herreria', 'herrería', 'herrero'] },
  { name: 'Autopartes', lines: ['laser-fibra', 'grabadora-fibra'], fit: 'ideal',
    reason: 'Fabricación y reparación de piezas metálicas: corte a medida y marcado/trazabilidad con láser.',
    keywords: ['autopartes', 'autoparte', 'repuestos'] },
  { name: 'Estructuras metálicas', lines: ['laser-fibra'], fit: 'ideal',
    reason: 'Cortan perfilería y chapa de gran formato: el láser fibra acelera la producción y mejora los encastres.',
    keywords: ['estructuras metalicas', 'estructuras metálicas', 'estructura metalica', 'naves', 'galpones'] },
  { name: 'Mecanizado / CNC', lines: ['laser-fibra', 'grabadora-fibra'], fit: 'alto',
    reason: 'Complementan el mecanizado con corte láser de chapa y marcado de piezas.',
    keywords: ['mecanizado', 'cnc', 'torno', 'fresado'] },
  { name: 'Matricería', lines: ['laser-fibra', 'grabadora-fibra'], fit: 'alto',
    reason: 'Corte de precisión y grabado para matrices, plantillas y utillaje.',
    keywords: ['matriceria', 'matricería', 'matrices', 'matricero'] },
  { name: 'Electrónica / gabinetes', lines: ['laser-fibra', 'co2'], fit: 'alto',
    reason: 'Corte de gabinetes de chapa y frentes de acrílico para tableros y equipos.',
    keywords: ['electronica', 'electrónica', 'gabinetes', 'tableros'] },
  { name: 'Náutica / aluminio', lines: ['laser-fibra'], fit: 'alto',
    reason: 'Corte de aluminio y acero inoxidable para embarcaciones y accesorios.',
    keywords: ['nautica', 'náutica', 'astillero', 'aluminio'] },

  // ---- Grabado fibra: piedra / joyería / trofeos ----
  { name: 'Marmolería', lines: ['grabadora-fibra'], fit: 'alto',
    reason: 'Grabado permanente en piedra, mármol y granito para lápidas, placas y decoración.',
    keywords: ['marmoleria', 'marmolería', 'marmol', 'mármol', 'granito', 'lapidas', 'lápidas'] },
  { name: 'Joyería', lines: ['grabadora-fibra'], fit: 'ideal',
    reason: 'Marcado y grabado fino de metales preciosos, series y personalización.',
    keywords: ['joyeria', 'joyería', 'joyas', 'orfebre'] },
  { name: 'Trofeos y premios', lines: ['grabadora-fibra', 'co2'], fit: 'ideal',
    reason: 'Personalización de trofeos, placas y reconocimientos en metal y acrílico.',
    keywords: ['trofeos', 'premios', 'reconocimientos', 'medallas'] },
  { name: 'Regalería empresarial', lines: ['grabadora-fibra', 'co2'], fit: 'alto',
    reason: 'Grabado de merchandising y regalos corporativos personalizados (metal, madera, acrílico).',
    keywords: ['regaleria', 'regalería', 'merchandising', 'grabados', 'grabado'] },

  // ---- CO2: cartelería, muebles, madera, acrílico, cuero, textil ----
  { name: 'Cartelería / señalética', lines: ['co2', 'grabadora-fibra'], fit: 'ideal',
    reason: 'Producción de carteles y letras corpóreas en acrílico, y placas de metal grabadas. Trabajo diario para estas máquinas.',
    keywords: ['carteleria', 'cartelería', 'señaletica', 'señalética', 'letras corporeas', 'letras corpóreas', 'publicidad', 'graficas', 'gráficas', 'imprenta'] },
  { name: 'Fábrica de muebles', lines: ['co2'], fit: 'ideal',
    reason: 'Corte y grabado de MDF y madera para muebles, apliques y detalles decorativos a medida.',
    keywords: ['muebles', 'muebleria', 'mueblería', 'amoblamientos', 'cocinas', 'placares'] },
  { name: 'Carpintería industrial', lines: ['co2'], fit: 'alto',
    reason: 'Corte de precisión y grabado en madera/MDF para piezas y terminaciones.',
    keywords: ['carpinteria', 'carpintería', 'carpintero', 'madera'] },
  { name: 'Marroquinería / cuero', lines: ['co2'], fit: 'alto',
    reason: 'Corte y grabado de cuero para carteras, cinturones, fundas y calzado.',
    keywords: ['marroquineria', 'marroquinería', 'cuero', 'talabarteria', 'talabartería', 'calzado'] },
  { name: 'Textil / indumentaria', lines: ['co2'], fit: 'medio',
    reason: 'Corte de telas y grabado de apliques a escala, sin bordes deshilachados.',
    keywords: ['textil', 'indumentaria', 'confeccion', 'confección', 'ropa'] },
  { name: 'Packaging', lines: ['co2'], fit: 'medio',
    reason: 'Prototipado y troquelado de cajas y displays en cartón y acrílico.',
    keywords: ['packaging', 'embalaje', 'cajas', 'troquelado'] },

  // ---- Diseño, prototipado, educación ----
  { name: 'Diseño industrial', lines: ['co2', 'laser-fibra', 'grabadora-fibra'], fit: 'alto',
    reason: 'Prototipado rápido y piezas de presentación en múltiples materiales.',
    keywords: ['diseño industrial', 'diseno industrial', 'producto'] },
  { name: 'Centro de prototipado / FabLab', lines: ['co2', 'laser-fibra'], fit: 'alto',
    reason: 'Amplían servicios de fabricación digital sumando corte láser de metal y CO2.',
    keywords: ['prototipado', 'fablab', 'fab lab', 'maker'] },
  { name: 'Impresión 3D / fabricación digital', lines: ['co2', 'grabadora-fibra'], fit: 'alto',
    reason: 'Un servicio de impresión 3D suma corte y grabado láser para ofrecer soluciones completas.',
    keywords: ['impresion 3d', 'impresión 3d', 'fabricacion digital', 'fabricación digital'] },
  { name: 'Fabricación a medida', lines: ['co2', 'laser-fibra'], fit: 'alto',
    reason: 'Producción de piezas personalizadas bajo demanda en metal, madera y acrílico.',
    keywords: ['a medida', 'fabricacion', 'fabricación', 'personalizado'] },
  { name: 'Universidad / Escuela técnica', lines: ['co2', 'grabadora-fibra'], fit: 'alto',
    reason: 'Laboratorios y talleres educativos que necesitan equipamiento para formación en fabricación digital.',
    keywords: ['universidad', 'escuela tecnica', 'escuela técnica', 'instituto', 'facultad', 'laboratorio educativo'] },
  { name: 'Laboratorio', lines: ['grabadora-fibra', 'co2'], fit: 'medio',
    reason: 'Marcado de instrumental y fabricación de piezas técnicas.',
    keywords: ['laboratorio', 'labo', 'ensayos'] },
  { name: 'Estudio de arquitectura', lines: ['co2'], fit: 'medio',
    reason: 'Maquetas y prototipos arquitectónicos de alta definición en MDF y acrílico.',
    keywords: ['arquitectura', 'arquitecto', 'estudio de arquitectura', 'maquetas'] },

  // ---- Construcción (línea secundaria de 2GTech3D) ----
  { name: 'Constructora', lines: ['construccion', 'co2'], fit: 'medio',
    reason: 'Equipamiento de obra (vibradores, andamios) y cartelería de obra.',
    keywords: ['constructora', 'construccion', 'construcción', 'obras'] },
  { name: 'Corralón / materiales', lines: ['construccion'], fit: 'medio',
    reason: 'Distribución de vibradores y equipamiento de obra a sus clientes.',
    keywords: ['corralon', 'corralón', 'materiales', 'ferreteria industrial'] },

  // ---- Genéricos ----
  { name: 'Fábrica', lines: ['laser-fibra', 'co2'], fit: 'medio',
    reason: 'Toda planta con producción propia puede internalizar corte/grabado y bajar costos de tercerización.',
    keywords: ['fabrica', 'fábrica', 'industria', 'planta'] },
  { name: 'Empresa de tecnología', lines: ['laser-fibra', 'co2'], fit: 'exploratorio',
    reason: 'Encaje a validar: útil si desarrollan hardware o productos físicos.',
    keywords: ['tecnologia', 'tecnología', 'hardware', 'iot'] },
]

function normalize(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

/** Detecta el rubro industrial a partir de una categoría o nombre libre. */
export function matchIndustry(category: string): Industry | undefined {
  const c = normalize(category)
  // 1) match exacto de nombre
  const exact = INDUSTRIES.find((i) => normalize(i.name) === c)
  if (exact) return exact
  // 2) match por keyword contenida
  return INDUSTRIES.find((i) => i.keywords.some((k) => c.includes(normalize(k))))
}

const FIT_ORDER: Record<MachineFit, number> = { ideal: 3, alto: 2, medio: 1, exploratorio: 0 }

/** Devuelve el ajuste de máquina + máquinas recomendadas para un rubro. */
export function recommendForCategory(category: string): {
  fit: MachineFit
  reason: string
  machines: MachineMatch[]
} {
  const ind = matchIndustry(category)
  if (!ind) {
    // Rubro desconocido: encaje exploratorio con la CO2 de entrada.
    const m = cheapestOfLine('co2')
    return {
      fit: 'exploratorio',
      reason: 'Rubro no identificado como industrial: validar si fabrican o procesan materiales antes de avanzar.',
      machines: [
        { machineId: m.id, name: m.name, line: m.line, ticketArs: m.priceArs, reason: 'Equipo de entrada para explorar aplicaciones.' },
      ],
    }
  }
  const machines: MachineMatch[] = ind.lines.map((line) => {
    const m = cheapestOfLine(line)
    return { machineId: m.id, name: m.name, line: m.line, ticketArs: m.priceArs, reason: ind.reason }
  })
  return { fit: ind.fit, reason: ind.reason, machines }
}

export const INDUSTRY_NAMES = INDUSTRIES.map((i) => i.name)
export { FIT_ORDER }

/** Búsquedas sugeridas (prompts) para prospección real. */
export const SEARCH_PROMPTS: string[] = [
  'metalúrgicas en Córdoba',
  'herrerías industriales en Buenos Aires',
  'fabricantes de muebles a medida Rosario',
  'empresas de corte láser Mendoza',
  'cartelería y letras corpóreas CABA',
  'marmolerías Mar del Plata',
  'talleres de mecanizado Santa Fe',
  'joyerías y grabado de metales Argentina',
  'centros de prototipado 3D Argentina',
  'escuelas técnicas con laboratorio Argentina',
]
