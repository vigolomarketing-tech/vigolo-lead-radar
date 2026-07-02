# Vigolo Lead Radar

Herramienta interna de **Vigolo Web Studio** para hacer sondeos por zonas,
detectar negocios con oportunidad de venderles páginas web, organizar los
leads en un CRM simple y generar mensajes de prospección personalizados
para contactarlos **manualmente**.

> ⚠️ La app **nunca envía mensajes sola**. Solo genera el texto para copiar
> y pegar, así se evitan bloqueos en WhatsApp / Instagram.

---

## ✨ Funcionalidades

- **Buscador de negocios** por **zona** (Longchamps, Adrogué, Burzaco, Lomas
  de Zamora, CABA, …) y **rubro** (barberías, gimnasios, restaurantes, …).
  Con datos **mock/demo** realistas y estructura lista para conectar Google
  Places.
- **Análisis de oportunidad** por negocio: presencia digital
  (_Sin web / Web vieja / Web aceptable / Buen potencial_), **puntaje 1–100**
  y **motivo** del puntaje.
- **Generador de mensajes con IA** en 4 variantes:
  - WhatsApp (corto)
  - Instagram DM
  - Email (profesional)
  - Seguimiento (si no responden)
- **CRM simple** con estados _Nuevo → Contactado → Respondió → Interesado →
  Reunión → Cerrado → Descartado_, notas internas, fecha de último contacto
  y próximo seguimiento.
- **Dashboard** con estadísticas (total, oportunidades altas, contactados,
  interesados, cerrados).
- **Filtros** por rubro, zona, oportunidad y estado + **buscador por nombre**.
- **Exportar leads a CSV** (todos o los filtrados).
- **Vista detalle** de cada lead.
- Interfaz **oscura, moderna y responsive** (desktop + mobile) con azul
  eléctrico como color principal.
- Persistencia local (los leads y el CRM se guardan en el navegador vía
  `localStorage`).

---

## 🚀 Cómo correr el proyecto

Requisitos: **Node.js 18+** (probado con Node 22) y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el entorno de desarrollo
npm run dev
# -> abre http://localhost:5173

# 3. Build de producción
npm run build

# 4. Previsualizar el build
npm run preview
```

---

## 🔑 Variables de entorno

Copiá `.env.example` a `.env` y completá lo que necesites:

```bash
cp .env.example .env
```

| Variable                     | Para qué sirve                                            |
| ---------------------------- | -------------------------------------------------------- |
| `VITE_DATA_SOURCE`           | `mock` (demo) o `google` (Google Places, cuando esté).   |
| `VITE_GOOGLE_PLACES_API_KEY` | Key de Google Places para la búsqueda real de negocios.  |
| `VITE_OPENAI_API_KEY`        | Key de OpenAI para generar los mensajes con IA.          |
| `VITE_OPENAI_MODEL`          | Modelo de OpenAI (por defecto `gpt-4o-mini`).            |
| `VITE_AGENCY_NAME`           | Nombre de la agencia usado en los mensajes.              |
| `VITE_AGENCY_SIGNATURE`      | Firma que va al pie de los mensajes.                     |

> Sin ninguna key configurada, la app funciona 100% con **datos demo** y un
> **generador de mensajes local** (plantillas con tono argentino).

---

## ☁️ Deploy

La app es **100% estática** (build a `dist/`) y usa `base: './'` en
`vite.config.ts`, así que anda tanto en la raíz de un dominio (Vercel) como
en una subruta (GitHub Pages) sin cambios.

### Opción A — Vercel (recomendada)

1. Importá el repo en [vercel.com/new](https://vercel.com/new).
2. Vercel detecta Vite solo. Confirmá:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. (Opcional) Cargá las variables `VITE_*` en _Settings → Environment Variables_.
4. Deploy. Cada push a `main` redeploya automáticamente.

### Opción B — GitHub Pages (automático)

Ya viene un workflow en `.github/workflows/deploy.yml`:

1. En el repo: **Settings → Pages → Source = "GitHub Actions"**.
2. Cada push a `main` buildea y publica solo.
3. La app queda en `https://<usuario>.github.io/<repo>/`.

---

## 🧩 Estructura del proyecto

```
src/
├── types/                # Tipos centrales (Lead, CRM, filtros, etc.)
├── data/
│   └── mockLeads.ts      # Datos demo realistas (GBA sur + CABA)
├── lib/
│   ├── scoring.ts        # Motor de puntaje de oportunidad (1–100)
│   ├── labels.ts         # Etiquetas + estilos de los estados
│   ├── csv.ts            # Exportación a CSV
│   └── storage.ts        # Persistencia en localStorage
├── services/
│   ├── placesService.ts  # Búsqueda de negocios (mock / Google Places)
│   └── aiService.ts      # Generación de mensajes (local / OpenAI)
├── context/
│   └── LeadsContext.tsx  # Estado global (leads, filtros, CRM, búsqueda)
├── components/
│   ├── layout/           # Sidebar, Topbar
│   ├── dashboard/        # StatsBar (estadísticas)
│   ├── search/           # SearchPanel (buscador por zona + rubro)
│   ├── leads/            # LeadCard, LeadList, LeadFilters, LeadDetail, …
│   ├── messages/         # MessageGenerator (4 variantes)
│   └── ui/               # Button, Badge, Modal, CopyButton
├── App.tsx
└── main.tsx
```

---

## 🎯 Cómo se calcula el puntaje de oportunidad

Ver `src/lib/scoring.ts`. Un puntaje más alto = mejor oportunidad comercial:

- **Sin página web** → oportunidad alta.
- **Web vieja / poco profesional** → oportunidad alta.
- **Instagram activo pero sin web** → oportunidad alta.
- **Google Business con muchas reseñas pero sin web** → oportunidad alta.
- **Rubros donde una web genera consultas por WhatsApp** → suman prioridad.

Niveles: **alta** (≥ 70), **media** (45–69), **baja** (< 45).

---

## 🔌 Conectar las APIs reales (próximos pasos)

Todo está preparado para enchufar las integraciones sin reescribir la app.
Buscá los comentarios `TODO(API real)` en el código:

- **Google Places API** → `src/services/placesService.ts`
  Implementar `searchGoogle()` (Text Search + Place Details) y mapear cada
  resultado con `buildLead()` para reutilizar el scoring. Poner
  `VITE_DATA_SOURCE=google`.
- **OpenAI API** → `src/services/aiService.ts`
  Implementar la llamada a `chat/completions` usando `buildAiPrompt()`.
  Recomendado: llamarla desde un backend propio para no exponer la key.
- **Base de datos / Google Sheets** → `src/lib/storage.ts`
  Reemplazar `loadLeads()` / `saveLeads()` por llamadas al backend.
- **WhatsApp** → siempre **manual** (copiar y pegar). No automatizar el envío.
- **Exportación CSV** → ya funciona (`src/lib/csv.ts`).

---

## 🛠️ Stack

- **React 18** + **Vite 5** + **TypeScript**
- **Tailwind CSS 3**
- Estado con **Context + useReducer**
- Persistencia en **localStorage**

---

Hecho para uso interno de **Vigolo Web Studio**.
