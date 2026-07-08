// =====================================================================
// Motor de Score de Potencial de Compra (2GTech3D)
// ---------------------------------------------------------------------
// Un puntaje ALTO = mayor probabilidad de que la empresa compre una
// máquina láser/CNC de 2GTech3D. Se pondera principalmente el ajuste del
// rubro con las máquinas + señales de actividad, tamaño y facilidad de
// contacto. Devuelve el desglose factor por factor.
// =====================================================================

import { recommendForCategory } from '../config/machines'
import type {
  BusinessSignals,
  MachineFit,
  OpportunityLevel,
  ScoreFactor,
  ScoreResult,
} from '../types'

export function levelFromScore(score: number): OpportunityLevel {
  if (score >= 70) return 'alta'
  if (score >= 45) return 'media'
  return 'baja'
}

/** Puntos base según cuán directo es el uso de la máquina en el rubro. */
const FIT_POINTS: Record<MachineFit, number> = {
  ideal: 34,
  alto: 26,
  medio: 15,
  exploratorio: 6,
}

const FIT_LABEL: Record<MachineFit, string> = {
  ideal: 'Rubro ideal',
  alto: 'Rubro de alto encaje',
  medio: 'Rubro de encaje medio',
  exploratorio: 'Encaje a validar',
}

/**
 * Calcula el score de potencial de compra de una máquina.
 * `signals` = datos públicos del negocio; `category` = rubro detectado.
 */
export function computeScore(
  signals: BusinessSignals,
  category: string,
): ScoreResult {
  const rec = recommendForCategory(category)
  const f: ScoreFactor[] = []
  const push = (key: string, label: string, points: number, detail: string) =>
    f.push({ key, label, points, detail })

  const reviews = signals.reviewsCount ?? 0
  const rating = signals.rating ?? 0
  const hasWeb = Boolean(signals.website && signals.website.trim())

  // 1) Ajuste del rubro con las máquinas (driver principal)
  push('fit', FIT_LABEL[rec.fit], FIT_POINTS[rec.fit], rec.reason)

  // 2) Tamaño / trayectoria aparente (reseñas = empresa consolidada)
  if (reviews >= 120) push('size', 'Empresa grande', 14, `${reviews} reseñas: volumen y estructura para invertir.`)
  else if (reviews >= 40) push('size', 'Empresa consolidada', 10, `${reviews} reseñas: negocio establecido.`)
  else if (reviews >= 12) push('size', 'Empresa en crecimiento', 6, `${reviews} reseñas.`)
  else push('size', 'Empresa chica / nueva', 2, 'Pocas reseñas: validar capacidad de inversión.')

  // 3) Reputación (negocio sano que puede afrontar la compra)
  if (rating >= 4.5) push('rating', 'Excelente reputación', 6, `Rating ${rating.toFixed(1)}★: empresa sólida.`)
  else if (rating >= 4.0) push('rating', 'Buena reputación', 4, `Rating ${rating.toFixed(1)}★.`)
  else if (rating > 0) push('rating', 'Reputación media', 1, `Rating ${rating.toFixed(1)}★.`)

  // 4) Web propia = empresa formal e invertible (señal POSITIVA)
  if (hasWeb) {
    const modern = signals.websiteQuality === 'moderna'
    push('web', modern ? 'Web profesional' : 'Tiene web', modern ? 8 : 6,
      'Empresa formal con presencia propia: perfil que invierte en equipamiento.')
  } else {
    push('web', 'Sin web', 1, 'Sin sitio propio: validar formalidad por otros canales.')
  }

  // 5) Facilidad de contacto (canal directo con el decisor)
  if (signals.whatsapp) push('wsp', 'Tiene WhatsApp', 6, 'Canal directo para enviar catálogo y cotización.')
  else if (signals.phone) push('phone', 'Tiene teléfono', 3, 'Contactable por teléfono.')

  // 6) Redes activas = empresa que invierte y es fácil de ubicar
  const hasIg = Boolean(signals.instagram)
  if (hasIg && signals.hasActiveInstagram) push('ig', 'Instagram activo', 5, 'Muestra su producción: fácil de calificar y contactar.')
  else if (hasIg) push('ig', 'Instagram', 2, 'Presencia en Instagram.')
  if (signals.facebook) push('fb', 'Facebook', 2, 'Presencia adicional en Facebook.')

  // 7) Verificado en Google (empresa real y ubicable)
  if (signals.verified) push('verified', 'Negocio verificado', 3, 'Perfil verificado en Google.')

  const raw = f.reduce((sum, x) => sum + x.points, 0)
  const score = Math.max(1, Math.min(100, Math.round(18 + raw)))
  const level = levelFromScore(score)

  const primary = rec.machines[0]
  const headline =
    rec.fit === 'ideal'
      ? `Rubro ideal para ${MACHINE_SHORT[primary?.line] ?? 'máquina 2GTech3D'}: oportunidad ${level}.`
      : rec.fit === 'exploratorio'
        ? `Encaje a validar antes de avanzar: oportunidad ${level}.`
        : `Buen encaje con ${MACHINE_SHORT[primary?.line] ?? 'máquina 2GTech3D'}: oportunidad ${level}.`

  return {
    score,
    level,
    machineFit: rec.fit,
    machines: rec.machines,
    factors: f.sort((a, b) => b.points - a.points),
    headline,
  }
}

const MACHINE_SHORT: Record<string, string> = {
  'laser-fibra': 'corte láser fibra',
  'grabadora-fibra': 'grabado láser fibra',
  co2: 'láser CO2',
  construccion: 'línea construcción',
}
