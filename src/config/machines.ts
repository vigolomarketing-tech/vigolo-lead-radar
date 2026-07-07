import type {
  BusinessSignals,
  CompanySize,
  IndustrialMaturity,
  MachinePriority,
} from '../types'

export interface MachineDef {
  id: string
  name: string
  category: string
  sourceUrl: string
  sku?: string
  priceARS: number
  ticketRange: string
  applications: string[]
  materials: string[]
  targetIndustries: string[]
  benefits: string[]
  priority: MachinePriority
  keywords: string[]
}

export const MACHINES: MachineDef[] = [
  {
    id: 'fiber-cnc-3015-3kw',
    name: 'Cortadora Láser Fibra CNC 3015 3kW',
    category: 'CNC Láser Fibra',
    sku: '2GT3015-3000W',
    sourceUrl:
      'https://www.2gtech3d.com/product-page/cnc-laser-de-fibra-corte-metales-potencia-3000w-2gtech',
    priceARS: 69542000,
    ticketRange: '$69.5M ARS aprox.',
    applications: [
      'corte de chapa',
      'piezas metalúrgicas',
      'estructuras metálicas',
      'autopartes',
      'corte de inoxidable',
      'corte de aluminio',
    ],
    materials: ['acero carbono', 'acero inoxidable', 'aluminio', 'bronce', 'cobre'],
    targetIndustries: [
      'Metalúrgica',
      'Metalmecánica',
      'Autopartista',
      'Fabricantes de estructuras',
      'Empresas de acero inoxidable',
      'Empresas de aluminio',
      'Fabricantes de maquinaria',
      'Empresas de corte',
    ],
    benefits: [
      'corte rápido y repetible de chapas',
      'menor dependencia de tercerización',
      'mejor precisión y menos desperdicio',
      'capacidad industrial para producción seriada',
    ],
    priority: 'critica',
    keywords: [
      'metalurgica',
      'metalmecanica',
      'autopartista',
      'chapa',
      'acero',
      'inoxidable',
      'aluminio',
      'estructuras',
      'corte metal',
      'maquinaria',
      'plegado',
      'caldereria',
    ],
  },
  {
    id: 'co2-150-1390',
    name: 'Grabadora Cortadora Láser CO₂ 150W 1300 x 900',
    category: 'CNC Láser CO₂',
    sku: '2G-CO2150-1390',
    sourceUrl:
      'https://www.2gtech3d.com/product-page/grabadora-cortadora-laser-cnc-co2-150w-1300-x-900-2gtech',
    priceARS: 17150000,
    ticketRange: '$17.1M ARS aprox.',
    applications: [
      'corte de acrílico',
      'corte de MDF',
      'cartelería',
      'muebles a medida',
      'packaging',
      'grabado en orgánicos',
    ],
    materials: ['acrílico', 'MDF', 'madera', 'cuero', 'cartón', 'tela', 'goma'],
    targetIndustries: [
      'Cartelería',
      'Fabricantes de muebles',
      'Carpintería',
      'Mueblería',
      'Diseño industrial',
      'Packaging',
      'Fabricantes de cocinas',
    ],
    benefits: [
      'mesa amplia para placas grandes',
      'corte y grabado en una sola máquina',
      'apta para producción comercial',
      'mejora tiempos frente a corte manual o tercerizado',
    ],
    priority: 'alta',
    keywords: [
      'carteleria',
      'muebles',
      'muebleria',
      'carpinteria',
      'cocinas',
      'acrilico',
      'mdf',
      'madera',
      'packaging',
      'diseño industrial',
      'laser co2',
    ],
  },
  {
    id: 'co2-130-1060',
    name: 'Grabadora Cortadora Láser CO₂ 130W 1000 x 600',
    category: 'CNC Láser CO₂',
    sku: '2G-CO2130-1060',
    sourceUrl:
      'https://www.2gtech3d.com/product-page/grabadora-cortadora-laser-cnc-co2-130w-1000-x-600-2gtech',
    priceARS: 11975000,
    ticketRange: '$12.0M ARS aprox.',
    applications: ['corte de MDF', 'grabado', 'cartelería', 'decoración', 'prototipos'],
    materials: ['MDF', 'madera', 'acrílico', 'cuero', 'cartón'],
    targetIndustries: [
      'Carpintería',
      'Cartelería',
      'Diseño industrial',
      'Fabricantes de muebles',
      'Escuelas técnicas',
    ],
    benefits: [
      'potencia equilibrada para PyMEs',
      'formato apto para talleres medianos',
      'buen punto de entrada a producción CNC',
    ],
    priority: 'alta',
    keywords: ['carpinteria', 'carteleria', 'mdf', 'madera', 'acrilico', 'taller', 'prototipos'],
  },
  {
    id: 'co2-100-1390',
    name: 'Grabadora Cortadora Láser CO₂ 100W 1300 x 900',
    category: 'CNC Láser CO₂',
    sku: '2G-CO2100-1390',
    sourceUrl:
      'https://www.2gtech3d.com/product-page/grabadora-cortadora-laser-cnc-co2-100w-1300-x-900-2gtech',
    priceARS: 12800550,
    ticketRange: '$12.8M ARS aprox.',
    applications: ['cartelería', 'corte de acrílico', 'grabado', 'madera', 'packaging'],
    materials: ['acrílico', 'madera', 'MDF', 'cuero', 'cartón', 'tela'],
    targetIndustries: ['Cartelería', 'Gráfica', 'Packaging', 'Diseño industrial', 'Carpintería'],
    benefits: [
      'mesa grande con menor inversión que 150W',
      'ideal para negocios que combinan corte y grabado',
      'flexibilidad de materiales orgánicos',
    ],
    priority: 'media',
    keywords: ['carteleria', 'grafica', 'acrilico', 'packaging', 'mdf', 'madera', 'laser co2'],
  },
  {
    id: 'co2-50-5030',
    name: 'Grabadora Cortadora Láser CO₂ 50W 500 x 300',
    category: 'CNC Láser CO₂ compacta',
    sku: '2G-CO250-5030',
    sourceUrl:
      'https://www.2gtech3d.com/product-page/grabadora-cortadora-laser-cnc-co2-50w-500-x-300-2gtech',
    priceARS: 3450000,
    ticketRange: '$3.45M ARS aprox.',
    applications: ['grabado', 'prototipos', 'souvenirs', 'educación técnica', 'pequeñas piezas'],
    materials: ['acrílico', 'madera fina', 'cuero', 'cartón', 'goma'],
    targetIndustries: [
      'Escuelas técnicas',
      'Universidades técnicas',
      'Diseño industrial',
      'Emprendimientos maker',
      'Talleres de grabado',
    ],
    benefits: [
      'ticket accesible',
      'rápida adopción para capacitación y prototipado',
      'ideal para piezas chicas y validación de demanda',
    ],
    priority: 'media',
    keywords: [
      'escuela tecnica',
      'universidad',
      'prototipado',
      'maker',
      'souvenir',
      'grabado',
      'educacion',
    ],
  },
  {
    id: 'fiber-marker-60w',
    name: 'Grabadora Láser Fibra 60W para metal y piedra',
    category: 'Grabadora Láser Fibra',
    sku: '2G-FL60',
    sourceUrl:
      'https://www.2gtech3d.com/product-page/copia-de-grabadora-laser-fibra-60w-profesional-metal-piedra-2gtech',
    priceARS: 16955000,
    ticketRange: '$17.0M ARS aprox.',
    applications: [
      'marcado industrial',
      'trazabilidad',
      'herramientas',
      'placas metálicas',
      'piezas seriadas',
      'matrices',
    ],
    materials: ['acero', 'aluminio', 'bronce', 'piedra', 'plásticos técnicos', 'herramientas'],
    targetIndustries: [
      'Matricería',
      'Autopartista',
      'Talleres industriales',
      'Grabado industrial',
      'Fabricantes de herramientas',
      'Metalúrgica',
    ],
    benefits: [
      'marcado permanente sin consumibles',
      'alta velocidad para piezas seriadas',
      'mejora trazabilidad y terminación de producto',
    ],
    priority: 'alta',
    keywords: [
      'matriceria',
      'grabado',
      'marcado',
      'herramientas',
      'trazabilidad',
      'autopartes',
      'metal',
      'piedra',
      'serie',
    ],
  },
  {
    id: 'fiber-marker-30w',
    name: 'Grabadora Láser Fibra 30W para metal y piedra',
    category: 'Grabadora Láser Fibra',
    sku: '2G-FL30',
    sourceUrl:
      'https://www.2gtech3d.com/product-page/grabadora-laser-fibra-30w-profesional-metal-piedra-2gtech',
    priceARS: 9414000,
    ticketRange: '$9.4M ARS aprox.',
    applications: ['marcado de metales', 'placas', 'identificación', 'personalización', 'bajos lotes'],
    materials: ['acero', 'aluminio', 'bronce', 'piedra', 'plásticos técnicos'],
    targetIndustries: ['Grabado industrial', 'Matricería', 'Talleres industriales', 'Diseño industrial'],
    benefits: [
      'entrada accesible al marcado láser',
      'útil para talleres que tercerizan grabado',
      'permite ofrecer personalización y trazabilidad',
    ],
    priority: 'media',
    keywords: ['grabado', 'marcado', 'metal', 'piedra', 'placas', 'identificacion', 'personalizacion'],
  },
  {
    id: 'concrete-vibrator-3hp-35',
    name: 'Vibrador de Hormigón Monofásico 3HP con sonda 35 mm',
    category: 'Accesorio de construcción',
    sku: 'VH350',
    sourceUrl:
      'https://www.2gtech3d.com/product-page/vibrador-hormigon-monofasico-3hp-con-sonda-4m-35mm-2gtech',
    priceARS: 690880,
    ticketRange: '$690k ARS aprox.',
    applications: ['compactación de hormigón', 'obra civil', 'columnas', 'plateas', 'encofrados'],
    materials: ['hormigón'],
    targetIndustries: ['Constructoras', 'Obra civil', 'Contratistas de hormigón'],
    benefits: [
      'mejor terminación y compactación',
      'equipo listo para obra',
      'venta de ticket bajo para constructoras',
    ],
    priority: 'baja',
    keywords: ['constructora', 'hormigon', 'obra', 'contratista', 'encofrado', 'cemento'],
  },
  {
    id: 'suspended-platform-1000kg',
    name: 'Andamio colgante eléctrico 1000 kg',
    category: 'Accesorio de construcción',
    sku: 'ACL1000',
    sourceUrl:
      'https://www.2gtech3d.com/product-page/andamio-colgante-electrico-balancín-plataforma-1000kg-2gtech',
    priceARS: 14150456,
    ticketRange: '$14.1M ARS aprox.',
    applications: ['trabajos en altura', 'fachadas', 'mantenimiento edilicio', 'obra civil'],
    materials: ['estructura metálica', 'fachadas', 'hormigón'],
    targetIndustries: ['Constructoras', 'Mantenimiento edilicio', 'Obra civil'],
    benefits: [
      'capacidad de 1000 kg para equipos y operarios',
      'reduce tiempos frente a andamios tradicionales',
      'venta consultiva para obras de mayor escala',
    ],
    priority: 'media',
    keywords: ['constructora', 'altura', 'fachada', 'obra', 'andamio', 'mantenimiento'],
  },
]

