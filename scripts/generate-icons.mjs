// Genera los íconos PWA (PNG) a partir de un SVG premium (radar dark mode).
// Uso: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, '../public/icons')
mkdirSync(out, { recursive: true })

const NAVY = '#050816'
const BLUE = '#3EA6FF'
const GREEN = '#22c55e'

/** Logo del radar centrado, sobre fondo full-bleed (apto maskable). */
function svg(size, { bg = true, pad = 0.24 } = {}) {
  const c = size / 2
  const r = (size / 2) * (1 - pad) // radio del anillo exterior (safe area)
  const ring = (rr, op, w) =>
    `<circle cx="${c}" cy="${c}" r="${rr}" fill="none" stroke="${BLUE}" stroke-width="${w}" opacity="${op}"/>`
  // sector de barrido
  const a0 = -Math.PI / 2
  const a1 = a0 + Math.PI / 3
  const sweep = `M ${c} ${c} L ${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)} Z`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg ? `<rect width="${size}" height="${size}" fill="${NAVY}"/>` : ''}
  <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.18"/>
    <stop offset="100%" stop-color="${BLUE}" stop-opacity="0"/>
  </radialGradient></defs>
  <circle cx="${c}" cy="${c}" r="${r}" fill="url(#g)"/>
  ${ring(r, 0.35, size * 0.012)}
  ${ring(r * 0.66, 0.5, size * 0.012)}
  ${ring(r * 0.33, 0.7, size * 0.012)}
  <path d="${sweep}" fill="${BLUE}" opacity="0.28"/>
  <line x1="${c}" y1="${c}" x2="${c}" y2="${c - r}" stroke="${BLUE}" stroke-width="${size * 0.014}" stroke-linecap="round"/>
  <circle cx="${c}" cy="${c}" r="${size * 0.05}" fill="${BLUE}"/>
  <circle cx="${c + r * 0.55}" cy="${c - r * 0.45}" r="${size * 0.045}" fill="${GREEN}"/>
</svg>`
}

async function png(size, opts, name) {
  await sharp(Buffer.from(svg(size, opts))).png().toFile(resolve(out, name))
  console.log('  ✓', name)
}

console.log('Generando íconos PWA…')
await png(192, { pad: 0.18 }, 'pwa-192.png')
await png(512, { pad: 0.18 }, 'pwa-512.png')
await png(512, { pad: 0.26 }, 'maskable-512.png') // safe area amplia para maskable
await png(180, { pad: 0.12 }, 'apple-touch-icon.png') // iOS
// Splash simple iOS (retrato)
async function splash(w, h, name) {
  const s = Math.min(w, h) * 0.42
  const logo = svg(Math.round(s), { bg: false, pad: 0.18 })
  const base = sharp({ create: { width: w, height: h, channels: 4, background: NAVY } })
  const buf = await sharp(Buffer.from(logo)).png().toBuffer()
  await base.composite([{ input: buf, gravity: 'center' }]).png().toFile(resolve(out, name))
  console.log('  ✓', name)
}
await splash(1170, 2532, 'apple-splash-1170-2532.png') // iPhone 12/13/14
await splash(1284, 2778, 'apple-splash-1284-2778.png') // iPhone Pro Max
console.log('Listo.')
