/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff8ff', 100: '#dbeffe', 200: '#bfe3fd', 300: '#93d1fb',
          400: '#60b5f8', 500: '#3b97f3', 600: '#2579e8', 700: '#1c63d4',
          800: '#1e50ac', 900: '#1e4588', 950: '#172c54',
        },
        emerald: {
          450: '#22c577',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Syne"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59,151,243,0.15)',
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md': '0 4px 16px 0 rgba(0,0,0,0.08)',
        'modal': '0 20px 60px rgba(0,0,0,0.2)',
      },
      animation: {
        'slide-up': 'slideUp 0.22s ease-out',
        'fade-in': 'fadeIn 0.18s ease-out',
        'scale-in': 'scaleIn 0.18s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'toast-in': 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        slideUp:   { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn:   { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        toastIn:   { from: { opacity: 0, transform: 'translateX(120%)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
      spacing: { sidebar: '256px', header: '60px' },
    },
  },
  plugins: [],
};