export const MACHINE_BY_ID = Object.fromEntries(MACHINES.map((m) => [m.id, m])) as Record<
  string,
  MachineDef
>

export const PRIMARY_MACHINE_IDS = MACHINES.filter(
  (m) => m.category !== 'Accesorio de construcción',
).map((m) => m.id)

export const INDUSTRIAL_CATEGORIES = [
  'Metalúrgica',
  'Metalmecánica',
  'Carpintería',
  'Mueblería',
  'Cartelería',
  'Constructora',
  'Fábrica',
  'Autopartista',
  'Matricería',
  'Diseño industrial',
  'Universidad técnica',
  'Escuela técnica',
  'Taller industrial',
  'Empresa de corte',
  'Empresa de grabado',
  'Fabricante de muebles',
  'Fabricante de cocinas',
  'Fabricante de aberturas',
  'Fabricante de estructuras',
  'Empresa de aluminio',
  'Empresa de acero inoxidable',
  'Packaging',
  'Gráfica',
  'Fabricante de maquinaria',
  'Contratista de hormigón',
]

const INDUSTRIAL_PROVINCES = [
  'Buenos Aires',
  'CABA',
  'Córdoba',
  'Santa Fe',
  'Mendoza',
  'Entre Ríos',
  'Tucumán',
]

