// =====================================================================
// Configuración central de la app + flags de entorno
// =====================================================================

const env = import.meta.env

export const APP = {
  name: '2GTech3D Lead Radar',
  shortName: '2G Radar',
  tagline: 'Radar comercial para detectar compradores de maquinas CNC y laser',
  agency: {
    name: env.VITE_AGENCY_NAME ?? '2GTech3D',
    signature: env.VITE_AGENCY_SIGNATURE ?? 'Equipo comercial - 2GTech3D',
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
  /** Base URL del backend/proxy (ej: https://api.2gtech3d.com). */
  apiBaseUrl: env.VITE_API_BASE_URL ?? '',
} as const

/** Moneda para valores potenciales/reales del CRM. */
export const CURRENCY = {
  code: env.VITE_CURRENCY ?? 'ARS',
  locale: 'es-AR',
} as const

/** Ticket promedio industrial si una maquina no trae precio especifico. */
export const DEFAULT_TICKET = Number(env.VITE_DEFAULT_TICKET ?? 12000000)
