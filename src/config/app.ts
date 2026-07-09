// =====================================================================
// Configuración central de la app + flags de entorno
// =====================================================================

const env = import.meta.env

export const APP = {
  name: 'Vigolo Lead Radar',
  shortName: 'Lead Radar',
  tagline: 'Prospección comercial impulsada por IA',
  agency: {
    name: env.VITE_AGENCY_NAME ?? 'Vigolo Web Studio',
    signature: env.VITE_AGENCY_SIGNATURE ?? 'Santiago — Vigolo Web Studio',
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
  /** Base URL del backend/proxy (ej: https://api.vigolo.dev). */
  apiBaseUrl: (env.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''),
} as const

/**
 * ¿Hay un backend/proxy configurado? Es condición necesaria (pero no
 * suficiente: el backend además debe tener la GOOGLE_PLACES_API_KEY) para
 * poder traer datos reales. Sin esto, la app siempre usa datos demo.
 */
export const BACKEND_CONFIGURED = Boolean(PROVIDERS.apiBaseUrl)

/** Moneda para valores potenciales/reales del CRM. */
export const CURRENCY = {
  code: env.VITE_CURRENCY ?? 'USD',
  locale: 'es-AR',
} as const

/** Ticket promedio sugerido por rubro (para estimar valor potencial). */
export const DEFAULT_TICKET = Number(env.VITE_DEFAULT_TICKET ?? 800)
