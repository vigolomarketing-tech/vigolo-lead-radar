import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
//
// base:
//  - GitHub Pages sirve el sitio en una subruta (/vigolo-lead-radar/), por eso
//    el build de Pages usa ese base. El workflow lo setea con VITE_BASE.
//  - En Vercel / dominio raiz, base = '/' (default).
//  Nota: el base absoluto ('/vigolo-lead-radar/') es mas robusto que './' en
//  GitHub Pages (evita problemas de rutas y de subpaths).
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Vendors separados para mejor cache entre deploys.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
})
