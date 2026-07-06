import { AppShell } from '../../components/layout/AppShell'
import { Badge, Card } from '../../components/ui/primitives'
import { INTEGRATIONS, type IntegrationDef } from '../../config/integrations'

const CATEGORY_LABEL: Record<IntegrationDef['category'], string> = {
  datos: 'Fuentes de datos',
  ia: 'Inteligencia artificial',
  infra: 'Base de datos / Infraestructura',
  crm: 'CRM',
  mensajeria: 'Mensajería',
  productividad: 'Productividad',
}

const ICONS: Record<string, string> = {
  'google-places': '📍', 'google-maps': '🗺️', openai: '✦', 'google-sheets': '📊',
  hubspot: '🧲', notion: '📝', slack: '💬', discord: '🎮', whatsapp: '🟢',
  instagram: '📷', email: '✉️', calendar: '📅', supabase: '🟩', postgres: '🐘',
  firebase: '🔥',
}

export function IntegrationsPage() {
  const categories = Array.from(new Set(INTEGRATIONS.map((i) => i.category)))
  return (
    <AppShell title="Integraciones" subtitle="Conectá Lead Radar con tu stack (arquitectura lista)">
      <Card className="border-amber-400/20 bg-amber-500/5 p-4">
        <p className="text-sm text-amber-200/90">
          ⚠️ La arquitectura está preparada para todas estas integraciones. Los envíos automáticos
          (WhatsApp / Instagram / Email) se dejan manuales a propósito para evitar bloqueos. Las
          conexiones reales requieren un backend/proxy que guarde las API keys.
        </p>
      </Card>

      {categories.map((cat) => (
        <div key={cat} className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">{CATEGORY_LABEL[cat]}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.filter((i) => i.category === cat).map((i) => (
              <Card key={i.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-lg ring-1 ring-inset ring-white/10">
                    {ICONS[i.id] ?? '🔌'}
                  </div>
                  {i.connected ? (
                    <Badge className="bg-emerald-500/15 text-emerald-300 ring-emerald-400/30">Conectado</Badge>
                  ) : (
                    <Badge className="bg-slate-500/15 text-slate-400 ring-slate-400/30">Disponible</Badge>
                  )}
                </div>
                <p className="mt-3 font-semibold text-slate-100">{i.name}</p>
                <p className="mt-1 text-xs text-slate-400">{i.description}</p>
                <p className="mt-2 text-[11px] text-slate-600">{i.docsHint}</p>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </AppShell>
  )
}
