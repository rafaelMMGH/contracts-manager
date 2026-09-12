import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Spanish contract copy intentionally uses raw quotes in @react-pdf Text nodes
      'react/no-unescaped-entities': 'off',
      // Common intentional patterns (portals, overlays, relative day counts)
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
  {
    files: ['**/*.{js,cjs,mjs}', 'tailwind.config.js', 'next.config.js', 'postcss.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.agents/**',
    '.claude/**',
    '.cursor/**',
    'public/**',
  ]),
])

export default eslintConfig