const MATURITY_BY_CATEGORY: Record<string, IndustrialMaturity> = {
  metalurgica: 'industrial',
  metalmecanica: 'industrial',
  autopartista: 'alta-produccion',
  fabrica: 'industrial',
  matriceria: 'industrial',
  'empresa de corte': 'industrial',
  'empresa de acero inoxidable': 'industrial',
  'empresa de aluminio': 'industrial',
  'fabricante de estructuras': 'industrial',
  carpinteria: 'semi-industrial',
  muebleria: 'semi-industrial',
  carteleria: 'semi-industrial',
  'fabricante de muebles': 'industrial',
  'fabricante de cocinas': 'semi-industrial',
  'escuela tecnica': 'semi-industrial',
  'universidad tecnica': 'semi-industrial',
  constructora: 'industrial',
}

const SIZE_BY_CATEGORY: Record<string, CompanySize> = {
  autopartista: 'gran-industria',
  metalurgica: 'industrial',
  metalmecanica: 'industrial',
  fabrica: 'industrial',
  'fabricante de estructuras': 'industrial',
  'empresa de corte': 'industrial',
  constructora: 'industrial',
  matriceria: 'pyme',
  carpinteria: 'pyme',
  muebleria: 'pyme',
  carteleria: 'pyme',
  'escuela tecnica': 'pyme',
  'universidad tecnica': 'industrial',
}

