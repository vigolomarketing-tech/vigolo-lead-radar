import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ProspectingPage } from './features/prospecting/ProspectingPage'
import { RadarPage } from './features/radar/RadarPage'
import { CampaignsPage } from './features/campaigns/CampaignsPage'
import { CrmBoardPage } from './features/crm/CrmBoardPage'
import { AdvisorPage } from './features/advisor/AdvisorPage'
import { IntegrationsPage } from './features/integrations/IntegrationsPage'
import { LeadDrawer } from './features/leads/LeadDrawer'
import { Spinner } from './components/ui/primitives'

// El mapa (leaflet) se carga bajo demanda para aligerar el bundle inicial.
const MapPage = lazy(() =>
  import('./features/map/MapPage').then((m) => ({ default: m.MapPage })),
)

function PageFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-base-950">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/radar" element={<RadarPage />} />
        <Route path="/prospeccion" element={<ProspectingPage />} />
        <Route path="/campanas" element={<CampaignsPage />} />
        <Route
          path="/mapa"
          element={
            <Suspense fallback={<PageFallback />}>
              <MapPage />
            </Suspense>
          }
        />
        <Route path="/crm" element={<CrmBoardPage />} />
        <Route path="/asesor" element={<AdvisorPage />} />
        <Route path="/integraciones" element={<IntegrationsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Drawer global disponible en todas las vistas */}
      <LeadDrawer />
    </HashRouter>
  )
}
