# 2GTech3D Lead Radar

Herramienta comercial basada en la arquitectura original de Vigolo Lead Radar, transformada para detectar empresas argentinas con probabilidad de comprar maquinas de 2GTech3D.

La app ayuda a prospectar metalurgicas, carpinterias, cartelerias, autopartistas, matricerias, fabricas, constructoras, escuelas tecnicas, universidades tecnicas y talleres industriales. El objetivo no es vender sitios web: el sistema recomienda la maquina correcta, estima ticket, explica el motivo comercial y prepara mensajes de contacto.

## Funcionalidades

| Modulo | Uso |
| --- | --- |
| Dashboard | Oportunidades, valor potencial, maquina mas recomendada, industrias, provincias, ciudades y nivel de oportunidad. |
| Radar IA | Barrido nacional por rubro, maquina, score minimo y resenas. |
| Prospeccion | Busqueda por provincia, ciudad, zona, industria, maquina recomendada, score y senales de contacto. |
| Catalogo | `src/config/machines.ts` contiene maquinas 2GTech3D, aplicaciones, materiales, industrias objetivo, beneficios, prioridad y keywords. |
| Scoring | Score 0-100 por rubro, tamano de empresa, madurez industrial, maquinaria probable, materiales, ubicacion, ticket y contacto. |
| IA | Diagnostico industrial, mensajes para WhatsApp, Email, LinkedIn e Instagram, objeciones y asesor comercial. |
| CRM | Pipeline B2B con relevamiento, cotizacion, tareas, notas, recordatorios, probabilidad y valor potencial. |
| Exportadores | CSV, JSON, Excel, Notion y PDF con industria, maquina, ticket y score. |
| PDF | Informe de oportunidad industrial con recomendacion de maquina y proximo paso comercial. |
| Ficha | Genera una ficha tecnico-comercial HTML para el lead y la maquina recomendada. |

## Modo demo

El provider `mock` usa datos ficticios marcados como `Demo ... (ficticia)`. Sirve para probar la aplicacion sin inventar empresas reales.

Para datos reales, usar `VITE_DATA_PROVIDER=google` y conectar un backend/proxy con Google Places. El frontend vuelve a pasar cada resultado por `buildLead`, por lo que scoring, recomendacion de maquina y filtros se mantienen iguales.

## Maquinas cubiertas

El catalogo inicial incluye:

- Cortadora Laser Fibra CNC 3015 3kW
- Grabadoras/Cortadoras Laser CO2 150W, 130W, 100W y 50W
- Grabadoras Laser Fibra 60W y 30W
- Vibrador de hormigon 3HP
- Andamio colgante electrico 1000 kg

Cada maquina define aplicaciones, materiales, industrias objetivo, beneficios, prioridad comercial y palabras clave para recomendacion automatica.

## Desarrollo

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

Variables principales:

```env
VITE_DATA_PROVIDER=mock
VITE_AI_PROVIDER=mock
VITE_API_BASE_URL=
VITE_AGENCY_NAME=2GTech3D
VITE_AGENCY_SIGNATURE=Equipo comercial - 2GTech3D
VITE_CURRENCY=ARS
VITE_DEFAULT_TICKET=12000000
```

## Backend

`server/src/worker.js` es un Cloudflare Worker opcional que protege API keys y expone:

- `POST /places/search`
- `POST /ai/analyze`
- `POST /ai/message`
- `POST /ai/messages`
- `POST /ai/advisor`
- `GET /health`

Secrets requeridos si se usa modo real:

```bash
wrangler secret put GOOGLE_PLACES_API_KEY
wrangler secret put OPENAI_API_KEY
```

## Arquitectura relevante

```text
src/
  config/
    app.ts
    argentina.ts
    machines.ts
  lib/
    scoring.ts
    commandParser.ts
    competition.ts
    followups.ts
  services/
    leadFactory.ts
    providers/
    ai/
    audit/
    demo/
  features/
    dashboard/
    radar/
    prospecting/
    campaigns/
    crm/
    analysis/
    advisor/
```

## Reglas de datos

- No se deben presentar datos demo como empresas reales.
- Si Google Places u otra API no esta disponible, la app debe caer a modo DEMO/local.
- La IA no debe prometer precios cerrados sin validar materiales, volumen, energia, espacio y financiacion.
