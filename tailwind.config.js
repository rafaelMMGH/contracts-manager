/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Lufga', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      colors: {
        // Design system board: #215A4E / #727272 / #000000 / #FFFFFF
        brand: {
          50:  '#e8f0ed',
          100: '#d3e2dd',
          200: '#a7c5bc',
          300: '#7aa89a',
          400: '#4e8b79',
          500: '#215a4e',
          600: '#1a4a40',
          700: '#163f37',
          800: '#12332d',
          900: '#0e2823',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#727272',
          600: '#5c5c5c',
          700: '#404040',
          800: '#262626',
          900: '#0f0f0f',
          950: '#000000',
        },
        bg: '#f3f5f4',
        surface: '#ffffff',
        // shadcn semantic tokens (from :root in globals.css)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground, #ffffff)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // App aliases (brand green helpers; prefer brand-* for new UI)
        'accent-hover': '#1a4a40',
        'accent-light': '#e8f0ed',
        'text-primary': '#000000',
        'text-secondary': '#404040',
        'text-muted': '#727272',
        'status-ok': '#215a4e',
        'status-warn': '#b45309',
        'status-crit': '#b91c1c',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(33, 90, 78, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px 0 rgba(33, 90, 78, 0.14)',
        brand: '0 4px 14px 0 rgba(33, 90, 78, 0.28)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
