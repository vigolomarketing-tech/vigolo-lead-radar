import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.heat'
import { AppShell } from '../../components/layout/AppShell'
import { Card, EmptyState, Select } from '../../components/ui/primitives'
import { useLeadStore } from '../../store/useLeadStore'
import { useProvinces } from '../../hooks/useFilteredLeads'
import { levelFromScore } from '../../lib/scoring'
import { OPPORTUNITY_HEX, OPPORTUNITY_LABEL } from '../../lib/labels'
import { cn } from '../../utils/cn'
import type { Lead } from '../../types'

type Mode = 'clusters' | 'heatmap'

function dotIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};box-shadow:0 0 0 4px ${color}33;border:2px solid #050816"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

/** Capa de clusters (leaflet.markercluster). */
function ClusterLayer({ leads, onSelect }: { leads: Lead[]; onSelect: (id: string) => void }) {
  const map = useMap()
  useEffect(() => {
    const group = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50 })
    for (const l of leads) {
      if (!l.location) continue
      const color = OPPORTUNITY_HEX[levelFromScore(l.score)]
      const m = L.marker([l.location.lat, l.location.lng], { icon: dotIcon(color) })
      m.bindPopup(
        `<strong>${l.name}</strong><br/><span style="color:#94a3b8">${l.category} · ${l.city}, ${l.province}</span><br/><span style="color:#94a3b8">Score ${l.score} · ${l.signals.reviewsCount ?? 0} reseñas</span><br/><button id="lead-${l.id}" style="margin-top:6px;background:#3EA6FF;color:#fff;border:0;border-radius:8px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer">Ver detalle</button>`,
      )
      m.on('popupopen', () => {
        const btn = document.getElementById(`lead-${l.id}`)
        btn?.addEventListener('click', () => onSelect(l.id))
      })
      group.addLayer(m)
    }
    map.addLayer(group)
    return () => {
      map.removeLayer(group)
    }
  }, [leads, map, onSelect])
  return null
}

/** Capa de mapa de calor (leaflet.heat). */
function HeatLayer({ leads }: { leads: Lead[] }) {
  const map = useMap()
  useEffect(() => {
    const points = leads
      .filter((l) => l.location)
      .map((l) => [l.location!.lat, l.location!.lng, l.score / 100] as [number, number, number])
    const layer = L.heatLayer(points, {
      radius: 26,
      blur: 20,
      maxZoom: 12,
      gradient: { 0.3: '#94a3b8', 0.6: '#fbbf24', 0.85: '#34d399' },
    })
    map.addLayer(layer)
    return () => {
      map.removeLayer(layer)
    }
  }, [leads, map])
  return null
}

export function MapPage() {
  const allLeads = useLeadStore((s) => s.leads)
  const select = useLeadStore((s) => s.select)
  const provinces = useProvinces()
  const [mode, setMode] = useState<Mode>('clusters')
  const [province, setProvince] = useState('')

  const leads = useMemo(
    () => allLeads.filter((l) => l.location && (!province || l.province === province)),
    [allLeads, province],
  )

  const center: [number, number] = useMemo(() => {
    if (!leads.length) return [-38.4, -63.6] // centro de Argentina
    return [
      leads.reduce((s, l) => s + l.location!.lat, 0) / leads.length,
      leads.reduce((s, l) => s + l.location!.lng, 0) / leads.length,
    ]
  }, [leads])

  return (
    <AppShell title="Mapa" subtitle="Oportunidades geolocalizadas en toda Argentina">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          {(['alta', 'media', 'baja'] as const).map((lvl) => (
            <span key={lvl} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ background: OPPORTUNITY_HEX[lvl] }} />
              {OPPORTUNITY_LABEL[lvl]}
            </span>
          ))}
          <span className="text-slate-500">{leads.length} negocios</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={province} onChange={(e) => setProvince(e.target.value)} className="w-44">
            <option value="">Toda Argentina</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <div className="flex gap-1 rounded-xl bg-white/5 p-1">
            {(['clusters', 'heatmap'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  mode === m ? 'bg-electric-500 text-white' : 'text-slate-300 hover:text-white',
                )}
              >
                {m === 'clusters' ? 'Clusters' : 'Mapa de calor'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <EmptyState title="Sin ubicaciones" subtitle="Hacé un sondeo para ver negocios en el mapa." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="h-[70vh]">
            <MapContainer center={center} zoom={province ? 10 : 4} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution="&copy; OpenStreetMap, &copy; CARTO"
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {mode === 'clusters' ? (
                <ClusterLayer leads={leads} onSelect={select} />
              ) : (
                <HeatLayer leads={leads} />
              )}
            </MapContainer>
          </div>
        </Card>
      )}
    </AppShell>
  )
}
