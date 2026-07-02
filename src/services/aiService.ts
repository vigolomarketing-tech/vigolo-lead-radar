// =====================================================================
// Servicio de generacion de mensajes de prospeccion
// ---------------------------------------------------------------------
// MVP: genera los mensajes localmente con plantillas de tono argentino,
// cercano y profesional. Preparado para delegar en OpenAI cuando haya key.
//
// IMPORTANTE: este servicio SOLO genera texto. Nunca envia mensajes.
// El envio es manual (copiar y pegar) para evitar bloqueos en
// WhatsApp / Instagram.
// =====================================================================

import { opportunityLevel } from '../lib/scoring'
import { DIGITAL_PRESENCE_LABEL } from '../lib/labels'
import type { GeneratedMessage, Lead, MessageChannel } from '../types'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-4o-mini'
const AGENCY_NAME = import.meta.env.VITE_AGENCY_NAME ?? 'Vigolo Web Studio'
const AGENCY_SIGNATURE =
  import.meta.env.VITE_AGENCY_SIGNATURE ?? 'Santiago - Vigolo Web Studio'

export const MESSAGE_CHANNELS: { channel: MessageChannel; label: string }[] = [
  { channel: 'whatsapp', label: 'WhatsApp (corto)' },
  { channel: 'instagram', label: 'Instagram DM' },
  { channel: 'email', label: 'Email (profesional)' },
  { channel: 'seguimiento', label: 'Seguimiento' },
]

/** Gancho segun el estado de presencia digital del negocio. */
function hook(lead: Lead): string {
  switch (lead.digitalPresence) {
    case 'sin-web':
      return `vi que ${lead.name} tiene muy buena presencia en la zona pero todavia no tiene una pagina web propia`
    case 'web-vieja':
      return `estuve mirando la web de ${lead.name} y me parece que con un rediseno le podrian sacar mucho mas provecho`
    case 'web-aceptable':
      return `vi la web de ${lead.name} y esta buena, creo que con unos ajustes podria generar bastantes mas consultas`
    case 'buen-potencial':
      return `me gusto mucho como se maneja ${lead.name} y creo que hay margen para potenciar la web y captar mas clientes`
  }
}

/** Referencia a Instagram/reseñas para que suene personalizado y real. */
function socialProof(lead: Lead): string {
  if (lead.instagram && lead.hasActiveInstagram) {
    return `Se nota que le meten al Instagram (${lead.instagram}), y una web ayudaria a cerrar esas consultas.`
  }
  if (lead.reviewsCount && lead.reviewsCount >= 40) {
    return `Vi que tienen ${lead.reviewsCount} resenas en Google, ya hay una base de clientes buenisima para aprovechar.`
  }
  return 'Creo que una web bien hecha les sumaria muchas consultas por WhatsApp.'
}

/** Plantillas locales por canal (fallback sin IA). */
function templateFor(channel: MessageChannel, lead: Lead): string {
  const nombre = lead.name

  switch (channel) {
    case 'whatsapp':
      return (
        `Hola! Como va? Te escribo de ${AGENCY_NAME}. ` +
        `${capitalize(hook(lead))}. ` +
        `Hago paginas web profesionales para negocios que quieren recibir mas consultas por WhatsApp. ` +
        `Te interesa que te muestre unos ejemplos? Sin compromiso 😊`
      )

    case 'instagram':
      return (
        `Hola! Como andan? 👋 ${capitalize(hook(lead))}. ` +
        `Tengo una agencia (${AGENCY_NAME}) y me especializo en webs para negocios como ${nombre}. ` +
        `${socialProof(lead)} ` +
        `Si quieren les paso ideas concretas, sin vueltas.`
      )

    case 'email':
      return (
        `Asunto: Una web que le traiga mas consultas a ${nombre}\n\n` +
        `Hola, como esta?\n\n` +
        `Mi nombre es ${AGENCY_SIGNATURE.split(' - ')[0]} y tengo una agencia de desarrollo web, ${AGENCY_NAME}. ` +
        `${capitalize(hook(lead))}.\n\n` +
        `${socialProof(lead)} Me especializo en crear paginas profesionales, rapidas y pensadas para que ` +
        `el cliente termine escribiendo por WhatsApp o dejando sus datos.\n\n` +
        `Si le interesa, con gusto le preparo una propuesta a medida para ${nombre}, sin ningun compromiso.\n\n` +
        `Saludos,\n${AGENCY_SIGNATURE}`
      )

    case 'seguimiento':
      return (
        `Hola! Como va? Te habia escrito hace unos dias por lo de la web para ${nombre}. ` +
        `No te quiero hinchar 🙌, solo saber si te interesa que te muestre algo concreto. ` +
        `Si es mal momento no hay drama, avisame y lo dejamos para mas adelante. Abrazo!`
      )
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Construye el prompt que se enviaria a OpenAI (documentado para la
 * integracion futura). Incluye contexto del negocio + reglas de tono.
 */
export function buildAiPrompt(lead: Lead, channel: MessageChannel): string {
  const level = opportunityLevel(lead.score)
  return [
    `Sos un vendedor argentino de una agencia web llamada ${AGENCY_NAME}.`,
    `Escribi un mensaje de prospeccion para el canal: ${channel}.`,
    `Tono: humano, cercano, argentino, profesional, NADA de spam.`,
    `No inventes datos. No prometas precios.`,
    ``,
    `Negocio: ${lead.name}`,
    `Rubro: ${lead.category}`,
    `Zona: ${lead.zone}`,
    `Presencia digital: ${DIGITAL_PRESENCE_LABEL[lead.digitalPresence]}`,
    `Instagram: ${lead.instagram ?? 'no tiene'}`,
    `Resenas Google: ${lead.reviewsCount ?? 'n/d'}`,
    `Nivel de oportunidad: ${level}`,
    `Firma: ${AGENCY_SIGNATURE}`,
  ].join('\n')
}

/**
 * TODO(API real): reemplazar por una llamada a OpenAI.
 *
 * async function generateWithOpenAI(lead, channel): Promise<string> {
 *   const res = await fetch('https://api.openai.com/v1/chat/completions', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       Authorization: `Bearer ${OPENAI_API_KEY}`,
 *     },
 *     body: JSON.stringify({
 *       model: OPENAI_MODEL,
 *       messages: [{ role: 'user', content: buildAiPrompt(lead, channel) }],
 *       temperature: 0.8,
 *     }),
 *   })
 *   const data = await res.json()
 *   return data.choices[0].message.content
 * }
 *
 * Nota: por seguridad, en produccion conviene llamar a OpenAI desde un
 * backend propio y no exponer la key en el front.
 */
export async function generateMessage(
  lead: Lead,
  channel: MessageChannel,
): Promise<string> {
  // Simula un pequeno "pensando..." para la UX.
  await new Promise((r) => setTimeout(r, 350))

  // Si en el futuro hay key, aca se delega en OpenAI (ver TODO arriba).
  const usingAi = Boolean(OPENAI_API_KEY) && OPENAI_MODEL
  void usingAi // el fallback local ya cubre el MVP

  return templateFor(channel, lead)
}

/** Genera de una las 4 variantes de mensaje para un lead. */
export async function generateAllMessages(
  lead: Lead,
): Promise<GeneratedMessage[]> {
  const results = await Promise.all(
    MESSAGE_CHANNELS.map(async ({ channel, label }) => ({
      channel,
      label,
      text: await generateMessage(lead, channel),
    })),
  )
  return results
}
