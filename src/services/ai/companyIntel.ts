// =====================================================================
// Motor de Inteligencia por Empresa (2GTech3D)
// ---------------------------------------------------------------------
// A partir del rubro + señales públicas infiere QUÉ fabrica la empresa,
// con qué materiales, qué procesos hace, qué maquinaria probablemente ya
// usa, qué puede mejorar, la máquina 2GTech3D ideal, la razón de compra
// específica, la urgencia y el ROI aproximado. Determinístico (sin costo);
// es el fallback cuando no hay IA real conectada.
// =====================================================================

import { matchIndustry, recommendForCategory } from '../../config/machines'
import { allMessages } from './localAnalyst'
import type {
  CompanyIntel,
  CommercialStrategy,
  Lead,
  MachineLine,
  RoiEstimate,
  Urgency,
} from '../../types'

// --- Perfil industrial base por LÍNEA (fallback y semillas) ---
interface Profile {
  fabricates: string
  materials: string[]
  processes: string[]
  productionType: string
  likelyMachinery: string[]
  opportunities: string[]
  /** Verbo de dolor: qué hacen hoy que la máquina resuelve. */
  painToday: string
  /** Beneficio central de la máquina para el rubro. */
  benefit: string
}

const LINE_PROFILE: Record<MachineLine, Profile> = {
  'laser-fibra': {
    fabricates: 'piezas y estructuras de metal a partir de chapa',
    materials: ['acero al carbono', 'acero inoxidable', 'aluminio', 'chapa'],
    processes: ['corte de chapa', 'plegado', 'soldadura', 'armado'],
    productionType: 'producción por pedido y series cortas/medianas',
    likelyMachinery: ['plasma o pantógrafo', 'guillotina', 'plegadora', 'soldadoras'],
    opportunities: ['reducir tiempos de corte', 'eliminar rebabas y retrabajo', 'dejar de tercerizar el corte fino'],
    painToday: 'tercerizan el corte láser o usan plasma/oxicorte',
    benefit: 'cortar chapa con precisión de décimas, más rápido y sin tercerizar',
  },
  'grabadora-fibra': {
    fabricates: 'piezas marcadas o grabadas en metal y piedra',
    materials: ['metal', 'acero inoxidable', 'aluminio', 'piedra'],
    processes: ['grabado', 'marcado', 'numeración', 'personalización'],
    productionType: 'series con personalización pieza a pieza',
    likelyMachinery: ['grabado manual o pantográfico', 'tercerización de marcado'],
    opportunities: ['agregar trazabilidad', 'sumar personalización de alto margen', 'acelerar series'],
    painToday: 'graban a mano o tercerizan el marcado',
    benefit: 'marcar metal y piedra de forma permanente, rápida y repetible',
  },
  co2: {
    fabricates: 'piezas y productos cortados/grabados en materiales blandos',
    materials: ['MDF', 'madera', 'acrílico', 'cuero', 'tela'],
    processes: ['corte de placas', 'grabado', 'armado', 'terminación'],
    productionType: 'producción a medida y series cortas',
    likelyMachinery: ['sierra/router manual', 'tercerización de corte', 'corte a mano'],
    opportunities: ['cortar diseños complejos', 'sumar productos personalizados', 'bajar costo por pieza'],
    painToday: 'tercerizan el corte o lo hacen a mano',
    benefit: 'cortar y grabar MDF, acrílico y cuero en su propio taller',
  },
  construccion: {
    fabricates: 'obras y estructuras de construcción',
    materials: ['hormigón', 'acero', 'mampostería'],
    processes: ['hormigonado', 'compactación', 'trabajo en altura'],
    productionType: 'obra por proyecto',
    likelyMachinery: ['equipos alquilados', 'herramienta de obra básica'],
    opportunities: ['dejar de alquilar equipos', 'ganar productividad en obra'],
    painToday: 'alquilan equipos de obra',
    benefit: 'contar con equipamiento propio de obra',
  },
}

