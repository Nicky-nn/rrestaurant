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

export const themeShadows: Shadows = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.06),0px 1px 1px 0px rgba(0,0,0,0.042),0px 1px 3px 0px rgba(0,0,0,0.036)',
  '0px 3px 1px -2px rgba(0,0,0,0.06),0px 2px 2px 0px rgba(0,0,0,0.042),0px 1px 5px 0px rgba(0,0,0,0.036)',
  '0px 3px 3px -2px rgba(0,0,0,0.06),0px 3px 4px 0px rgba(0,0,0,0.042),0px 1px 8px 0px rgba(0,0,0,0.036)',
  '0px 2px 4px -1px rgba(0,0,0,0.06),0px 4px 5px 0px rgba(0,0,0,0.042),0px 1px 10px 0px rgba(0,0,0,0.036)',
  '0px 3px 5px -1px rgba(0,0,0,0.06),0px 5px 8px 0px rgba(0,0,0,0.042),0px 1px 14px 0px rgba(0,0,0,0.036)',
  '0px 3px 5px -1px rgba(0,0,0,0.06),0px 6px 10px 0px rgba(0,0,0,0.042),0px 1px 18px 0px rgba(0,0,0,0.036)',
  '0px 4px 5px -2px rgba(0,0,0,0.06),0px 7px 10px 1px rgba(0,0,0,0.042),0px 2px 16px 1px rgba(0,0,0,0.036)',
  '0px 5px 5px -3px rgba(0,0,0,0.06),0px 8px 10px 1px rgba(0,0,0,0.042),0px 3px 14px 2px rgba(0,0,0,0.036)',
  '0px 5px 6px -3px rgba(0,0,0,0.06),0px 9px 12px 1px rgba(0,0,0,0.042),0px 3px 16px 2px rgba(0,0,0,0.036)',
  '0px 6px 6px -3px rgba(0,0,0,0.06),0px 10px 14px 1px rgba(0,0,0,0.042),0px 4px 18px 3px rgba(0,0,0,0.036)',
  '0px 6px 7px -4px rgba(0,0,0,0.06),0px 11px 15px 1px rgba(0,0,0,0.042),0px 4px 20px 3px rgba(0,0,0,0.036)',
  '0px 7px 8px -4px rgba(0,0,0,0.06),0px 12px 17px 2px rgba(0,0,0,0.042),0px 5px 22px 4px rgba(0,0,0,0.036)',
  '0px 7px 8px -4px rgba(0,0,0,0.06),0px 13px 19px 2px rgba(0,0,0,0.042),0px 5px 24px 4px rgba(0,0,0,0.036)',
  '0px 7px 9px -4px rgba(0,0,0,0.06),0px 14px 21px 2px rgba(0,0,0,0.042),0px 5px 26px 4px rgba(0,0,0,0.036)',
  '0px 8px 9px -5px rgba(0,0,0,0.06),0px 15px 22px 2px rgba(0,0,0,0.042),0px 6px 28px 5px rgba(0,0,0,0.036)',
  '0px 8px 10px -5px rgba(0,0,0,0.06),0px 16px 24px 2px rgba(0,0,0,0.042),0px 6px 30px 5px rgba(0,0,0,0.036)',
  '0px 8px 11px -5px rgba(0,0,0,0.06),0px 17px 26px 2px rgba(0,0,0,0.042),0px 6px 32px 5px rgba(0,0,0,0.036)',
  '0px 9px 11px -5px rgba(0,0,0,0.06),0px 18px 28px 2px rgba(0,0,0,0.042),0px 7px 34px 6px rgba(0,0,0,0.036)',
  '0px 9px 12px -6px rgba(0,0,0,0.06),0px 19px 29px 2px rgba(0,0,0,0.042),0px 7px 36px 6px rgba(0,0,0,0.036)',
  '0px 10px 13px -6px rgba(0,0,0,0.06),0px 20px 31px 3px rgba(0,0,0,0.042),0px 8px 38px 7px rgba(0,0,0,0.036)',
  '0px 10px 13px -6px rgba(0,0,0,0.06),0px 20px 31px 3px rgba(0,0,0,0.042),0px 8px 38px 7px rgba(0,0,0,0.036)',
  '0px 10px 13px -6px rgba(0,0,0,0.06),0px 20px 31px 3px rgba(0,0,0,0.042),0px 8px 38px 7px rgba(0,0,0,0.036)',
  '0px 10px 13px -6px rgba(0,0,0,0.06),0px 20px 31px 3px rgba(0,0,0,0.042),0px 8px 38px 7px rgba(0,0,0,0.036)',
  '0px 10px 13px -6px rgba(0,0,0,0.06),0px 20px 31px 3px rgba(0,0,0,0.042),0px 8px 38px 7px rgba(0,0,0,0.036)',
] as unknown as Shadows

