import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    '**/*.backup.*',
    '**/*.pre_stabilization_backup',
  ]),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactRefresh.configs.vite],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [reactRefresh.configs.vite],
    rules: {
      'no-undef': 'off',
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['Route'] },
      ],
    },
  },
  {
    // TanStack route modules export route objects alongside their page components;
    // the Vite React refresh boundary rule does not model that module contract.
    files: ['src/loveable/routes/**/*.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // These shared providers and UI primitives intentionally export hooks,
    // contexts, and style helpers alongside components as part of their API.
    files: [
      'src/context/AuthContext.jsx',
      'src/loveable/lib/auth.tsx',
      'src/loveable/components/forms/DynamicVisaApplicationForm.tsx',
      'src/loveable/components/ui/badge.tsx',
      'src/loveable/components/ui/button.tsx',
      'src/loveable/components/ui/form.tsx',
      'src/loveable/components/ui/navigation-menu.tsx',
      'src/loveable/components/ui/sidebar.tsx',
      'src/loveable/components/ui/toggle.tsx',
    ],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['src/server.js'],
    languageOptions: { globals: globals.node },
  },
])
