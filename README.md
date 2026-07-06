# Vigolo Lead Radar

Plataforma SaaS de **prospección comercial impulsada por IA** para
**Vigolo Web Studio**. Encuentra negocios, analiza su presencia digital,
detecta oportunidades, genera auditorías y mensajes, y organiza todo el
proceso comercial en un CRM profesional.

> ⚠️ La app **nunca envía mensajes sola**. Genera el texto para copiar y
> pegar, evitando bloqueos en WhatsApp / Instagram.

---

## 🆕 Novedades 3.0

- **Cobertura nacional**: búsqueda por provincia/ciudad/localidad en las 24
  jurisdicciones + botón **"Buscar en toda Argentina"** (barrido provincia por
  provincia con progreso). Dataset demo con cientos de negocios de todo el país.
- **CRM ampliado**: prioridad, etiquetas y tareas por lead.
- **Mapa profesional**: clustering + mapa de calor + filtro por provincia.
- **Dashboard**: embudo de conversión + mejor provincia/ciudad/rubro.
- **Filtros avanzados** (provincia, rubro, oportunidad, estado, prioridad).
- **Exportar** también a **Google Sheets** y **Notion**.
- **Rendimiento**: grilla **virtualizada** para miles de negocios.

## ✨ Módulos

- **Dashboard ejecutivo** — KPIs, tasas de respuesta/cierre, facturación
  potencial vs. real, gráficos (pipeline, oportunidad, zonas) con Recharts.
- **Prospección** — búsqueda por ciudad/barrio/provincia/país/código postal +
  radio, con filtros (rating, reseñas, abierto, con/sin web, teléfono,
  Instagram, verificados).
- **IA Analista** — botón *Analizar negocio*: diagnóstico completo (web, GBP,
  redes), métricas 0–100, hallazgos con impacto + solución, y comparador
  contra una web de Vigolo.
- **Score inteligente** — algoritmo ponderado (~20 factores) con desglose
  factor por factor.
- **Auditoría PDF** — informe profesional con identidad de la agencia, listo
  para enviar al cliente (jsPDF).
- **CRM profesional** — pipeline Kanban con drag & drop, valor potencial,
  probabilidad de cierre, notas, historial, recordatorios y seguimientos.
- **IA Comercial** — 12 variantes de mensaje (WhatsApp, Instagram, Email,
  LinkedIn, 3 seguimientos y respuestas a objeciones), tono argentino.
- **Asesor IA** — consultor que prioriza leads, sugiere zonas/rubros, precios
  y guiones de venta.
- **Mapa** — negocios geolocalizados con marcadores por nivel de oportunidad
  (Leaflet).
- **Exportaciones** — CSV, Excel, JSON y PDF.
- **Integraciones** — catálogo con arquitectura lista (Google Places, OpenAI,
  Sheets, HubSpot, Notion, Slack, Discord, WhatsApp, Instagram, Email,
  Calendario).

---

## 🏗️ Arquitectura

```
src/
├── config/       # app + integraciones (flags de entorno)
├── types/        # modelo de dominio
├── lib/          # scoring, labels, formato, ids
├── utils/        # cn, exportadores
├── services/
│   ├── providers/  # dataProvider (mock | google) + mock data
│   ├── ai/         # aiProvider (mock | openai) + analista local
│   ├── audit/      # generación de PDF
│   └── leadFactory # señales → Lead + score
├── store/        # zustand (estado global + persistencia)
├── hooks/        # selectores derivados (filtros, stats)
├── components/   # ui primitives + layout
└── features/     # dashboard, prospecting, leads, analysis,
                  # messages, crm, map, advisor, integrations
```

### Providers (clave de escalabilidad)

Toda fuente externa está detrás de un **adapter**:

- `VITE_DATA_PROVIDER=mock|google` — `mock` funciona offline; `google` llama a
  tu backend/proxy (`VITE_API_BASE_URL`).
- `VITE_AI_PROVIDER=mock|openai` — `mock` usa el analista local; `openai`
  delega en tu backend.

> **Importante:** Google Places y OpenAI **no se llaman desde el navegador**
> (expondría las API keys). La forma segura y escalable es un backend/proxy
> propio que guarde las keys. La UI no cambia al conectar el backend real.

---

## 🚀 Correr el proyecto

Requiere **Node 18+**.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build de producción (tsc + vite)
npm run preview   # previsualizar build
npm run lint      # eslint
```

Copiá `.env.example` a `.env` para configurar providers y datos de la agencia.

---

## ☁️ Deploy

App estática (`dist/`). `base` configurable con `VITE_BASE`.

- **GitHub Pages** (automático): workflow en `.github/workflows/deploy.yml`.
  Requiere una vez: **Settings → Pages → Source = "GitHub Actions"**.
  Publica en `https://vigolomarketing-tech.github.io/vigolo-lead-radar/`.
- **Vercel**: importar el repo (build `npm run build`, output `dist`).

---

## 🛠️ Stack

React 18 · Vite 5 · TypeScript · Tailwind CSS 3 · Zustand · React Router ·
Recharts · Leaflet · jsPDF.

Hecho para uso interno de **Vigolo Web Studio**.
