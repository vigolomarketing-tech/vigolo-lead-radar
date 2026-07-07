// =====================================================================
// Catálogo de integraciones (arquitectura preparada, sin envíos automáticos)
// =====================================================================

import { PROVIDERS } from './app'

export interface IntegrationDef {
  id: string
  name: string
  category: 'datos' | 'ia' | 'crm' | 'mensajeria' | 'productividad' | 'infra'
  description: string
  /** Cómo se determina si está "conectada" (por ahora, por env). */
  connected: boolean
  docsHint: string
}

const env = import.meta.env

export const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'google-places',
    name: 'Google Places',
    category: 'datos',
    description: 'Busqueda real de empresas industriales por zona, rubro y radio.',
    connected: PROVIDERS.data === 'google' && Boolean(PROVIDERS.apiBaseUrl),
    docsHint: 'Configurar VITE_DATA_PROVIDER=google y VITE_API_BASE_URL.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ia',
    description: 'Analisis industriales, informes y mensajes generados con IA.',
    connected: PROVIDERS.ai === 'openai' && Boolean(PROVIDERS.apiBaseUrl),
    docsHint: 'Configurar VITE_AI_PROVIDER=openai y el proxy backend.',
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    category: 'datos',
    description: 'Geocoding y detalles de lugares via backend/proxy.',
    connected: PROVIDERS.data === 'google' && Boolean(PROVIDERS.apiBaseUrl),
    docsHint: 'Comparte la misma key de Google (server-side).',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'infra',
    description: 'Base de datos + auth para persistir oportunidades en la nube.',
    connected: Boolean(env.VITE_SUPABASE_URL),
    docsHint: 'Configurar VITE_SUPABASE_URL / anon key (a futuro).',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'infra',
    description: 'Base de datos relacional para escalar a miles de oportunidades.',
    connected: false,
    docsHint: 'Vía backend propio (Supabase/Neon/RDS).',
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: 'infra',
    description: 'Alternativa de base de datos + auth en tiempo real.',
    connected: false,
    docsHint: 'Requiere proyecto Firebase (a futuro).',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'productividad',
    description: 'Exportar y sincronizar oportunidades a una hoja de calculo.',
    connected: Boolean(env.VITE_SHEETS_CONNECTED),
    docsHint: 'Requiere backend con Google API.',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    description: 'Sincronizar el pipeline con HubSpot CRM.',
    connected: Boolean(env.VITE_HUBSPOT_CONNECTED),
    docsHint: 'Requiere OAuth de HubSpot (backend).',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'productividad',
    description: 'Volcar oportunidades e informes a una base de Notion.',
    connected: false,
    docsHint: 'Requiere integración de Notion (backend).',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'mensajeria',
    description: 'Notificaciones de oportunidades industriales calientes al canal.',
    connected: false,
    docsHint: 'Requiere webhook de Slack (backend).',
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'mensajeria',
    description: 'Alertas de oportunidades altas por Discord.',
    connected: false,
    docsHint: 'Requiere webhook de Discord (backend).',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'mensajeria',
    description: 'Copiar/pegar manual hoy. Envio asistido a futuro.',
    connected: false,
    docsHint: 'Envio manual para evitar bloqueos. API oficial a futuro.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'mensajeria',
    description: 'DMs manuales hoy. Automatizacion a futuro.',
    connected: false,
    docsHint: 'Envio manual. API de Instagram a futuro.',
  },
  {
    id: 'email',
    name: 'Email',
    category: 'mensajeria',
    description: 'Secuencias de email (borradores listos para enviar).',
    connected: false,
    docsHint: 'Requiere proveedor SMTP/ESP (backend).',
  },
  {
    id: 'calendar',
    name: 'Calendario',
    category: 'productividad',
    description: 'Agendar reuniones y seguimientos.',
    connected: false,
    docsHint: 'Requiere Google/Microsoft Calendar (backend).',
  },
]
