# 2GTech3D Lead Radar - Backend / Proxy

Cloudflare Worker opcional que protege las API keys de Google Places y OpenAI. El frontend lo consume mediante `VITE_API_BASE_URL`.

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/health` | Estado y keys configuradas |
| POST | `/places/search` | Google Places Text Search para empresas industriales |
| POST | `/ai/analyze` | Diagnostico industrial de oportunidad |
| POST | `/ai/message` | Un mensaje comercial |
| POST | `/ai/messages` | Set de mensajes por canal |
| POST | `/ai/advisor` | Asesor comercial |

## Deploy

```bash
cd server
npm install
npx wrangler login
npx wrangler secret put GOOGLE_PLACES_API_KEY
npx wrangler secret put OPENAI_API_KEY
npm run deploy
```

Configurar el frontend:

```env
VITE_DATA_PROVIDER=google
VITE_AI_PROVIDER=openai
VITE_API_BASE_URL=https://2gtech3d-lead-radar-api.TU-SUBDOMINIO.workers.dev
```

## Notas

- El proxy no envia mensajes automaticamente; solo genera texto.
- Google Places no trae todas las senales industriales. El frontend aplica `buildLead` para recomendar maquina y scorear.
- Si falta alguna key, usar modo `mock`/`local` en el frontend.
