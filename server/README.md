# Vigolo Lead Radar — Backend / Proxy

Cloudflare Worker que protege las API keys de **Google Places** y **OpenAI**
del lado del servidor y resuelve CORS. El frontend lo consume vía
`VITE_API_BASE_URL`.

## Por qué existe

Google Places y OpenAI **no se pueden llamar desde el navegador**: expondría
las API keys (cualquiera las roba y gasta tu cuota) y CORS lo bloquea. Este
proxy guarda las keys como *secrets* y expone endpoints seguros.

## Endpoints

| Método | Ruta             | Descripción                                        |
| ------ | ---------------- | -------------------------------------------------- |
| GET    | `/health`        | Estado + qué keys están configuradas               |
| POST   | `/places/search` | Google Places (New) Text Search **con paginación** |
| GET    | `/places/photo`  | Proxy de fotos de Places (oculta la key)           |
| POST   | `/ai/analyze`    | Diagnóstico del negocio (OpenAI)                   |
| POST   | `/ai/message`    | Un mensaje de prospección                          |
| POST   | `/ai/messages`   | Set de mensajes                                    |
| POST   | `/ai/advisor`    | Asesor comercial                                   |

### `/places/search`

Recorre hasta `maxPages` (1–5, default 3) usando `nextPageToken` para traer el
máximo de resultados por búsqueda. Devuelve por negocio: nombre, dirección,
teléfono, sitio web (o vacío → *sin web*), rubro, horarios (`weekdayText`),
reseñas, rating, estado, coordenadas, **Place ID** y URLs de **fotos** (que
pasan por `/places/photo`, sin exponer la key). Incluye timeout y logs por
consola. Si una página falla pero ya hay resultados, devuelve lo acumulado.

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
`https://vigolo-lead-radar-api.TU-SUBDOMINIO.workers.dev`

## Conectar el frontend

En el frontend, configurá el `.env` (o las variables en Vercel/Pages). Con la
URL del backend alcanza — el **Modo Real** está activo por defecto:

```bash
VITE_API_BASE_URL=https://vigolo-lead-radar-api.TU-SUBDOMINIO.workers.dev
# opcionales: VITE_AI_PROVIDER=openai (para IA real)
```

Rebuild del frontend y listo: los datos (y la IA, si la configurás) pasan a ser
**reales**. Si falta alguna key o el backend no responde, el frontend cae
automáticamente a datos demo, así que la app **nunca se rompe** por credenciales
faltantes. El selector Modo Real/Demo de la barra superior permite forzar demo.

## Notas

- No se envían mensajes automáticamente: el proxy solo **genera** texto.
- Google Places no expone Instagram/Facebook; se puede enriquecer aparte.
- Costos: Places y OpenAI facturan por uso. Configurá límites en cada consola.
