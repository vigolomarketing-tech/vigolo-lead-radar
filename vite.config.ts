import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // base relativo: los assets se referencian con rutas relativas, asi la app
  // funciona tanto en Vercel (dominio raiz) como en GitHub Pages (subruta
  // tipo /vigolo-lead-radar/). No requiere tocar nada al deployar.
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
