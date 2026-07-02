import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-base-950 text-slate-200">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6 animate-fade-in">
          {children}
        </main>
        <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-slate-600">
          Vigolo Lead Radar · Plataforma interna de Vigolo Web Studio
        </footer>
      </div>
    </div>
  )
}
