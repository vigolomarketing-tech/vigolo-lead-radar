<div align="center">

# 🛰️ Vigolo Lead Radar

**Plataforma SaaS de prospección comercial impulsada por IA**
para **Vigolo Web Studio**.

Encontrá negocios en toda Argentina, analizá su presencia digital con IA,
detectá oportunidades, generá auditorías y mensajes, y gestioná todo el
proceso comercial — desde un solo lugar.

🔗 **Demo en producción:** <https://vigolomarketing-tech.github.io/vigolo-lead-radar/>

</div>

---

## 📑 Índice

1. [Qué hace](#-qué-hace)
2. [Stack](#-stack)
3. [Instalación local](#-instalación-local)
4. [Configurar Google Places](#-configurar-google-places)
5. [Configurar OpenAI](#-configurar-openai)
6. [Desplegar el backend (Cloudflare Worker)](#-desplegar-el-backend-cloudflare-worker)
7. [Deploy del frontend](#-deploy-del-frontend)
8. [Variables de entorno](#-variables-de-entorno)
9. [Cómo usar cada función](#-cómo-usar-cada-función)
10. [Arquitectura](#-arquitectura)
11. [Roadmap / próximos pasos](#-roadmap--próximos-pasos)

---

## 🚀 Qué hace

Vigolo Lead Radar hace el trabajo de horas de prospección manual en minutos:

| Módulo | Descripción |
| ------ | ----------- |
| **🛰️ Radar IA** | Recorre Argentina provincia por provincia buscando negocios con oportunidad y guarda los mejores automáticamente. |
| **⌖ Prospección** | Búsqueda por provincia / ciudad / localidad / barrio / código postal + radio, con filtros avanzados (rating, reseñas, con/sin web, Instagram, verificados, etc.). |
| **🎯 Campañas** | Organizá la prospección por objetivos ("100 Barberías en Córdoba") con negocios, contactados y conversión. |
| **🧠 Análisis IA** | Diagnóstico automático de cada negocio: web, velocidad, SEO, WhatsApp, CTA, HTTPS, branding, redes, etc. |
| **📊 Scoring inteligente** | Puntaje 1–100 con desglose factor por factor y nivel de oportunidad. |
| **🥊 Competencia** | Compara el negocio con otros de su rubro y ciudad (reseñas, mejor web). |
| **📄 Auditoría PDF** | Informe profesional con identidad de la agencia, listo para enviar al cliente. |
| **✨ Generador de Demos** | Crea una landing personalizada para el negocio, lista para mostrarla. |
| **💬 IA Comercial** | Mensajes personalizados (WhatsApp, Instagram, Email, LinkedIn, seguimientos, objeciones). |
| **✦ Asesor IA accionable** | Chat que responde y ejecuta acciones ("Buscame barberías sin web en Córdoba", "Generá una campaña en Rosario"). |
| **▤ CRM profesional** | Pipeline Kanban con drag & drop, prioridad, etiquetas, tareas, notas, historial, recordatorios, valor y probabilidad de cierre. |
| **⏰ Seguimiento IA** | A quién contactar hoy, con qué canal y probabilidad de respuesta. |
| **🎯 Metas** | Objetivos de clientes y facturación con progreso. |
| **⊚ Mapa** | Negocios geolocalizados con clustering + mapa de calor + filtros. |
| **↓ Exportaciones** | CSV, Excel, JSON, PDF, Google Sheets, Notion. |
| **⚡ Integraciones** | Arquitectura lista para Google Places, OpenAI, Sheets, HubSpot, Notion, Slack, Discord, WhatsApp, Instagram, Email, Supabase, PostgreSQL, Firebase. |

> ⚠️ La app **nunca envía mensajes sola**: genera el texto para copiar y pegar,
> evitando bloqueos en WhatsApp / Instagram.

**Funciona sin configurar nada** en modo demo (dataset nacional real de las 24
provincias). Con las credenciales configuradas, los datos y la IA pasan a ser
**reales** — sin tocar código.

---

## 🛠️ Stack

- **Frontend:** React 18 · Vite 5 · TypeScript · Tailwind CSS 3
- **Estado:** Zustand (con persistencia en `localStorage`)
- **Routing:** React Router (HashRouter, compatible con GitHub Pages)
- **Gráficos:** Recharts · **Mapa:** Leaflet + markercluster + heat
- **PDF:** jsPDF · **Virtualización:** react-window
- **Backend/proxy:** Cloudflare Worker

---

## 💻 Instalación local

Requiere **Node.js 18+**.

```bash
git clone https://github.com/vigolomarketing-tech/vigolo-lead-radar.git
cd vigolo-lead-radar
npm install
npm run dev        # http://localhost:5173
```

Otros comandos:

```bash
npm run build      # build de producción (tsc + vite)
npm run preview    # previsualizar el build
npm run lint       # ESLint
```

Copiá `.env.example` a `.env` para configurar credenciales y datos de la agencia.

---

## 📍 Configurar Google Places

Necesario solo para búsquedas **reales** (en demo funciona sin esto).

1. Entrá a [Google Cloud Console](https://console.cloud.google.com/).
2. Creá un proyecto y activá **Places API (New)**.
3. Creá una **API Key** en *APIs & Services → Credentials*.
4. **Restringí la key** a la Places API y configurá cuotas/límites de gasto.
5. **No pongas la key en el frontend.** Va en el backend (paso siguiente) como
   secret `GOOGLE_PLACES_API_KEY`.

> La key **nunca** debe estar en variables `VITE_*` ni en el bundle del
> navegador: cualquiera podría robarla. Por eso existe el backend/proxy.

---

## ✦ Configurar OpenAI

Necesario solo para análisis y mensajes **con IA real** (en demo funciona con
el analista local).

1. Entrá a [platform.openai.com](https://platform.openai.com/).
2. Creá una **API Key** en *API Keys*.
3. Configurá límites de uso.
4. La key va en el backend como secret `OPENAI_API_KEY`. Modelo por defecto:
   `gpt-4o-mini` (configurable con `OPENAI_MODEL`).

---

## ☁️ Desplegar el backend (Cloudflare Worker)

El backend (`server/`) es un **Cloudflare Worker** que guarda las API keys del
lado del servidor y resuelve CORS. Deploy en ~5 minutos (plan gratuito alcanza).

```bash
cd server
npm install
npx wrangler login

# Cargar las API keys como secrets (no quedan en el código):
npx wrangler secret put GOOGLE_PLACES_API_KEY
npx wrangler secret put OPENAI_API_KEY

# (opcional) restringir CORS a tu dominio en wrangler.toml → ALLOWED_ORIGIN

npm run deploy
```

Al terminar, Wrangler imprime la URL del Worker, por ejemplo:
`https://vigolo-lead-radar-api.TU-SUBDOMINIO.workers.dev`

**Endpoints:** `GET /health`, `POST /places/search`, `POST /ai/analyze`,
`POST /ai/message`, `POST /ai/messages`, `POST /ai/advisor`.

Verificá con: `curl https://TU-WORKER.workers.dev/health`

---

## 🌐 Deploy del frontend

La app es **100% estática** (`dist/`). El `base` se configura con `VITE_BASE`.

### Opción A — GitHub Pages (ya configurado)

El workflow `.github/workflows/deploy.yml` publica automáticamente en cada push
a `main`. Requisito único (una vez): **Settings → Pages → Source = "GitHub
Actions"**. Queda en `https://<usuario>.github.io/vigolo-lead-radar/`.

### Opción B — Vercel

Importá el repo en [vercel.com/new](https://vercel.com/new): build
`npm run build`, output `dist`. `VITE_BASE=/` (default).

### Conectar el backend real

En las variables del frontend (`.env`, o Environment Variables en Pages/Vercel):

```bash
VITE_DATA_PROVIDER=google
VITE_AI_PROVIDER=openai
VITE_API_BASE_URL=https://vigolo-lead-radar-api.TU-SUBDOMINIO.workers.dev
```

Rebuild y listo: datos e IA reales. **Si falta alguna credencial, la app cae
sola al modo demo/local — nunca se rompe.**

---

## 🔑 Variables de entorno

| Variable | Dónde | Para qué |
| -------- | ----- | -------- |
| `VITE_DATA_PROVIDER` | frontend | `mock` (demo) o `google` (real). |
| `VITE_AI_PROVIDER` | frontend | `mock` (local) o `openai` (real). |
| `VITE_API_BASE_URL` | frontend | URL del Worker backend. |
| `VITE_AGENCY_NAME` | frontend | Nombre de la agencia en mensajes/auditorías. |
| `VITE_AGENCY_SIGNATURE` | frontend | Firma al pie de los mensajes. |
| `VITE_CURRENCY` / `VITE_DEFAULT_TICKET` | frontend | Moneda y ticket base del CRM. |
| `VITE_BASE` | build | `/vigolo-lead-radar/` (Pages) o `/` (Vercel). |
| `GOOGLE_PLACES_API_KEY` | backend (secret) | Key de Google Places. |
| `OPENAI_API_KEY` | backend (secret) | Key de OpenAI. |
| `OPENAI_MODEL` | backend | Modelo (default `gpt-4o-mini`). |
| `ALLOWED_ORIGIN` | backend | CORS (dominio del front o `*`). |

> Las keys reales van **solo** en el backend como secrets. Nunca en `VITE_*`.

---

## 📖 Cómo usar cada función

- **Radar IA** → *Radar IA* → elegí rubro/reseñas/web y **Activar Radar IA**.
  Recorre las provincias y te muestra las oportunidades más calientes.
- **Prospección** → elegí provincia/ciudad/rubro (o **Buscar en toda
  Argentina**), aplicá filtros y explorá los resultados. Click en una tarjeta
  abre la ficha del lead.
- **Ficha del lead** (drawer) con pestañas:
  - *Resumen*: datos del negocio (web, WhatsApp, Instagram, reseñas, Maps).
  - *Análisis IA*: **Analizar negocio** → diagnóstico, métricas, competencia,
    y **Auditoría PDF**.
  - *Mensajes*: **Generar** → variantes por canal + **Copiar**.
  - *CRM*: estado, prioridad, etiquetas, tareas, notas, historial,
    recordatorios, valor y probabilidad.
  - **✨ Crear demo**: genera una landing personalizada en una pestaña nueva.
- **Campañas** → creá una campaña (provincia/ciudad/rubro + objetivo) y seguí
  negocios, contactados y conversión.
- **CRM** → tablero Kanban; **arrastrá** las tarjetas entre estados.
- **Asesor IA** → preguntá o pedí acciones: *"Buscame gimnasios sin web en
  Rosario"*, *"Generá una campaña de barberías en Córdoba"*, *"¿Qué precio
  recomendás?"*.
- **Mapa** → clusters o mapa de calor, filtro por provincia; click en un
  marcador abre la ficha.
- **Dashboard** → KPIs, embudo, metas (editables), seguimientos del día,
  mejor provincia/ciudad/rubro y gráficos.
- **Exportar** → botón *Exportar* en Prospección/CRM: CSV, Excel, JSON, PDF,
  Google Sheets, Notion.

---

## 🏗️ Arquitectura

```
vigolo-lead-radar/
├── server/                 # Backend / proxy (Cloudflare Worker)
│   ├── src/worker.js       #   Google Places + OpenAI (keys server-side)
│   ├── wrangler.toml
│   └── README.md
└── src/
    ├── config/             # app, integraciones, geografía de Argentina
    ├── types/              # modelo de dominio
    ├── lib/                # scoring, competencia, seguimientos, labels, formato
    ├── utils/              # exportadores, helpers
    ├── services/
    │   ├── providers/      # dataProvider (mock | google) + dataset nacional
    │   ├── ai/             # aiProvider (mock | openai) + analista local
    │   ├── audit/          # auditoría PDF
    │   └── demo/           # generador de demos
    ├── store/              # Zustand (estado global + persistencia)
    ├── hooks/              # selectores derivados
    ├── components/         # UI primitives + layout
    └── features/           # dashboard, radar, prospecting, campaigns,
                            # leads, analysis, messages, crm, map, advisor,
                            # integrations
```

**Providers con adapters** — toda fuente externa está detrás de una fachada
(`dataProvider`, `aiProvider`). Cambiar de `mock` a `google`/`openai` no toca
la UI: solo variables de entorno.

---

## 🧭 Roadmap / próximos pasos

- Persistencia en la nube (Supabase / PostgreSQL / Firebase) para multi-usuario.
- Auditoría web real (Lighthouse / PageSpeed) desde el backend.
- Envío asistido por WhatsApp Business API e Instagram Graph API.
- Sincronización con HubSpot / Google Sheets / Notion.
- Autenticación y planes.

---

<div align="center">

Hecho para uso interno de **Vigolo Web Studio**.

</div>
