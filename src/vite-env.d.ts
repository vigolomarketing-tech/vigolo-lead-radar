/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Providers
  readonly VITE_DATA_PROVIDER?: 'mock' | 'google'
  readonly VITE_AI_PROVIDER?: 'mock' | 'openai'
  readonly VITE_API_BASE_URL?: string
  // Agencia / negocio
  readonly VITE_AGENCY_NAME?: string
  readonly VITE_AGENCY_SIGNATURE?: string
  readonly VITE_CURRENCY?: string
  readonly VITE_DEFAULT_TICKET?: string
  // Flags de integraciones (placeholder)
  readonly VITE_SHEETS_CONNECTED?: string
  readonly VITE_HUBSPOT_CONNECTED?: string
  // Deploy
  readonly VITE_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
