import { LeadsProvider } from './context/LeadsContext'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { StatsBar } from './components/dashboard/StatsBar'
import { SearchPanel } from './components/search/SearchPanel'
import { LeadFilters } from './components/leads/LeadFilters'
import { LeadList } from './components/leads/LeadList'
import { LeadDetail } from './components/leads/LeadDetail'

export default function App() {
  return (
    <LeadsProvider>
      <div className="flex min-h-screen bg-base-950 text-slate-200">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 p-4 sm:p-6">
            <StatsBar />
            <SearchPanel />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-100">
                  Leads detectados
                </h2>
              </div>
              <LeadFilters />
              <LeadList />
            </div>
          </main>

          <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-slate-600">
            Vigolo Lead Radar &middot; Herramienta interna de Vigolo Web Studio
          </footer>
        </div>

        <LeadDetail />
      </div>
    </LeadsProvider>
  )
}