// --- Overrides específicos por RUBRO (más precisión) ---
const INDUSTRY_PROFILE: Record<string, Partial<Profile>> = {
  Metalúrgica: {
    fabricates: 'estructuras, piezas y conjuntos metálicos a partir de chapa y perfil',
    materials: ['acero al carbono', 'acero inoxidable', 'aluminio', 'chapa negra y galvanizada'],
    processes: ['corte', 'plegado', 'soldadura MIG/TIG', 'granallado', 'pintura'],
  },
  'Herrería industrial': {
    fabricates: 'rejas, portones, estructuras y piezas de diseño en hierro',
    materials: ['hierro', 'chapa', 'caño estructural', 'planchuela'],
    processes: ['corte', 'soldadura', 'forja', 'armado'],
    likelyMachinery: ['amoladora', 'soldadora', 'sierra sensitiva', 'tercerización de corte láser'],
    opportunities: ['ofrecer diseños calados de alto valor', 'dejar de tercerizar el corte', 'diferenciarse de otras herrerías'],
  },
  Autopartes: {
    fabricates: 'piezas y repuestos metálicos para vehículos',
    materials: ['acero', 'aluminio', 'inoxidable'],
    processes: ['corte', 'estampado', 'mecanizado', 'marcado de trazabilidad'],
  },
  'Estructuras metálicas': {
    fabricates: 'naves, galpones y estructuras de gran porte',
    materials: ['perfil estructural', 'chapa gruesa', 'acero'],
    processes: ['corte de gran formato', 'armado', 'soldadura'],
    productionType: 'proyectos de gran volumen',
  },
  'Mecanizado / CNC': {
    fabricates: 'piezas mecanizadas de precisión',
    materials: ['acero', 'aluminio', 'bronce', 'inoxidable'],
    processes: ['torneado', 'fresado', 'corte de chapa complementario', 'marcado'],
    likelyMachinery: ['tornos y fresadoras CNC', 'tercerización de corte de chapa'],
  },
  Matricería: {
    fabricates: 'matrices, plantillas y utillaje',
    materials: ['acero de herramientas', 'aluminio'],
    processes: ['mecanizado', 'corte de precisión', 'grabado de identificación'],
    productionType: 'piezas unitarias de alta precisión',
  },
  Marmolería: {
    fabricates: 'mesadas, lápidas, placas y revestimientos en piedra',
    materials: ['granito', 'mármol', 'cuarzo', 'piedra'],
    processes: ['corte de piedra', 'pulido', 'grabado de letras e imágenes'],
    likelyMachinery: ['pulidora', 'grabado manual o pantográfico'],
    opportunities: ['grabar lápidas y placas en minutos', 'ofrecer retratos grabados', 'sumar personalización premium'],
    painToday: 'graban las lápidas y placas a mano o las tercerizan',
    benefit: 'grabar piedra con detalle fotográfico de forma automática',
  },
  Joyería: {
    fabricates: 'joyas y piezas de metales preciosos',
    materials: ['plata', 'oro', 'acero', 'bronce'],
    processes: ['grabado fino', 'marcado de quilataje', 'personalización'],
    productionType: 'piezas únicas y series de personalización',
  },
  'Trofeos y premios': {
    fabricates: 'trofeos, medallas, placas y reconocimientos',
    materials: ['acrílico', 'metal', 'madera', 'cristal'],
    processes: ['corte', 'grabado', 'personalización con nombres/logos'],
    likelyMachinery: ['tercerización de grabado', 'router chico'],
    opportunities: ['producir a demanda sin depender de proveedores', 'personalizar al instante', 'mejorar márgenes'],
  },
  'Cartelería / señalética': {
    fabricates: 'carteles, letras corpóreas, señalética y displays',
    materials: ['acrílico', 'PVC', 'MDF', 'chapa', 'vinilo'],
    processes: ['corte de acrílico', 'grabado', 'armado de letras', 'pintura'],
    likelyMachinery: ['router CNC', 'tercerización de corte láser', 'corte manual'],
    opportunities: ['cortar letras y logos con bordes perfectos', 'internalizar el corte de acrílico', 'acelerar entregas'],
    painToday: 'tercerizan el corte de acrílico o lo hacen con router/manual',
    benefit: 'cortar y grabar acrílico y madera con terminación de exposición',
  },
  'Fábrica de muebles': {
    fabricates: 'muebles a medida, cocinas, placares y apliques',
    materials: ['MDF', 'melamina', 'madera maciza', 'terciado'],
    processes: ['corte de placas', 'grabado decorativo', 'armado', 'terminación'],
    likelyMachinery: ['seccionadora', 'router', 'tercerización de detalles'],
    opportunities: ['sumar grabados y calados decorativos', 'diferenciar el producto', 'ofrecer piezas personalizadas'],
  },
  'Marroquinería / cuero': {
    fabricates: 'carteras, cinturones, fundas y calzado en cuero',
    materials: ['cuero', 'ecocuero', 'textiles técnicos'],
    processes: ['corte de cuero', 'grabado de logos', 'troquelado'],
    likelyMachinery: ['troqueladora', 'corte manual', 'tercerización'],
    opportunities: ['cortar sin deshilachar', 'grabar marca propia', 'escalar la producción'],
  },
  'Textil / indumentaria': {
    fabricates: 'prendas y textiles',
    materials: ['telas sintéticas', 'poliéster', 'fieltro'],
    processes: ['corte de telas', 'grabado de apliques', 'confección'],
    productionType: 'series de confección',
  },
  'Universidad / Escuela técnica': {
    fabricates: 'formación y proyectos en fabricación digital',
    materials: ['MDF', 'acrílico', 'metal', 'materiales didácticos'],
    processes: ['prototipado educativo', 'proyectos de taller', 'investigación'],
    likelyMachinery: ['impresoras 3D', 'herramienta de taller básica'],
    opportunities: ['equipar el laboratorio', 'formar en corte/grabado láser', 'proyectos con la industria'],
    painToday: 'no cuentan con corte/grabado láser en el laboratorio',
    benefit: 'equipar el laboratorio para formar en fabricación digital real',
  },
  'Impresión 3D / fabricación digital': {
    fabricates: 'servicios de fabricación digital a terceros',
    materials: ['PLA/PETG', 'resina', 'MDF', 'acrílico'],
    processes: ['impresión 3D', 'corte láser', 'terminación'],
    opportunities: ['ampliar servicios con corte/grabado láser', 'captar más clientes', 'subir el ticket promedio'],
  },
}

