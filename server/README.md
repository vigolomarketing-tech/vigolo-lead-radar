# 2GTech3D Lead Radar — Backend / Proxy

Cloudflare Worker que protege las API keys de **Google Places** y **OpenAI**
del lado del servidor y resuelve CORS. El frontend lo consume vía
`VITE_API_BASE_URL`.

## Por qué existe

Google Places y OpenAI **no se pueden llamar desde el navegador**: expondría
las API keys (cualquiera las roba y gasta tu cuota) y CORS lo bloquea. Este
proxy guarda las keys como *secrets* y expone endpoints seguros.

## Endpoints

| Método | Ruta             | Descripción                          |
| ------ | ---------------- | ------------------------------------ |
| GET    | `/health`        | Estado + qué keys están configuradas |
| POST   | `/places/search` | Google Places (New) Text Search      |
| POST   | `/ai/analyze`    | Análisis de oportunidad de máquina     |
| POST   | `/ai/message`    | Un mensaje de prospección            |
| POST   | `/ai/messages`   | Set de mensajes                      |
| POST   | `/ai/advisor`    | Asesor comercial                     |

## Deploy (5 minutos)

Requiere una cuenta de Cloudflare (plan gratuito alcanza).

```bash
cd server
npm install
npx wrangler login

# Cargar las API keys como secrets (no quedan en el código):
npx wrangler secret put GOOGLE_PLACES_API_KEY
npx wrangler secret put OPENAI_API_KEY

# (opcional) restringir CORS a tu dominio del front:
#   editar ALLOWED_ORIGIN en wrangler.toml

npm run deploy
```

Al terminar, Wrangler imprime la URL del Worker, por ejemplo:
`https://2gtech3d-lead-radar-api.TU-SUBDOMINIO.workers.dev`

## Conectar el frontend

En el frontend, configurá el `.env` (o las variables en Vercel/Pages):

```bash
VITE_DATA_PROVIDER=google
VITE_AI_PROVIDER=openai
VITE_API_BASE_URL=https://2gtech3d-lead-radar-api.TU-SUBDOMINIO.workers.dev
```

Rebuild del frontend y listo: los datos y la IA pasan a ser **reales**.
Si falta alguna key, el frontend cae automáticamente al modo demo/local, así
que la app **nunca se rompe** por credenciales faltantes.

## Notas

- No se envían mensajes automáticamente: el proxy solo **genera** texto.
- Google Places no expone Instagram/Facebook; se puede enriquecer aparte.
- Costos: Places y OpenAI facturan por uso. Configurá límites en cada consola.
