import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020817',
          900: '#0a1628',
          800: '#0f2040',
          700: '#162d5a',
          600: '#1e3f7d',
        },
        electric: {
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Syne Variable', 'Syne', 'sans-serif'],
      },
      backgroundImage: {
        'electric-gradient': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'electric-gradient-hover': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        'navy-gradient': 'linear-gradient(180deg, #020817 0%, #0a1628 100%)',
        'glow-radial': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.25) 0%, transparent 60%)',
        'card-gradient': 'linear-gradient(135deg, rgba(15,32,64,0.8) 0%, rgba(10,22,40,0.9) 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 1s infinite',
        'slide-in-right': 'slideInRight 0.5s ease-out both',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59,130,246,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59,130,246,0.6), 0 0 60px rgba(139,92,246,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59,130,246,0.4)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.4)',
        'glow-blue-lg': '0 0 40px rgba(59,130,246,0.5)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
} satisfies Config
