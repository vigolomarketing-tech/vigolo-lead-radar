import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
//
// base:
//  - GitHub Pages puede servir el sitio en una subruta, por eso
//    el build de Pages usa ese base. El workflow lo setea con VITE_BASE.
//  - En Vercel / dominio raiz, base = '/' (default).
//  Nota: el base absoluto configurado por VITE_BASE es mas robusto que './' en
//  GitHub Pages (evita problemas de rutas y de subpaths).
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['radar.svg', 'icons/apple-touch-icon.png', 'icons/apple-splash-1170-2532.png', 'icons/apple-splash-1284-2778.png'],
      manifest: {
        name: '2GTech3D Lead Radar',
        short_name: '2G Radar',
        description: 'Prospeccion comercial industrial para detectar compradores de maquinas CNC y laser 2GTech3D.',
        lang: 'es-AR',
        theme_color: '#3EA6FF',
        background_color: '#050816',
        display: 'standalone',
        orientation: 'portrait',
        // Relativos: funcionan tanto en subruta (GitHub Pages) como en raíz.
        start_url: '.',
        scope: '.',
        categories: ['business', 'productivity'],
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        // Permite precachear los chunks grandes (jspdf, charts, leaflet).
        maximumFileSizeToCacheInBytes: 4_000_000,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/, /\/assets\//],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
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
