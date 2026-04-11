/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['Outfit', 'system-ui', 'sans-serif'],
        mono:    ['Space Mono', 'monospace'],
      },
      colors: {
        // Primary accent — dark emerald
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Neutral base — slate
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Semantic aliases
        bg:       '#f8fafc',
        surface:  '#f1f5f9',
        border:   '#e2e8f0',
        accent:   '#065f46',
        'accent-hover': '#047857',
        'accent-light': '#ecfdf5',
        'text-primary':   '#0f172a',
        'text-secondary': '#475569',
        'text-muted':     '#94a3b8',
        // Status colors
        'status-ok':   '#047857',
        'status-warn': '#b45309',
        'status-crit': '#b91c1c',
      },
      boxShadow: {
        'card':        '0 1px 3px 0 rgba(15,23,42,0.08), 0 1px 2px -1px rgba(15,23,42,0.06)',
        'card-hover':  '0 4px 12px 0 rgba(15,23,42,0.10)',
        'emerald-glow':'0 0 20px 0 rgba(6,95,70,0.15)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
