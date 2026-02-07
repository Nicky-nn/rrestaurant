import {
  alpha,
  darken,
  getContrastRatio,
  lighten,
  PaletteMode,
  PaletteOptions,
  Shadows,
  SimplePaletteColorOptions,
  ThemeOptions,
} from '@mui/material'

import { themeDarkShadow, themeLightShadow } from './themeShadows.ts'

export const themeShadows: Shadows = themeLightShadow

const WHITE_STRONG = 'rgba(255, 255, 255, 0.99)'
const WHITE_SOFT = 'rgba(255, 255, 255, 0.87)'
const BLACK = 'rgba(0, 0, 0, 0.87)'
const DARK_ALPHA = 0.5

// Devuelve blanco o negro según la luminosidad del color de fondo
const getBestContrastColor = (background: string): string => {
  const contrastWithBlack = getContrastRatio(background, '#000000')
  const contrastWithWhite = getContrastRatio(background, '#FFFFFF')

  // ✅ Si negro tiene MEJOR contraste → usar negro
  if (contrastWithBlack > contrastWithWhite) {
    return WHITE_SOFT
  }

  // Fondo muy oscuro → blanco fuerte
  if (contrastWithWhite >= 7) {
    return WHITE_STRONG
  }

  // Fondo medio-oscuro → blanco suave
  if (contrastWithWhite >= 4.5) {
    return WHITE_SOFT
  }

  // Fallback: elegir el que tenga mejor contraste
  return contrastWithWhite > contrastWithBlack ? WHITE_SOFT : BLACK
}

const textLight = {
  primary: 'rgba(52, 49, 76, 1)',
  secondary: 'rgba(52, 49, 76, 0.70)',
  disabled: 'rgba(52, 49, 76, 0.38)',
  hint: 'rgba(52, 49, 76, 0.60)',
}

const textDark = {
  primary: 'rgba(250, 250, 250, 0.87)', // Warm white
  secondary: 'rgba(250, 250, 250, 0.60)',
  disabled: 'rgba(250, 250, 250, 0.38)',
  hint: 'rgba(250, 250, 250, 0.50)',
}

const errorColor = { main: '#F44336' }

// --- 2. NUEVOS COLORES (Disponibles en todos los temas) ---
const getExtendedColors = (mode: PaletteMode) => {
  const isDark = mode === 'dark'
  const c = (hexColor: string) => (isDark ? alpha(hexColor, DARK_ALPHA) : hexColor)
  // const c = (light: string, dark: string) => (isDark ? dark : light)

  const definitions = {
    yellow: {
      // Ámbar controlado (warning sin fluorescencia)
      main: isDark ? c('#F57C00') : '#FFC107',
      light: isDark ? c('#ffee58') : '#ffee58',
      dark: isDark ? c('#E65100') : '#FFA000',
      contrastText: BLACK,
    },

    green: {
      // Verde profundo usable en dark
      main: isDark ? c('#2E7D32') : '#4CAF50',
      light: isDark ? c('#81c784') : '#81c784',
      dark: isDark ? c('#1B5E20') : '#388E3C',
    },

    blue: {
      // Azul marino real (no pastel)
      main: isDark ? c('#1565C0') : '#2196F3',
      light: isDark ? c('#64b5f6') : '#64b5f6',
      dark: isDark ? c('#0D47A1') : '#1976D2',
    },
    cyan: {
      // Cian petróleo
      main: isDark ? c('#00838F') : '#00bcd4',
      light: isDark ? c('#4dd0e1') : '#4dd0e1',
      dark: isDark ? c('#006064') : '#0097A7',
    },

    purple: {
      // Uva profunda
      main: isDark ? c('#6A1B9A') : '#9C27B0',
      light: isDark ? c('#ba68c8') : '#ba68c8',
      dark: isDark ? c('#4A148C') : '#7B1FA2',
    },

    teal: {
      // Teal oscuro de dashboard
      main: isDark ? c('#00695C') : '#009688',
      light: isDark ? c('#4db6ac') : '#4db6ac',
      dark: isDark ? c('#004D40') : '#00796B',
    },

    orange: {
      // Teal oscuro de dashboard
      main: isDark ? c('#fb8c00') : '#ff9800',
      light: isDark ? c('#ffb74d') : '#ffb74d',
      dark: isDark ? c('#f57c00') : '#fb8c00',
    },
  }

  return Object.keys(definitions).reduce((acc, key) => {
    const colorKey = key as keyof typeof definitions
    const colorDef = definitions[colorKey]

    const contrastText =
      (colorDef as any).contrastText || getBestContrastColor(colorDef.main)

    acc[colorKey] = {
      ...colorDef,
      contrastText,
    }

    return acc
  }, {} as any)
}

// --- 3. CONFIGURACIÓN DE VARIANTES (Primary & Secondary) ---
// Aquí defines SOLO lo que es único de cada tema
interface ColorDefinition {
  primary: SimplePaletteColorOptions
  secondary: SimplePaletteColorOptions
}

