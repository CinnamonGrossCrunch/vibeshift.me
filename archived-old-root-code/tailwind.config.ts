// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}', 
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-urbanist)', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        urbanist: ['var(--font-urbanist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        '100': '100',
        '200': '200', 
        '300': '300',
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
        '900': '900',
      },
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
      gridTemplateColumns: {
        '9': 'repeat(9, minmax(0, 1fr))',
      },
      fontSize: {
        'xxs': ['10px', {
          lineHeight: '12px',
          letterSpacing: '0.01em',
        }],
      },
    },
  },
  plugins: [],
};
export default config;
