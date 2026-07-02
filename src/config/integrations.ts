// =====================================================================
// Catálogo de integraciones (arquitectura preparada, sin envíos automáticos)
// =====================================================================

import { PROVIDERS } from './app'

export interface IntegrationDef {
  id: string
  name: string
  category: 'datos' | 'ia' | 'crm' | 'mensajeria' | 'productividad'
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
    description: 'Búsqueda real de negocios por zona, rubro y radio.',
    connected: PROVIDERS.data === 'google' && Boolean(PROVIDERS.apiBaseUrl),
    docsHint: 'Configurar VITE_DATA_PROVIDER=google y VITE_API_BASE_URL.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ia',
    description: 'Análisis, auditorías y mensajes generados con IA.',
    connected: PROVIDERS.ai === 'openai' && Boolean(PROVIDERS.apiBaseUrl),
    docsHint: 'Configurar VITE_AI_PROVIDER=openai y el proxy backend.',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'productividad',
    description: 'Exportar y sincronizar leads a una hoja de cálculo.',
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
    description: 'Volcar leads y auditorías a una base de Notion.',
    connected: false,
    docsHint: 'Requiere integración de Notion (backend).',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'mensajeria',
    description: 'Notificaciones de nuevos leads calientes al canal.',
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
    description: 'Copiar/pegar manual hoy. Envío asistido a futuro.',
    connected: false,
    docsHint: 'Envío manual para evitar bloqueos. API oficial a futuro.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'mensajeria',
    description: 'DMs manuales hoy. Automatización a futuro.',
    connected: false,
    docsHint: 'Envío manual. API de Instagram a futuro.',
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
