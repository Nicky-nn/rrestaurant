const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const jsxA11y = require('eslint-plugin-jsx-a11y')
const prettier = require('eslint-plugin-prettier')
const simpleImportSort = require('eslint-plugin-simple-import-sort')
const globals = require('globals')
const eslintConfigPrettier = require('eslint-config-prettier')

module.exports = tseslint.config(
  // ===== Lo que tenemos que ignorar =====
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'dist-zip/**',
      'eslint.config.cjs',
      'vite.config.mts',
      'public/**',
    ],
  },

  // ===== Configuraciones bases =====
  js.configs.recommended, // Reglas base de JavaScript
  ...tseslint.configs.recommended, // Reglas base de TypeScript
  react.configs.flat.recommended, // Reglas base de React (Flat Config)
  jsxA11y.flatConfigs.recommended, // Reglas base de Accesibilidad

  // ===== Configuracion principal =====
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
      prettier: prettier,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json', // Conexión con TypeScript
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser, // Habilita window, document, etc.
      },
    },
    settings: {
      react: {
        version: 'detect', // Detecta automáticamente versión de React (v19)
      },
    },
    rules: {
      // --- JAVASCRIPT / TYPESCRIPT ---
      'no-unused-vars': 'off', // Desactivada la de JS a favor de la de TS
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' }, // Permite variables no usadas si empiezan con _ (ej: _event)
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Permite 'any' (útil en migraciones o datos complejos)
      '@typescript-eslint/no-empty-object-type': 'off', // Permite interfaces vacías (ej: interface Props {})

      // --- REACT & HOOKS ---
      'react/react-in-jsx-scope': 'off', // No hace falta importar React en cada archivo (React 17+)
      'react/prop-types': 'off', // No usamos prop-types porque ya tenemos TypeScript
      'react/display-name': 'off', // Permite componentes sin nombre (útil en HOCs o arrows)
      'react/no-unescaped-entities': 'off', // Permite usar ' o " sin escapar en el texto

      ...reactHooks.configs.recommended.rules, // Reglas obligatorias de hooks (rules-of-hooks)
      'react-hooks/exhaustive-deps': 'warn', // Avisa si faltan dependencias en useEffect

      // --- ACCESIBILIDAD (A11y) ---
      'jsx-a11y/click-events-have-key-events': 'off', // Desactivado: MUI ya maneja esto internamente
      'jsx-a11y/no-static-element-interactions': 'off', // Permite clics en divs si es necesario (MUI)
      'jsx-a11y/no-autofocus': 'off', // Permite autoFocus (útil en modales de inventario)

      // --- ORDEN DE IMPORTACIONES ---
      'simple-import-sort/imports': 'error', // Ordena tus imports alfabéticamente al guardar
      'simple-import-sort/exports': 'error', // Ordena tus exports alfabéticamente

      // --- PRETTIER ---
      'prettier/prettier': [
        'error',
        {},
        { usePrettierrc: true }, // Respeta tus reglas del archivo .prettierrc
      ],

      // --- OPTIMIZACIÓN DE MUI ---
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // Evita: import { Button } from '@mui/material/Button/Button'
              group: ['@mui/*/*/*'],
              message: "Usa imports de máximo 2 niveles. Ejemplo: '@mui/material/Button'.",
            },
            {
              // Evita: import Icon from '@mui/icons-material/icons/Add'
              group: ['@mui/icons-material/*/*'],
              message: "Importa iconos directamente. Ejemplo: '@mui/icons-material/Add'.",
            },
          ],
        },
      ],
    },
  },

  /** CONFIGURACIONES PARA NODE */
  {
    files: ['vite.config.mts'],
    languageOptions: {
      globals: {
        ...globals.node, // Habilita process, __dirname, etc.
      },
    },
  },

  /** Escudo de prettier, se debe ejecutar siempre al final */
  eslintConfigPrettier,
)
