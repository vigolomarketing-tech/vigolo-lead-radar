// =====================================================================
// Generador de ficha tecnico-comercial para una oportunidad industrial.
// Mantiene el flujo "demo" del sistema original, pero ahora produce una
// propuesta HTML centrada en la maquina 2GTech3D recomendada.
// =====================================================================

import { APP } from '../../config/app'
import { MACHINE_BY_ID } from '../../config/machines'
import type { Lead } from '../../types'

export function generateDemoHtml(lead: Lead): string {
  const machine = MACHINE_BY_ID[lead.recommendedMachineId]
  const wa = lead.signals.whatsapp?.replace(/[^\d]/g, '')
  const waHref = wa ? `https://wa.me/${wa}` : '#contacto'

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${lead.name} - ${machine.name}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Inter,Segoe UI,system-ui,sans-serif; color:#0f172a; background:#f8fafc; }
  header { background:#050816; color:white; padding:64px 24px; }
  .wrap { max-width:1060px; margin:0 auto; }
  .eyebrow { color:#3EA6FF; font-weight:800; letter-spacing:.08em; text-transform:uppercase; font-size:12px; }
  h1 { margin-top:12px; font-size:42px; line-height:1.05; max-width:850px; }
  .lead { margin-top:16px; color:#cbd5e1; font-size:18px; max-width:760px; }
  .cta { display:inline-block; margin-top:28px; background:#3EA6FF; color:white; padding:13px 24px; border-radius:10px; font-weight:800; text-decoration:none; }
  main { padding:40px 24px; }
  .grid { display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); }
  .card { background:white; border:1px solid #e2e8f0; border-radius:12px; padding:20px; box-shadow:0 10px 30px rgba(15,23,42,.06); }
  .card h2 { font-size:15px; color:#334155; margin-bottom:10px; }
  .value { color:#0f172a; font-size:22px; font-weight:900; }
  ul { margin-left:18px; color:#334155; line-height:1.7; }
  .section { margin-top:22px; }
  footer { color:#64748b; text-align:center; padding:28px; font-size:13px; }
</style>
</head>
<body>
  <header>
    <div class="wrap">
      <div class="eyebrow">${APP.name}</div>
      <h1>${machine.name} para ${lead.name}</h1>
      <p class="lead">${lead.category} en ${lead.city}, ${lead.province}. Oportunidad ${lead.scoreLevel} con score ${lead.score}/100 y ticket probable ${lead.ticketRange}.</p>
      <a class="cta" href="${waHref}">Iniciar contacto tecnico</a>
    </div>
  </header>
  <main class="wrap">
    <div class="grid">
      <div class="card"><h2>Maquina recomendada</h2><div class="value">${machine.category}</div><p>${machine.name}</p></div>
      <div class="card"><h2>Valor potencial</h2><div class="value">${lead.ticketRange}</div><p>${lead.closeProbability}% probabilidad inicial</p></div>
      <div class="card"><h2>Perfil industrial</h2><div class="value">${lead.companySize}</div><p>${lead.industrialMaturity}</p></div>
      <div class="card"><h2>Materiales</h2><p>${machine.materials.join(', ')}</p></div>
    </div>

    <div class="grid section">
      <div class="card">
        <h2>Aplicaciones relevantes</h2>
        <ul>${machine.applications.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <h2>Beneficios comerciales</h2>
        <ul>${machine.benefits.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <h2>Preguntas de calificacion</h2>
        <ul>
          <li>Que materiales y espesores trabajan?</li>
          <li>Que proceso tercerizan hoy?</li>
          <li>Volumen mensual aproximado?</li>
          <li>Espacio, energia y operador disponible?</li>
          <li>Buscan compra directa o financiacion?</li>
        </ul>
      </div>
    </div>
  </main>
  <footer>
    Ficha generada por ${APP.agency.name} para uso comercial interno. Fuente de catalogo: 2GTech3D.
  </footer>
</body>
</html>`
}

export function openDemo(html: string): void {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
