<div align="center">

# 🛰️ 2GTech3D Lead Radar

**Plataforma de prospección industrial impulsada por IA** para vender las
máquinas láser / CNC de **[2GTech3D](https://www.2gtech3d.com)**.

Encontrá empresas en toda Argentina que **necesitan** una cortadora láser
fibra, una grabadora de metal/piedra o una CNC CO2. La herramienta detecta el
rubro, recomienda la máquina ideal, puntúa el potencial de compra, valida la
calidad del lead y genera el mensaje comercial listo para enviar.

</div>

---

## 🏭 El negocio de 2GTech3D (investigación)

2GTech3D (Muñiz 1888, CABA — Flores) **importa y vende maquinaria industrial**
con garantía propia, puesta en marcha y asesoramiento técnico. Su catálogo:

| Línea | Máquinas | Para qué sirve | Ticket (ARS) |
| ----- | -------- | -------------- | ------------ |
| **Corte Láser Fibra** | Cortadora Fibra 3015 3kW + compresor | Corte de metal / chapa (acero, inox, aluminio) | ~$69.5M |
| **Grabado Láser Fibra** | Grabadoras 30W / 60W | Grabado y marcado permanente en metal y piedra | $9.4M – $17M |
| **Láser CO2** | CO2 50W / 100W / 130W / 150W | Corte y grabado de MDF, madera, acrílico, cuero, tela | $3.4M – $17M |
| **Construcción** | Vibradores de hormigón, andamio eléctrico | Equipamiento de obra | $0.7M – $14M |

**Propuesta de valor:** importación directa (sin intermediarios), garantía
propia, servicio postventa, puesta en marcha y asesoramiento técnico.

**Rubros objetivo** (detectados y mapeados a cada máquina): metalúrgicas,
talleres industriales, herrerías, estructuras metálicas, autopartes,
mecanizado/CNC, matricería, marmolerías, joyerías, trofeos, regalería
empresarial, cartelería/señalética, fábricas de muebles, carpinterías,
marroquinería/cuero, textil, packaging, diseño industrial, prototipado/FabLab,
impresión 3D, escuelas y universidades técnicas, laboratorios, estudios de
arquitectura, constructoras y corralones.

El mapeo rubro → máquina + motivo vive en [`src/config/machines.ts`](src/config/machines.ts).

---

## 🚀 Qué hace

| Módulo | Descripción |
| ------ | ----------- |
| **🛰️ Radar IA** | Recorre Argentina provincia por provincia y guarda las empresas con mayor potencial de compra. |
| **⌖ Prospección** | Búsqueda por provincia / ciudad / localidad + filtros (rating, reseñas, con/sin web, Instagram, verificados). Incluye **búsquedas sugeridas** (prompts) listas para aplicar. |
| **🧠 Análisis IA** | Define la **máquina ideal**, arma las **señales de oportunidad** (tercerización, costos, capacidad, calidad, competencia) y compara "hoy vs. con la máquina". |
| **📊 Scoring de compra** | Puntaje 0–100 con desglose factor por factor: ajuste del rubro, tamaño, capacidad de inversión, contactabilidad, etc. |
| **✅ Calidad del lead** | Nivel **Alta / Media / Baja** según web activa, teléfono/WhatsApp, redes y rubro compatible. |
| **🛠️ Máquina recomendada** | Cada lead trae la máquina 2GTech3D sugerida + motivo + ticket estimado. |
| **📄 Informe PDF** | Análisis de oportunidad con identidad de 2GTech3D, listo para el vendedor. |
| **✨ Propuesta / one-pager** | Ficha comercial de la máquina personalizada para el lead, lista para enviar por WhatsApp. |
| **💬 IA Comercial** | Mensajes que **venden la máquina**, adaptados al rubro (WhatsApp, Instagram, Email, LinkedIn, seguimientos, objeciones "tercerizo" / "ya tengo" / precio). |
| **✦ Asesor IA** | Chat que prioriza prospectos, recomienda máquina, define precio/financiación y ejecuta acciones. |
| **▤ CRM** | Pipeline Kanban con prioridad, etiquetas, tareas, notas, historial, recordatorios, valor y probabilidad. |
| **⊚ Mapa · ↓ Exportar · ⚡ Integraciones** | Geolocalización, export a CSV/Excel/JSON/PDF/Sheets/Notion y arquitectura lista para Google Places / OpenAI. |

> ⚠️ La app **nunca envía mensajes sola**: genera el texto para copiar y pegar.

**Funciona sin configurar nada** en modo demo (dataset industrial nacional,
100% ficticio y marcado como tal). Con credenciales, los datos y la IA pasan a
ser **reales** sin tocar código.

---

## 🎯 Scoring y calidad del lead

**Score de potencial de compra (0–100)** — [`src/lib/scoring.ts`](src/lib/scoring.ts):

- **Ajuste del rubro** con la máquina (driver principal: `ideal` / `alto` / `medio` / `exploratorio`).
- **Tamaño / trayectoria** aparente (reseñas de Google como proxy de estructura).
- **Reputación** (rating).
- **Web propia** → señal **positiva** (empresa formal que invierte en equipamiento).
- **Facilidad de contacto** (WhatsApp > teléfono).
- **Redes activas** (Instagram / Facebook) y **verificación** en Google.

**Calidad (Alta / Media / Baja)** se deriva del score y las señales, y se
explica en cada ficha ("por qué es oportunidad").

---

## 🛠️ Stack

- **Frontend:** React 18 · Vite 5 · TypeScript · Tailwind CSS 3
- **Estado:** Zustand (persistencia en `localStorage`)
- **Routing:** React Router (HashRouter, compatible con GitHub Pages)
- **Gráficos:** Recharts · **Mapa:** Leaflet + markercluster + heat
- **PDF:** jsPDF · **Virtualización:** react-window
- **Backend/proxy:** Cloudflare Worker (guarda las API keys server-side)

---

## 💻 Instalación local

Requiere **Node.js 18+**.

```bash
npm install
npm run dev        # http://localhost:5173
```

Otros comandos: `npm run build` · `npm run preview` · `npm run lint` · `npm run typecheck`.

Copiá `.env.example` a `.env` para configurar credenciales y datos de 2GTech3D.

---

## 📍 Datos reales (Google Places) — arquitectura lista

En **modo demo** la app usa un dataset industrial ficticio (marcado como
`DEMO`). Para trabajar con **empresas reales** de Google Maps / Places:

1. En [Google Cloud Console](https://console.cloud.google.com/) creá un proyecto
   y activá **Places API (New)**. Generá una **API Key** restringida.
2. Desplegá el backend (`server/`, Cloudflare Worker) y cargá la key como secret
   — **nunca** en el frontend:
   ```bash
   cd server && npm install && npx wrangler login
   npx wrangler secret put GOOGLE_PLACES_API_KEY
   npx wrangler secret put OPENAI_API_KEY   # opcional (IA real)
   npm run deploy
   ```
3. En el frontend configurá:
   ```bash
   VITE_DATA_PROVIDER=google
   VITE_AI_PROVIDER=openai        # opcional
   VITE_API_BASE_URL=https://TU-WORKER.workers.dev
   ```

El `dataProvider` mapea los resultados de Places con `buildLead()`, así que el
scoring, la máquina recomendada y los mensajes funcionan igual con datos reales.
**Si falta una credencial, la app cae sola al modo demo — nunca se rompe.**

> **Búsquedas que ejecuta el backend** (adaptadas al catálogo): "metalúrgicas
> en Córdoba", "herrerías industriales", "cartelería y letras corpóreas",
> "marmolerías", "talleres de mecanizado", etc. (ver `SEARCH_PROMPTS`).

---

## 🔑 Variables de entorno

| Variable | Dónde | Para qué |
| -------- | ----- | -------- |
| `VITE_DATA_PROVIDER` | frontend | `mock` (demo) o `google` (real). |
| `VITE_AI_PROVIDER` | frontend | `mock` (local) o `openai` (real). |
| `VITE_API_BASE_URL` | frontend | URL del Worker backend. |
| `VITE_AGENCY_NAME` / `VITE_AGENCY_*` | frontend | Nombre y contacto de 2GTech3D en mensajes/propuestas. |
| `VITE_CURRENCY` / `VITE_DEFAULT_TICKET` | frontend | Moneda (ARS) y ticket base. |
| `VITE_BASE` | build | `/vigolo-lead-radar/` (Pages) o `/` (Vercel). |
| `GOOGLE_PLACES_API_KEY` | backend (secret) | Key de Google Places. |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | backend | IA real (default `gpt-4o-mini`). |
| `ALLOWED_ORIGIN` | backend | CORS (dominio del front o `*`). |

> Las keys reales van **solo** en el backend como secrets. Nunca en `VITE_*`.

---

## 📖 Cómo usar

- **Radar IA** → *Radar IA* → elegí rubro/reseñas y **Activar Radar IA**.
- **Prospección** → elegí provincia/ciudad/rubro (o **toda Argentina**), o tocá
  una **búsqueda sugerida**. Click en una tarjeta abre la ficha del lead.
- **Ficha del lead** (drawer):
  - *Resumen*: datos + **máquinas recomendadas** con ticket + contacto.
  - *Análisis IA*: **Analizar empresa** → máquina ideal, señales de
    oportunidad, indicadores y **Informe PDF**.
  - *Mensajes*: **Generar** → mensajes que venden la máquina + **Copiar**.
  - *CRM*: estado, prioridad, etiquetas, tareas, notas, recordatorios.
  - **✨ Crear propuesta**: one-pager de la máquina para enviar al cliente.
- **Campañas / CRM / Mapa / Dashboard / Asesor IA / Exportar** como de costumbre.

---

## 🏗️ Arquitectura

```
src/
├── config/
│   ├── machines.ts     # catálogo 2GTech3D + mapeo rubro→máquina + prompts
│   ├── argentina.ts    # geografía (24 provincias) + rubros industriales
│   └── app.ts          # branding, moneda (ARS), ticket
├── types/              # modelo de dominio (MachineFit, MachineMatch, Lead…)
├── lib/                # scoring (potencial de compra), competencia, labels
├── services/
│   ├── providers/      # dataProvider (mock | google) + dataset industrial
│   ├── ai/             # analista local (análisis + mensajes + asesor)
│   ├── audit/          # informe PDF de oportunidad
│   └── demo/           # generador de propuesta / one-pager
├── store/ · hooks/ · components/
└── features/           # dashboard, radar, prospecting, campaigns, leads,
                        # analysis, messages, crm, map, advisor, integrations
```

**Providers con adapters** — cambiar de `mock` a `google`/`openai` no toca la
UI, solo variables de entorno.

---

## ⚠️ Limitaciones y qué falta para datos 100% reales

- **Modo demo = datos ficticios.** El dataset nacional es generado y está
  marcado como `DEMO`; **no** representa empresas reales. Sirve para probar el
  flujo completo sin backend.
- **Google Maps / Places no se consulta directo desde el navegador** (la API
  key no puede exponerse). Ya está toda la arquitectura del proxy lista: falta
  desplegar el Worker (`server/`) y cargar `GOOGLE_PLACES_API_KEY` para tener
  empresas reales con teléfono, web, reseñas y ubicación.
- **La IA local es determinística** (sin costo). Con `OPENAI_API_KEY` en el
  backend, análisis y mensajes pasan a IA real.
- **Envío de mensajes manual** (copiar/pegar) para evitar bloqueos de WhatsApp /
  Instagram. La automatización asistida queda como próximo paso.
- **Validación de leads** se basa hoy en señales públicas (web activa, teléfono,
  redes, verificación, rubro). El scraping profundo de cada sitio/red queda para
  el backend.

---

<div align="center">

Herramienta de prospección para el equipo comercial de **2GTech3D**.

</div>
