/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta 2GTech3D Lead Radar
        base: {
          950: '#050816', // fondo principal
          900: '#0a0f24',
          850: '#0e1430',
          800: '#131a3a',
          700: '#1b2450',
        },
        electric: {
          DEFAULT: '#3EA6FF', // azul electrico principal
          50: '#eaf5ff',
          100: '#d4ebff',
          200: '#a9d7ff',
          300: '#7ec3ff',
          400: '#3EA6FF',
          500: '#1f8fef',
          600: '#0f72c9',
          700: '#0b579b',
        },
        opp: {
          high: '#22c55e', // oportunidad alta (verde)
          mid: '#facc15', // oportunidad media (amarillo)
          low: '#94a3b8', // oportunidad baja (gris)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(62,166,255,0.15), 0 12px 40px -12px rgba(62,166,255,0.35)',
        card: '0 8px 30px -12px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.25s cubic-bezier(0.16,1,0.3,1)',
        radar: 'radar 4s linear infinite',
      },
    },
  },
  plugins: [],
}