function profileFor(lead: Lead): Profile {
  const line = lead.machines[0]?.line ?? 'co2'
  const base = LINE_PROFILE[line]
  const ind = matchIndustry(lead.category)
  const override = ind ? INDUSTRY_PROFILE[ind.name] : undefined
  return { ...base, ...override }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function sizeInfo(reviews: number): { label: string; factor: number } {
  if (reviews >= 120) return { label: 'Empresa grande', factor: 1.6 }
  if (reviews >= 50) return { label: 'Empresa mediana', factor: 1.2 }
  if (reviews >= 15) return { label: 'Pyme', factor: 0.9 }
  return { label: 'Taller pequeño', factor: 0.6 }
}

const AR = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

/** ROI aproximado: ahorro mensual por dejar de tercerizar vs. ticket. */
export function estimateRoi(lead: Lead): RoiEstimate {
  const line = lead.machines[0]?.line ?? 'co2'
  const reviews = lead.signals.reviewsCount ?? 0
  const { factor } = sizeInfo(reviews)
  const baseSaving: Record<MachineLine, number> = {
    'laser-fibra': 2200000,
    'grabadora-fibra': 650000,
    co2: 850000,
    construccion: 350000,
  }
  const monthlySaving = Math.round((baseSaving[line] * factor) / 10000) * 10000
  const ticket = lead.machines[0]?.ticketArs ?? lead.potentialValue
  const paybackMonths = Math.max(2, Math.round(ticket / Math.max(1, monthlySaving)))
  return {
    monthlySaving,
    paybackMonths,
    note: `Estimación orientativa (a validar con el cliente): si hoy destinan ~${AR.format(monthlySaving)}/mes a tercerización o costo evitable, la máquina se repagaría en ~${paybackMonths} meses.`,
  }
}

/** Nivel de urgencia comercial + motivo. */
export function estimateUrgency(lead: Lead): Urgency {
  const reviews = lead.signals.reviewsCount ?? 0
  let pts = 0
  if (lead.machineFit === 'ideal') pts += 3
  else if (lead.machineFit === 'alto') pts += 2
  else if (lead.machineFit === 'medio') pts += 1
  if (reviews >= 80) pts += 2
  else if (reviews >= 30) pts += 1
  if (lead.signals.hasActiveInstagram) pts += 1
  if (lead.signals.verified) pts += 1
  if (lead.signals.website) pts += 1

  if (pts >= 6) {
    return {
      level: 'alta',
      reason:
        lead.machineFit === 'ideal'
          ? 'Rubro ideal y empresa activa: en su sector varios competidores ya suman corte/grabado láser. Cada mes sin la máquina son trabajos que pierde o terceriza.'
          : 'Empresa con volumen y actividad: hay ventana clara para proponer ahora.',
    }
  }
  if (pts >= 4) {
    return {
      level: 'media',
      reason: 'Buen encaje pero conviene calificar volumen y capacidad de inversión antes de avanzar fuerte.',
    }
  }
  return {
    level: 'baja',
    reason: 'Encaje o tamaño a validar: nutrir el contacto y reevaluar más adelante.',
  }
}

/** Razón de compra específica (varía por empresa). */
export function reasonToBuy(lead: Lead): string {
  const p = profileFor(lead)
  const machine = lead.machines[0]
  const reviews = lead.signals.reviewsCount ?? 0
  const size = sizeInfo(reviews).label.toLowerCase()
  const mats = p.materials.slice(0, 2).join(' y ')
  const variants = [
    `Trabajan con ${mats} y ${p.painToday}. Una ${shortMachine(lead)} les permitiría ${p.benefit}, reduciendo tiempos y costos.`,
    `Como ${size} de ${lead.category.toLowerCase()}, ${p.painToday}. La ${shortMachine(lead)} internaliza ese proceso y suma capacidad propia.`,
    `Su producción (${p.processes.slice(0, 2).join(' y ')}) hoy depende de terceros para ${p.painToday.replace('tercerizan ', '').replace('tercerizan', 'el corte')}. Con la ${shortMachine(lead)} ganan autonomía y margen.`,
  ]
  const idx = hashStr(lead.id) % variants.length
  const base = variants[idx]
  // Matiz por señales.
  if (reviews >= 80) return `${base} Con su volumen, el equipo se amortiza rápido.`
  if (!machine) return base
  return base
}

function shortMachine(lead: Lead): string {
  const line = lead.machines[0]?.line
  switch (line) {
    case 'laser-fibra':
      return 'CNC Láser Fibra'
    case 'grabadora-fibra':
      return 'Grabadora Láser Fibra'
    case 'co2':
      return 'CNC Láser CO2'
    case 'construccion':
      return 'línea de construcción'
    default:
      return 'máquina 2GTech3D'
  }
}

/** Análisis completo de la empresa. */
export function analyzeCompany(lead: Lead): CompanyIntel {
  const p = profileFor(lead)
  const reviews = lead.signals.reviewsCount ?? 0
  const size = sizeInfo(reviews)
  const machine = lead.machines[0]
  const rec = recommendForCategory(lead.category)
  return {
    fabricates: p.fabricates,
    materials: p.materials,
    processes: p.processes,
    productionType: p.productionType,
    likelyMachinery: p.likelyMachinery,
    opportunities: p.opportunities,
    recommendedMachine: machine,
    whyThisMachine: rec.reason,
    reasonToBuy: reasonToBuy(lead),
    urgency: estimateUrgency(lead),
    roi: estimateRoi(lead),
    sizeLabel: size.label,
  }
}

// =====================================================================
// Estrategia comercial completa (playbook)
// =====================================================================

export function buildStrategy(lead: Lead): CommercialStrategy {
  const p = profileFor(lead)
  const roi = estimateRoi(lead)
  const machine = lead.machines[0]
  const maq = machine?.name ?? 'máquina láser/CNC'

  const benefits = [
    `Producción propia de ${p.processes[0]}: dejan de depender de terceros.`,
    `Menor costo por pieza y control total de tiempos y calidad.`,
    `Mejor terminación en ${p.materials.slice(0, 2).join(' y ')}, sin retrabajo.`,
    `Nueva unidad de negocio: tomar trabajos a terceros con la ${maq}.`,
    `Garantía propia, puesta en marcha y asesoramiento de 2GTech3D.`,
  ]

  const argumentos = [
    `Amortización estimada en ~${roi.paybackMonths} meses (${AR.format(roi.monthlySaving)}/mes hoy en tercerización).`,
    `Precisión y velocidad muy superiores a ${p.likelyMachinery[0] ?? 'los métodos actuales'}.`,
    `Autonomía: producen cuando quieren, sin colas de proveedores.`,
    `Diferenciación frente a competidores del rubro que aún tercerizan.`,
  ]

  const objections = [
    {
      objection: 'Es una inversión muy grande.',
      response: `Es inversión productiva, no gasto: con ~${AR.format(roi.monthlySaving)}/mes que hoy se van en tercerización, se repaga en ~${roi.paybackMonths} meses. Además manejamos financiación.`,
    },
    {
      objection: 'Prefiero seguir tercerizando.',
      response: `Lo que hoy pagás a un tercero por ${p.painToday.replace('tercerizan ', '')} queda dentro de tu empresa, con tus tiempos y tu calidad. ¿Te muestro el número de ahorro mensual?`,
    },
    {
      objection: 'Ya tengo una máquina.',
      response: `Buenísimo. Muchos clientes nos suman como respaldo o para más capacidad/formato. Te paso specs de la ${maq} para comparar prestaciones, garantía y postventa.`,
    },
    {
      objection: 'No sé si la voy a usar lo suficiente.',
      response: `Con tu nivel de actividad (${p.productionType}) alcanza para justificarla, y podés ofrecer corte/grabado a terceros para amortizarla más rápido.`,
    },
  ]

  const callScript = [
    `1) Apertura: "Hola, soy de 2GTech3D. Trabajamos con maquinaria láser/CNC industrial. Vi que ${lead.name} se dedica a ${lead.category.toLowerCase()}."`,
    `2) Diagnóstico: "¿Hoy cómo resuelven ${p.processes[0]}? ¿Lo hacen internamente o lo tercerizan?"`,
    `3) Dolor: confirmar que ${p.painToday} y cuánto les cuesta por mes.`,
    `4) Solución: presentar la ${maq} → ${p.benefit}.`,
    `5) Valor: amortización en ~${roi.paybackMonths} meses + garantía y puesta en marcha.`,
    `6) Cierre: "¿Coordinamos una demostración esta semana?"`,
  ].join('\n')

  return {
    benefits,
    arguments: argumentos,
    objections,
    callScript,
    roi,
    messages: allMessages(lead),
  }
}
