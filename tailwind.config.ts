import type { Config } from 'tailwindcss'

const config = {
  darkMode: ["class"],
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        secondary: '#1A1A1A',
        accent: '#F5B942',
        'accent-dark': '#E6A430',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      backgroundColor: {
        dark: '#0A0A0A',
        'dark-secondary': '#1A1A1A',
        'dark-tertiary': '#2D2D2D',
      },
      borderColor: {
        gold: '#F5B942',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 20px rgba(245, 185, 66, 0.5)' },
          '50%': { textShadow: '0 0 30px rgba(245, 185, 66, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 185, 66, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(245, 185, 66, 0)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