const WHITE_STRONG = 'rgba(255, 255, 255, 0.99)'
const WHITE_SOFT = 'rgba(255, 255, 255, 0.87)'
const BLACK = 'rgba(0, 0, 0, 0.87)'
const DARK_ALPHA = 0.8

// Devuelve blanco o negro según la luminosidad del color de fondo
const getBestContrastColor = (background: string): string => {
  const contrastWithBlack = getContrastRatio(background, '#000000')
  const contrastWithWhite = getContrastRatio(background, '#FFFFFF')

  // ✅ Si negro tiene MEJOR contraste → usar negro
  if (contrastWithBlack > contrastWithWhite) {
    return WHITE_SOFT
  }

  // Fondo muy oscuro → blanco fuerte (contraste excelente)
  if (contrastWithWhite >= 7) {
    return WHITE_STRONG
  }

  // Fondo medio-oscuro → blanco suave (contraste bueno)
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
  default: { pri: '#363e5d', sec: '#df9c16' },
  green: { pri: '#00625D', sec: '#F47A20' },
  indigo: { pri: '#1c4c96', sec: '#ff7360' },
  purple: { pri: '#4745b6', sec: '#ff8000' },
  blue: { pri: '#1976d2', sec: '#d27619' },
  blue1: { pri: '#00539A', sec: '#E15200' },
  blue2: { pri: '#25368B', sec: '#FCC346' },
  purple2: { pri: '#584569', sec: '#ED6C20' },
}

// ----------------------------------------------------------------------
// 2. HELPER PARA GENERAR VARIANTES (Main, Light, Dark)
// ----------------------------------------------------------------------
/**
 * Crea el objeto completo de paleta { main, light, dark }
 * @param hexColor El color principal
 * @param lightenAmount
 */
const createPalette = (hexColor: string, lightenAmount: number = 0) => {
  const mainColor = lightenAmount > 0 ? lighten(hexColor, lightenAmount) : hexColor
  return {
    base: hexColor,
    main: mainColor,
    light: lighten(hexColor, 0.2), // Genera primary.light
    dark: darken(hexColor, 0.1), // Genera primary.dark
  }
}
const coeficiente = 0.1
const themeConfig: Record<string, ThemeDefinition> = {
  default: {
    light: {
      primary: createPalette(colors.default.pri),
      secondary: createPalette(colors.default.sec),
    },
    dark: {
      primary: createPalette(colors.default.pri, coeficiente),
      secondary: createPalette(colors.default.sec, coeficiente),
    },
  },
  green: {
    light: {
      primary: createPalette(colors.green.pri),
      secondary: createPalette(colors.green.sec),
    },
    dark: {
      primary: createPalette(colors.green.pri, coeficiente),
      secondary: createPalette(colors.green.sec, coeficiente),
    },
  },
  indigo: {
    light: {
      primary: createPalette(colors.indigo.pri),
      secondary: createPalette(colors.indigo.sec),
    },
    dark: {
      primary: createPalette(colors.indigo.pri, coeficiente),
      secondary: createPalette(colors.indigo.sec, coeficiente),
    },
  },
  purple: {
    light: {
      primary: createPalette(colors.purple.pri),
      secondary: createPalette(colors.purple.sec),
    },
    dark: {
      primary: createPalette(colors.purple.pri, coeficiente),
      secondary: createPalette(colors.purple.sec, coeficiente),
    },
  },
  blue: {
    light: {
      primary: createPalette(colors.blue.pri),
      secondary: createPalette(colors.blue.sec),
    },
    dark: {
      primary: createPalette(colors.blue.pri, coeficiente),
      secondary: createPalette(colors.blue.sec, coeficiente),
    },
  },
  blue1: {
    light: {
      primary: createPalette(colors.blue1.pri),
      secondary: createPalette(colors.blue1.sec),
    },
    dark: {
      primary: createPalette(colors.blue1.pri, coeficiente),
      secondary: createPalette(colors.blue1.sec, coeficiente),
    },
  },
  blue2: {
    light: {
      primary: createPalette(colors.blue2.pri),
      secondary: createPalette(colors.blue2.sec),
    },
    dark: {
      primary: createPalette(colors.blue2.pri, coeficiente),
      secondary: createPalette(colors.blue2.sec, coeficiente),
    },
  },
  purple2: {
    light: {
      primary: createPalette(colors.purple2.pri),
      secondary: createPalette(colors.purple2.sec),
    },
    dark: {
      primary: createPalette(colors.purple2.pri, coeficiente),
      secondary: createPalette(colors.purple2.sec, coeficiente),
    },
  },
}

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
    shadows: themeShadows,
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
