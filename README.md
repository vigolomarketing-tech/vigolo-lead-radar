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
8. [Modo Real vs. Modo Demo](#-modo-real-vs-modo-demo)
9. [Variables de entorno](#-variables-de-entorno)
10. [Cómo usar cada función](#-cómo-usar-cada-función)
11. [Arquitectura](#-arquitectura)
12. [Roadmap / próximos pasos](#-roadmap--próximos-pasos)

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

En las variables del frontend (`.env`, o Environment Variables en Pages/Vercel)
alcanza con **una** variable: la URL del backend.

```bash
VITE_API_BASE_URL=https://vigolo-lead-radar-api.TU-SUBDOMINIO.workers.dev
```

Rebuild y listo. Con eso, la app arranca en **Modo Real** y trae negocios
reales de Google Places automáticamente. **Si falta alguna credencial o el
backend no responde, cae sola a datos demo — nunca se rompe.**

> `VITE_DATA_PROVIDER` / `VITE_AI_PROVIDER` siguen existiendo pero son
> **opcionales/informativas**: el origen real de los datos lo decide el
> selector Modo Real/Demo en runtime y la disponibilidad del backend.

---

## 🟢🟡 Modo Real vs. Modo Demo

En la barra superior hay un **selector Modo Real / Modo Demo** (por defecto
**Real**). Un punto de estado al lado indica si el backend está listo:
🟢 verde = Google Places disponible, 🟡 ámbar = backend sin key/inalcanzable,
⚪ gris = sin backend configurado.

- **Modo Real** (default): usa **Google Places** vía el backend/proxy. Trae
  nombre, dirección, teléfono, sitio web (o lo marca *Sin web*), rubro,
  horarios, reseñas, rating, fotos, coordenadas y Place ID reales. Pagina con
  `nextPageToken` para traer el máximo de resultados y **cachea** las búsquedas
  recientes (15 min) para no consultar Google de más. Cae a demo solo si: **no
  hay backend / no hay conexión / Google devuelve error**.
- **Modo Demo**: siempre datos de demostración (respaldo), sin tocar Google.

**Nunca hay confusión sobre el origen del dato:** cada lead muestra una insignia
🟢 *Datos reales de Google* o 🟡 *Datos demo*, y cada búsqueda informa de dónde
salieron los resultados (incluido si fue respaldo o caché).

### Puesta en marcha para traer datos reales (paso a paso)

1. **Google Cloud** → activá *Places API (New)* y creá una API Key
   ([detalle arriba](#-configurar-google-places)). Restringí la key y ponele
   límite de gasto.
2. **(Opcional) OpenAI** → creá una API Key para análisis/mensajes con IA real.
3. **Desplegá el backend** (Cloudflare Worker):
   ```bash
   cd server && npm install && npx wrangler login
   npx wrangler secret put GOOGLE_PLACES_API_KEY   # pegás la key de Google
   npx wrangler secret put OPENAI_API_KEY          # (opcional) key de OpenAI
   npm run deploy
   ```
   Anotá la URL que imprime Wrangler y verificá:
   `curl https://TU-WORKER.workers.dev/health` → debe responder
   `{"ok":true,"places":true,...}`.
4. **Configurá el frontend** con esa URL:
   `VITE_API_BASE_URL=https://TU-WORKER.workers.dev` (en `.env` local, o en
   Environment Variables de GitHub Pages / Vercel).
5. **Rebuild/redeploy** el frontend. Al abrir la app, el punto de estado se pone
   🟢 y las búsquedas en Modo Real ya traen negocios reales desde el primer uso.
6. **Verificá:** buscá algo real (ej. *"barberías en Córdoba"*), abrí un lead y
   confirmá que el nombre/dirección/teléfono existen en Google Maps; los que no
   tienen web aparecen marcados como *Sin web* (oportunidad de venta).

---

## 📲 Instalar como app (PWA)

Vigolo Lead Radar es una **PWA instalable**: se puede agregar a la pantalla de
inicio del celular o al escritorio y abre en modo app (pantalla completa, sin
barra del navegador). Se mantiene el mismo deploy de GitHub Pages.

### Android (Chrome)
1. Abrí la URL en Chrome.
2. Tocá el botón **“Instalar app”** que aparece abajo (o menú ⋮ → *Instalar
   aplicación* / *Agregar a pantalla de inicio*).
3. Confirmá. Queda como app con su ícono.

### iPhone / iPad (Safari)
1. Abrí la URL en **Safari**.
2. Tocá **Compartir** ⬆️ → **“Agregar a pantalla de inicio”** → **Agregar**.
   (El botón *Instalar app* de la web te muestra estos mismos pasos.)

### Desktop (Chrome / Edge)
1. Abrí la URL.
2. Clic en el ícono de **instalar** en la barra de direcciones (o menú →
   *Instalar Vigolo Lead Radar*), o el botón **“Instalar app”**.

> El botón *Instalar app* aparece solo si el navegador permite la instalación y
> se oculta si la app ya está instalada.

### Qué funciona offline
- Carga de la app (shell), navegación entre secciones y **datos guardados**
  (leads, CRM, campañas y metas persistidos en el dispositivo).
- **No** funciona sin conexión: la búsqueda real (Google Places) y la IA real
  (OpenAI), que necesitan internet. Al perder conexión aparece un aviso y la app
  sigue usable con lo guardado.

### Cambiar íconos y colores
- **Colores**: `theme_color` (#3EA6FF) y `background_color` (#050816) en el
  `manifest` de `vite.config.ts`, más `theme-color` en `index.html`.
- **Íconos**: editá `scripts/generate-icons.mjs` (colores/diseño del radar) y
  regenerá con `node scripts/generate-icons.mjs` (usa `sharp`). Se crean en
  `public/icons/` (192, 512, maskable, apple-touch y splashes iOS).

## 🔑 Variables de entorno

| Variable | Dónde | Para qué |
| -------- | ----- | -------- |
| `VITE_API_BASE_URL` | frontend | **URL del Worker backend.** Es lo único necesario para habilitar datos reales; el Modo Real está activo por defecto. |
| `VITE_DATA_PROVIDER` | frontend | Opcional/informativa (`mock`/`google`). El origen real lo decide el selector Modo Real/Demo + disponibilidad del backend. |
| `VITE_AI_PROVIDER` | frontend | `mock` (local) o `openai` (real). |
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
