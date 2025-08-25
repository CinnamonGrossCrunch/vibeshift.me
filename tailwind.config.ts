// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          900: '#0B1220',
          800: '#0F1A2A',
          700: '#132033',
          // accents
          lime: '#C8FF5A',
          yellow: '#FFE66B',
          mint: '#9CF6F6',
          grape: '#C9A0FF',
        },
        berkeley: {
          // Official UC Berkeley brand colors
          blue: '#003262',      // Berkeley Blue (primary)
          gold: '#FDB515',      // California Gold (primary)
          'blue-light': '#3B7EA1', // Lighter blue variant
          'blue-dark': '#002244',   // Darker blue variant
          'gold-light': '#FFD34E', // Lighter gold variant
          'gold-dark': '#D4941E',  // Darker gold variant
        },
        soft: {
          gold: '#F4E5A3',
          blue: '#B3D4F7',
          teal: '#A3D9D0',
          pink: '#F7C3D3',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        glass: '0 8px 24px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
export default config;