interface ThemeDefinition {
  light: ColorDefinition
  dark: ColorDefinition
}

// Definiciion principal de colores
const colors = {
  default: { pri: '#363e5d', sec: '#df9c16', darkLighten: 0.02 },
  green: { pri: '#00625D', sec: '#F47A20', darkLighten: 0.0 },
  indigo: { pri: '#1c4c96', sec: '#ff7360', darkLighten: 0.02 },
  purple: { pri: '#4745b6', sec: '#ff8000', darkLighten: 0.02 },
  blue: { pri: '#1976d2', sec: '#d27619', darkLighten: 0 },
  blue1: { pri: '#00539A', sec: '#E15200', darkLighten: 0.2 },
  blue2: { pri: '#25368B', sec: '#FCC346', darkLighten: 0 },
  purple2: { pri: '#584569', sec: '#ED6C20', darkLighten: 0.02 },
}

// ----------------------------------------------------------------------
// 2. HELPER PARA GENERAR VARIANTES (Main, Light, Dark)
// ----------------------------------------------------------------------
/**
 * Crea el objeto completo de paleta { main, light, dark }
 * @param hexColor El color principal
 * @param isDarkMode
 * @param darkLighten
 */
const createPalette = (
  hexColor: string,
  isDarkMode: boolean,
  darkLighten: number = 0,
) => {
  const mainColor =
    isDarkMode && darkLighten > 0 ? lighten(hexColor, darkLighten) : hexColor
  return {
    base: hexColor,
    main: mainColor,
    light: lighten(mainColor, 0.2), // Genera primary.light
    dark: darken(mainColor, 0.15), // Genera primary.dark
  }
}

// Generamos la paleta de colores para primary y secondary
const themeConfig: Record<string, ThemeDefinition> = {}
Object.entries(colors).forEach(([key, value]) => {
  themeConfig[key] = {
    light: {
      primary: createPalette(value.pri, false, value.darkLighten),
      secondary: createPalette(value.sec, false, value.darkLighten),
    },
    dark: {
      primary: createPalette(value.pri, true, value.darkLighten),
      secondary: createPalette(value.sec, true, value.darkLighten),
    },
  }
})

// Generamos la configuracion de la paleta de colores
const createCompleteTheme = (
  variantName: string, // Nombre original, ej "green"
  mode: PaletteMode,
  colors: ColorDefinition, // Los colores específicos de esa configuración (light o dark)
): ThemeOptions => {
  const isDark = mode === 'dark'
  const extendedPalette = getExtendedColors(mode)

  // Lógica de background
  const background = {
    paper: isDark ? '#1e1e1e' : '#FAFAFA', // Blanco puro para tarjetas
    default: isDark ? '#0a0a0a' : '#F5F5F5', // Gris suave para el fondo de la app
    elevated: isDark ? '#242424' : '#FFFFFF',
  }

  // Override de background específico para ciertos temas en Dark Mode
  // if (isDark) {
  //   background.default = '#1D1D1D' // Tu fondo dark general
  //   background.paper = '#353535'
  //   // // Fondos de tarjetas personalizados según el tema
  //   // if (variantName === 'green') background.paper = '#00625D'
  // }

  return {
    palette: {
      mode,
      ...extendedPalette, // Agrega orange, green, etc.
      primary: {
        ...colors.primary,
        contrastText:
          (colors.primary as any).contrastText ||
          getBestContrastColor(colors.primary.main),
      },
      secondary: {
        ...colors.secondary,
        contrastText:
          (colors.secondary as any).contrastText ||
          getBestContrastColor(colors.secondary.main),
      },
      text: isDark ? textDark : textLight,
      error: errorColor,
      background,
      action: {
        active: isDark ? 'rgba(255, 255, 255, 0.78)' : 'rgba(0, 0, 0, 0.54)',
        hover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    } as PaletteOptions,
    shadows: isDark ? themeDarkShadow : themeShadows,
    components: {
      MuiDialogContent: {
        styleOverrides: {
          root: {
            // Si usas dividers, asegúrate de que el borde sea visible en dark
            borderColor: isDark ? alpha('#ffffff', 0.12) : alpha('#000000', 0.12),
          },
        },
      },
    },
  }
}

// Generación final
export const themeColors: Record<string, ThemeOptions> = Object.keys(themeConfig).reduce(
  (acc, key) => {
    const config = themeConfig[key]

    // Generar la versión LIGHT usando config.light
    acc[key] = createCompleteTheme(key, 'light', config.light)

    // Generar la versión DARK usando config.dark
    // Nota: Aquí pasamos 'config.dark' explícitamente, así que se usará los colores definidos para oscuro.
    acc[`${key}Dark`] = createCompleteTheme(key, 'dark', config.dark)

    return acc
  },
  {} as Record<string, ThemeOptions>,
)
