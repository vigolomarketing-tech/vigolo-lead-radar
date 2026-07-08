// =====================================================================
// Configuración central de la app + flags de entorno
// =====================================================================

const env = import.meta.env

export const APP = {
  name: '2GTech3D Lead Radar',
  shortName: 'Lead Radar',
  tagline: 'Prospección industrial impulsada por IA',
  /** Empresa vendedora (2GTech3D) — datos públicos de su web. */
  agency: {
    name: env.VITE_AGENCY_NAME ?? '2GTech3D',
    signature: env.VITE_AGENCY_SIGNATURE ?? 'Equipo Comercial — 2GTech3D',
    phone: env.VITE_AGENCY_PHONE ?? '+54 9 11 3145-4001',
    whatsapp: env.VITE_AGENCY_WHATSAPP ?? '5491131454001',
    email: env.VITE_AGENCY_EMAIL ?? 'info@2gtech.com.ar',
    address: env.VITE_AGENCY_ADDRESS ?? 'Muñiz 1888, CABA (Flores)',
    site: env.VITE_AGENCY_SITE ?? 'https://www.2gtech3d.com',
  },
} as const

/**
 * Providers de datos e IA.
 *  - 'mock'  : funciona 100% en el navegador (demo/offline).
 *  - 'google'/'openai': llaman a un backend/proxy propio (VITE_API_BASE_URL)
 *    que guarda las API keys. NUNCA exponer keys en el front.
 */
export const PROVIDERS = {
  data: (env.VITE_DATA_PROVIDER ?? 'mock') as 'mock' | 'google',
  ai: (env.VITE_AI_PROVIDER ?? 'mock') as 'mock' | 'openai',
  /** Base URL del backend/proxy (ej: https://api.2gtech3d.dev). */
  apiBaseUrl: env.VITE_API_BASE_URL ?? '',
} as const

/** Moneda para valores potenciales/reales del CRM (máquinas en ARS). */
export const CURRENCY = {
  code: env.VITE_CURRENCY ?? 'ARS',
  locale: 'es-AR',
} as const

/**
 * Ticket promedio sugerido (ARS) cuando no hay una máquina puntual asociada.
 * Las máquinas 2GTech3D van de ~$3.4M (CO2 chica) a ~$70M (láser fibra).
 */
export const DEFAULT_TICKET = Number(env.VITE_DEFAULT_TICKET ?? 12000000)
