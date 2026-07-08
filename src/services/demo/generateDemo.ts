// =====================================================================
// Generador de PROPUESTA (one-pager): crea una ficha comercial lista para
// enviarle al lead, con la máquina 2GTech3D recomendada, por qué le sirve
// para su rubro y los beneficios. 100% client-side.
// =====================================================================

import { APP } from '../../config/app'
import { MACHINE_BY_ID, MACHINE_LINE_LABEL } from '../../config/machines'
import { formatCurrency } from '../../lib/format'
import type { Lead } from '../../types'

const PALETTES = [
  { a: '#3EA6FF', b: '#1f8fef' },
  { a: '#22d3ee', b: '#0891b2' },
  { a: '#34d399', b: '#059669' },
  { a: '#a78bfa', b: '#7c3aed' },
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const BENEFITS = [
  'Producción propia: dejás de tercerizar y de esperar a terceros.',
  'Menor costo por pieza y mayor margen en cada trabajo.',
  'Más precisión y mejor terminación, sin retrabajo.',
  'Garantía propia, puesta en marcha y asesoramiento técnico de 2GTech3D.',
]

export function generateDemoHtml(lead: Lead): string {
  const p = PALETTES[hash(lead.name) % PALETTES.length]
  const machine = lead.machines[0]
  const full = machine ? MACHINE_BY_ID[machine.machineId] : undefined
  const wa = APP.agency.whatsapp.replace(/[^\d]/g, '')
  const waText = encodeURIComponent(`Hola, soy de ${APP.agency.name}. Te paso info de la ${machine?.name ?? 'máquina'} para ${lead.name}.`)
  const waHref = `https://wa.me/${wa}?text=${waText}`
  const materials = full?.materials.join(' · ') ?? ''

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Propuesta 2GTech3D — ${lead.name}</title>
<style>
  :root { --a:${p.a}; --b:${p.b}; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',system-ui,sans-serif; color:#0f172a; background:#f1f5f9; }
  .hero { background:linear-gradient(135deg,#050816,var(--b)); color:#fff; padding:56px 24px; text-align:center; }
  .kicker { text-transform:uppercase; letter-spacing:2px; font-size:12px; opacity:.8; }
  .hero h1 { font-size:34px; margin:10px 0 6px; }
  .hero p { font-size:17px; opacity:.95; }
  .wrap { max-width:920px; margin:0 auto; padding:36px 24px; }
  .machine { background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:28px; box-shadow:0 20px 50px rgba(2,8,23,.08); margin-top:-40px; }
  .machine h2 { color:var(--b); font-size:24px; }
  .price { font-size:30px; font-weight:800; color:#050816; margin:10px 0; }
  .tag { display:inline-block; background:var(--a); color:#fff; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:700; }
  .grid { display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); margin-top:20px; }
  .card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:18px; }
  .card b { color:var(--b); }
  .why { background:#0b1220; color:#cbd5e1; border-radius:16px; padding:22px; margin-top:20px; }
  .why b { color:var(--a); }
  .cta { display:inline-block; margin-top:20px; background:#25D366; color:#fff; padding:14px 28px; border-radius:999px; font-weight:700; text-decoration:none; }
  ul { margin:10px 0 0 18px; } li { margin:6px 0; }
  footer { text-align:center; color:#64748b; font-size:13px; padding:28px; }
</style>
</head>
<body>
  <header class="hero">
    <div class="kicker">Propuesta de equipamiento · 2GTech3D</div>
    <h1>${lead.name}</h1>
    <p>${lead.category} · ${lead.city}, ${lead.province}</p>
  </header>

  <div class="wrap">
    <section class="machine">
      <span class="tag">${machine ? MACHINE_LINE_LABEL[machine.line] : 'Máquina recomendada'}</span>
      <h2>${machine?.name ?? 'Máquina láser / CNC'}</h2>
      <div class="price">${machine ? formatCurrency(machine.ticketArs) : 'Consultar'}</div>
      <p>${full?.useFor ?? ''}</p>
      ${materials ? `<div class="grid"><div class="card"><b>Materiales</b><br/>${materials}</div><div class="card"><b>Aplicación en ${lead.category}</b><br/>${machine?.reason ?? ''}</div></div>` : ''}

      <div class="why">
        <b>¿Por qué le conviene a ${lead.name}?</b>
        <ul>${BENEFITS.map((b) => `<li>${b}</li>`).join('')}</ul>
      </div>

      <a class="cta" href="${waHref}">Pedir cotización por WhatsApp</a>
    </section>
  </div>

  <footer>
    ${APP.agency.name} · ${APP.agency.address}<br/>
    ${APP.agency.phone} · ${APP.agency.email} · ${APP.agency.site}<br/>
    <span style="opacity:.7">Documento generado con 2GTech3D Lead Radar</span>
  </footer>
</body>
</html>`
}

/** Abre la propuesta en una pestaña nueva. */
export function openDemo(html: string): void {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
