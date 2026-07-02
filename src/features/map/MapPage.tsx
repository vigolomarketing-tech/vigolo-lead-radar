import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { AppShell } from '../../components/layout/AppShell'
import { EmptyState } from '../../components/ui/primitives'
import { useLeadStore } from '../../store/useLeadStore'
import { levelFromScore } from '../../lib/scoring'
import { OPPORTUNITY_HEX, OPPORTUNITY_LABEL } from '../../lib/labels'
import type { Lead } from '../../types'

function markerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};box-shadow:0 0 0 4px ${color}33,0 2px 6px rgba(0,0,0,.6);border:2px solid #050816"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

export function MapPage() {
  const leads = useLeadStore((s) => s.leads).filter((l) => l.location)
  const select = useLeadStore((s) => s.select)

  const center: [number, number] = leads.length
    ? [
        leads.reduce((s, l) => s + l.location!.lat, 0) / leads.length,
        leads.reduce((s, l) => s + l.location!.lng, 0) / leads.length,
      ]
    : [-34.79, -58.4]

  return (
    <AppShell title="Mapa" subtitle="Oportunidades geolocalizadas">
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
        {(['alta', 'media', 'baja'] as const).map((lvl) => (
          <span key={lvl} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ background: OPPORTUNITY_HEX[lvl] }} />
            {OPPORTUNITY_LABEL[lvl]}
          </span>
        ))}
      </div>

      {leads.length === 0 ? (
        <EmptyState title="Sin ubicaciones" subtitle="Los negocios encontrados aparecerán acá en el mapa." />
      ) : (
        <div className="h-[70vh] overflow-hidden rounded-2xl border border-white/10">
          <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {leads.map((l) => (
              <Marker
                key={l.id}
                position={[l.location!.lat, l.location!.lng]}
                icon={markerIcon(OPPORTUNITY_HEX[levelFromScore(l.score)])}
              >
                <Popup>
                  <MapPopup lead={l} onOpen={() => select(l.id)} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </AppShell>
  )
}

function MapPopup({ lead, onOpen }: { lead: Lead; onOpen: () => void }) {
  return (
    <div style={{ minWidth: 180 }}>
      <strong style={{ color: '#e2e8f0' }}>{lead.name}</strong>
      <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
        {lead.category} · {lead.zone}
      </div>
      <div style={{ color: '#94a3b8', fontSize: 12 }}>
        Score {lead.score} · {lead.signals.reviewsCount ?? 0} reseñas
      </div>
      <button
        onClick={onOpen}
        style={{
          marginTop: 8,
          background: '#3EA6FF',
          color: '#fff',
          border: 0,
          borderRadius: 8,
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Ver detalle
      </button>
    </div>
  )
}
