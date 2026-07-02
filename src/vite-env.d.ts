/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_PLACES_API_KEY?: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_OPENAI_MODEL?: string
  readonly VITE_AGENCY_NAME?: string
  readonly VITE_AGENCY_SIGNATURE?: string
  readonly VITE_DATA_SOURCE?: 'mock' | 'google'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
