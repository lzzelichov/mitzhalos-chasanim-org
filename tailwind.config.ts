import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#fdf8f0',
        burgundy: '#7a1f3d',
        'burgundy-dark': '#5e1730',
        gold: '#c9a84c',
        'gold-soft': '#e3cd8a',
        cream: '#f5e6d3',
        charcoal: '#2d2013',
        // Back-compat aliases (older components reference these names)
        navy: '#2d2013',
        blush: '#f5e6d3',
      },
      fontFamily: {
        // Headings — Raleway (en); Suez One on [lang=he] via globals.css
        display: ['var(--font-heading-en)', 'sans-serif'],
        // Subheads / taglines render as body per the type system
        serif: ['var(--font-body)', 'serif'],
        // Body — Frank Ruhl Libre (both languages)
        sans: ['var(--font-body)', 'serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(201, 168, 76, 0.35)',
        'glow-lg': '0 0 40px rgba(201, 168, 76, 0.5)',
        lift: '0 16px 40px -12px rgba(122, 31, 61, 0.35)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #e3cd8a 0%, #c9a84c 100%)',
        'burgundy-gradient': 'linear-gradient(135deg, #7a1f3d 0%, #5e1730 100%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'glow-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.35))' },
          '50%': { filter: 'drop-shadow(0 0 26px rgba(201,168,76,0.7))' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