export function normalizeIndustrialText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function machineFitScore(category: string, machine: MachineDef): number {
  const text = normalizeIndustrialText(category)
  let score = 0
  for (const k of machine.keywords) {
    if (text.includes(normalizeIndustrialText(k))) score += 18
  }
  for (const industry of machine.targetIndustries) {
    if (text.includes(normalizeIndustrialText(industry))) score += 22
  }
  return Math.min(100, score)
}

export function recommendMachineForCategory(
  category: string,
  signals: BusinessSignals = {},
): MachineDef {
  const text = normalizeIndustrialText([
    category,
    signals.currentMachinery?.join(' '),
    signals.materials?.join(' '),
    signals.productionSignals?.join(' '),
  ].filter(Boolean).join(' '))

  if (/autopart|metal|metalmecan|acero|inox|alumin|estructura|chapa|calder|corte/.test(text)) {
    return MACHINE_BY_ID['fiber-cnc-3015-3kw']
  }
  if (/matric|herramient|trazabilidad|marcado|grabado metal|serie|placa/.test(text)) {
    return MACHINE_BY_ID['fiber-marker-60w']
  }
  if (/cartel|grafica|acril|packaging|señal|senal/.test(text)) {
    return MACHINE_BY_ID['co2-150-1390']
  }
  if (/carpinter|mueble|cocina|abertura|mdf|madera/.test(text)) {
    return MACHINE_BY_ID['co2-130-1060']
  }
  if (/universidad|escuela|educacion|maker|prototip|diseño|diseno/.test(text)) {
    return MACHINE_BY_ID['co2-50-5030']
  }
  if (/construct|hormigon|obra|contratista/.test(text)) {
    return MACHINE_BY_ID['suspended-platform-1000kg']
  }
  return MACHINE_BY_ID['co2-100-1390']
}

export function estimateIndustrialMaturity(
  category: string,
  signals: BusinessSignals = {},
): IndustrialMaturity {
  if (signals.industrialMaturity) return signals.industrialMaturity
  const text = normalizeIndustrialText(category)
  const match = Object.entries(MATURITY_BY_CATEGORY).find(([key]) => text.includes(key))
  if (signals.hasCnc || signals.hasLaser || signals.exportsOrLargeClients) return 'industrial'
  return match?.[1] ?? 'semi-industrial'
}

export function estimateCompanySize(category: string, signals: BusinessSignals = {}): CompanySize {
  if (signals.companySize) return signals.companySize
  const text = normalizeIndustrialText(category)
  const match = Object.entries(SIZE_BY_CATEGORY).find(([key]) => text.includes(key))
  return match?.[1] ?? 'pyme'
}

export function estimateMachineTicket(machine: MachineDef, size: CompanySize): number {
  const sizeBoost: Record<CompanySize, number> = {
    micro: 0.75,
    pyme: 1,
    industrial: 1.12,
    'gran-industria': 1.25,
  }
  return Math.round((machine.priceARS * sizeBoost[size]) / 100000) * 100000
}

export function isIndustrialProvince(province?: string): boolean {
  return Boolean(province && INDUSTRIAL_PROVINCES.includes(province))
}

export function machineOptions(): { id: string; name: string }[] {
  return MACHINES.map((m) => ({ id: m.id, name: m.name }))
}
