/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        ink: '#0F172A',
        /* app shell — same cool palette as the marketing bands:
           night sidebar, light-band content, teal accent */
        paper: {
          DEFAULT: '#F4F6F9',
          raised: '#FFFFFF',
          sunken: '#EDF1F6',
        },
        line: {
          DEFAULT: '#E1E7EF',
          soft: '#EDF1F6',
        },
        accent: {
          DEFAULT: '#0D9488',
          soft: '#E6F5F3',
          deep: '#0F766E',
        },
        graphite: {
          DEFAULT: '#0F172A',
          soft: '#5B6779',
          faint: '#94A3B8',
        },
        /* flat, deep ground — no gradients, glass does the lifting */
        night: {
          950: '#07090D',
          900: '#0B0E14',
          800: '#12161F',
          700: '#1B212C',
        },
        teal: {
          DEFAULT: '#0D9488',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          600: '#0D9488',
          700: '#0F766E',
        },
      },
      fontFamily: {
        sans: ['"Creato Display"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'ui-serif', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        pop: '0 10px 30px -10px rgb(15 23 42 / 0.25)',
        lift: '0 30px 60px -20px rgb(0 0 0 / 0.7), 0 8px 24px -12px rgb(0 0 0 / 0.6)',
        glow: '0 0 0 1px rgb(255 255 255 / 0.06), 0 20px 60px -20px rgb(13 148 136 / 0.35)',
      },
    },
  },
  plugins: [],
}
