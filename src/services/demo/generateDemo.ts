// =====================================================================
// Generador de DEMO: crea una landing profesional personalizada para un
// negocio, lista para mostrarle al cliente. 100% client-side.
// =====================================================================

import { APP } from '../../config/app'
import type { Lead } from '../../types'

const PALETTES = [
  { a: '#3EA6FF', b: '#1f8fef' },
  { a: '#34d399', b: '#059669' },
  { a: '#f472b6', b: '#db2777' },
  { a: '#fbbf24', b: '#d97706' },
  { a: '#a78bfa', b: '#7c3aed' },
  { a: '#22d3ee', b: '#0891b2' },
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const SERVICES: Record<string, string[]> = {
  default: ['Atención personalizada', 'Calidad garantizada', 'Turnos y consultas online'],
  barberia: ['Cortes clásicos y modernos', 'Arreglo de barba', 'Reservá tu turno online'],
  gimnasio: ['Musculación y funcional', 'Clases grupales', 'Planes personalizados'],
  restaurante: ['Menú del día', 'Reservas online', 'Delivery y take away'],
  estetica: ['Tratamientos faciales', 'Depilación', 'Reservá por WhatsApp'],
  inmobiliaria: ['Compra y venta', 'Alquileres', 'Tasaciones sin cargo'],
}

function servicesFor(category: string): string[] {
  const key = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const match = Object.keys(SERVICES).find((k) => k !== 'default' && key.includes(k))
  return SERVICES[match ?? 'default']
}

export function generateDemoHtml(lead: Lead): string {
  const p = PALETTES[hash(lead.name) % PALETTES.length]
  const services = servicesFor(lead.category)
  const wa = lead.signals.whatsapp?.replace(/[^\d]/g, '')
  const waHref = wa ? `https://wa.me/${wa}` : '#contacto'
  const initials = lead.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${lead.name} — ${lead.category} en ${lead.city}</title>
<style>
  :root { --a:${p.a}; --b:${p.b}; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',system-ui,sans-serif; color:#0f172a; background:#fff; }
  .hero { background:linear-gradient(135deg,var(--b),var(--a)); color:#fff; padding:80px 24px; text-align:center; }
  .logo { width:72px;height:72px;border-radius:20px;background:rgba(255,255,255,.2);display:grid;place-items:center;margin:0 auto 20px;font-weight:800;font-size:28px;backdrop-filter:blur(4px); }
  .hero h1 { font-size:44px; margin-bottom:12px; }
  .hero p { font-size:19px; opacity:.95; }
  .cta { display:inline-block;margin-top:28px;background:#fff;color:var(--b);padding:14px 30px;border-radius:999px;font-weight:700;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.2); }
  .wrap { max-width:1000px;margin:0 auto;padding:64px 24px; }
  .grid { display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); }
  .card { border:1px solid #e2e8f0;border-radius:16px;padding:28px;background:#f8fafc; }
  .card h3 { color:var(--b);margin-bottom:8px; }
  h2 { text-align:center;font-size:32px;margin-bottom:8px; }
  .sub { text-align:center;color:#64748b;margin-bottom:40px; }
  .stats { display:flex;gap:40px;justify-content:center;flex-wrap:wrap;margin-top:20px; }
  .stat b { font-size:34px;color:var(--a); }
  footer { background:#050816;color:#94a3b8;text-align:center;padding:40px 24px;font-size:14px; }
  footer a { color:var(--a);text-decoration:none; }
</style>
</head>
<body>
  <header class="hero">
    <div class="logo">${initials}</div>
    <h1>${lead.name}</h1>
    <p>${lead.category} en ${lead.city}${lead.province ? ', ' + lead.province : ''}</p>
    <a class="cta" href="${waHref}">Contactanos por WhatsApp</a>
    ${lead.signals.reviewsCount ? `<div class="stats"><div class="stat"><b>${lead.signals.rating?.toFixed(1) ?? '5.0'}★</b><div>Calificación</div></div><div class="stat"><b>${lead.signals.reviewsCount}+</b><div>Clientes felices</div></div></div>` : ''}
  </header>

  <section class="wrap">
    <h2>Lo que ofrecemos</h2>
    <p class="sub">Calidad y confianza para vos</p>
    <div class="grid">
      ${services.map((s) => `<div class="card"><h3>${s}</h3><p>Nos ocupamos de que tengas la mejor experiencia.</p></div>`).join('')}
    </div>
  </section>

  <section class="wrap" style="background:#f8fafc;border-radius:24px;text-align:center;">
    <h2>¿Listos para atenderte?</h2>
    <p class="sub">Escribinos y coordinamos hoy mismo.</p>
    <a class="cta" style="color:#fff;background:linear-gradient(135deg,var(--b),var(--a))" href="${waHref}" id="contacto">Escribir por WhatsApp</a>
  </section>

  <footer>
    ${lead.address ? lead.address + ' · ' : ''}${lead.signals.phone ?? ''}<br/>
    Demo generada por <a href="#">${APP.agency.name}</a> · Vigolo Lead Radar
  </footer>
</body>
</html>`
}

/** Abre la demo en una pestaña nueva. */
export function openDemo(html: string): void {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
