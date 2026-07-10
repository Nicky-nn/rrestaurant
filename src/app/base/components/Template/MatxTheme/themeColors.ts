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

import { COLOR_TINTS } from '../../../../utils/getColor.ts'
import { themeDarkShadow, themeLightShadow } from './themeShadows.ts'

// =========================================================================
// 1. EXPANSIÓN DE TIPOS DE MATERIAL-UI (Añade esto al inicio del archivo)
// =========================================================================
declare module '@mui/material/styles' {
  interface PaletteColor {
    /** Color de fondo suave (12%) usado generalmente para tablas y alertas */
    softBgColor: string
    softTextColor: string

    /** Color de fondo con más presencia (24%) para destacar datos importantes */
    strongBgColor: string
    strongTextColor: string

    /** Color suave de hover */
    hoverBgColor: string
    /** Color de tono mas suave que softBgColor */
    faintBgColor: string
    /** Color de borde */
    borderColor: string
  }
  interface SimplePaletteColorOptions {
    softBgColor?: string
    softTextColor?: string
    strongBgColor?: string
    strongTextColor?: string
    hoverBgColor?: string
    faintBgColor?: string
    borderColor?: string
  }
}
export const themeShadows: Shadows = themeLightShadow

const WHITE_STRONG = 'rgba(255, 255, 255, 0.99)'
const WHITE_SOFT = 'rgba(255, 255, 255, 0.87)'
const BLACK = 'rgba(0, 0, 0, 0.87)'

// =========================================================================
// 2. HELPERS BASE Y DE CONTRASTE
// =========================================================================
const getBestContrastColor = (background: string): string => {
  const contrastWithWhite = getContrastRatio(background, '#FFFFFF')
  if (contrastWithWhite >= 3) {
    return contrastWithWhite >= 7 ? WHITE_STRONG : WHITE_SOFT
  }
  return BLACK
}

// Extraemos los fondos para poder usarlos en los cálculos de color-mix antes de armar el tema
const getPaperBg = (isDark: boolean) => (isDark ? '#1e1e1e' : '#FAFAFA')
const getDefaultBg = (isDark: boolean) => (isDark ? '#0a0a0a' : '#F5F5F5')
const getElevatedBg = (isDark: boolean) => (isDark ? '#242424' : '#FFFFFF')

// =========================================================================
// 3. EL NUEVO GENERADOR DE ESTADOS AVANZADOS (MRT Logic inyectada)
// =========================================================================
const generateAdvancedColorStates = (mainColor: string, isDark: boolean) => {
  const paperBg = getPaperBg(isDark)

  // Consumimos las constantes globales
  const softTint = isDark ? COLOR_TINTS.soft.dark : COLOR_TINTS.soft.light
  const strongTint = isDark ? COLOR_TINTS.strong.dark : COLOR_TINTS.strong.light

  return {
    // Nivel 1: Suave
    softBgColor: `color-mix(in srgb, ${mainColor} ${softTint}%, ${paperBg})`,
    softTextColor: isDark ? lighten(mainColor, 0.55) : darken(mainColor, 0.3),

    // Nivel 2: Fuerte
    strongBgColor: `color-mix(in srgb, ${mainColor} ${strongTint}%, ${paperBg})`,
    strongTextColor: isDark ? lighten(mainColor, 0.7) : darken(mainColor, 0.4),

    // Elementos UI
    borderColor: alpha(mainColor, isDark ? 0.3 : 0.2),
    hoverBgColor: alpha(mainColor, isDark ? 0.12 : 0.04),
    faintBgColor: alpha(mainColor, isDark ? 0.06 : 0.02),
  }
}

const textLight = {
  primary: 'rgba(52, 49, 76, 1)',
  secondary: 'rgba(52, 49, 76, 0.70)',
  disabled: 'rgba(52, 49, 76, 0.38)',
  hint: 'rgba(52, 49, 76, 0.60)',
}

const textDark = {
  primary: 'rgba(250, 250, 250, 0.83)',
  secondary: 'rgba(250, 250, 250, 0.60)',
  disabled: 'rgba(250, 250, 250, 0.38)',
  hint: 'rgba(250, 250, 250, 0.50)',
}

// =========================================================================
// 4. COLORES EXTENDIDOS (Ahora con estados avanzados)
// =========================================================================
const getExtendedColors = (mode: PaletteMode) => {
  const isDark = mode === 'dark'
  const c = (light: string, dark: string) => (isDark ? dark : light)

  const definitions = {
    yellow: {
      main: c('#FFB300', '#F57C00'),
      light: c('#FFD54F', '#FFB74D'),
      dark: c('#FF8F00', '#E65100'),
    },
    green: {
      main: c('#4CAF50', '#2E7D32'),
      light: c('#81C784', '#66BB6A'),
      dark: c('#388E3C', '#1B5E20'),
    },
    blue: {
      main: c('#2196F3', '#1565C0'),
      light: c('#64B5F6', '#42A5F5'),
      dark: c('#1976D2', '#0D47A1'),
    },
    cyan: {
      main: c('#00BCD4', '#00838F'),
      light: c('#4DD0E1', '#26C6DA'),
      dark: c('#0097A7', '#006064'),
    },
    purple: {
      main: c('#9C27B0', '#6A1B9A'),
      light: c('#BA68C8', '#AB47BC'),
      dark: c('#7B1FA2', '#4A148C'),
    },
    teal: {
      main: c('#009688', '#00695C'),
      light: c('#4DB6AC', '#26A69A'),
      dark: c('#00796B', '#004D40'),
    },
    orange: {
      main: c('#FF9800', '#EF6C00'),
      light: c('#FFB74D', '#FFA726'),
      dark: c('#F57C00', '#E65100'),
    },
  }

  return Object.keys(definitions).reduce((acc, key) => {
    const colorKey = key as keyof typeof definitions
    const colorDef = definitions[colorKey]

    const contrastText = (colorDef as any).contrastText || getBestContrastColor(colorDef.main)
    const advancedStates = generateAdvancedColorStates(colorDef.main, isDark)

    acc[colorKey] = {
      ...colorDef,
      contrastText,
      ...advancedStates, // <-- Inyectamos hoverBg, headBg, etc.
    }

    return acc
  }, {} as any)
}

// =========================================================================
// 5. CONFIGURACIÓN DE VARIANTES PRINCIPALES
// =========================================================================
interface ColorDefinition {
  primary: SimplePaletteColorOptions
  secondary: SimplePaletteColorOptions
}

interface ThemeDefinition {
  light: ColorDefinition
  dark: ColorDefinition
}

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

const createPalette = (hexColor: string, isDarkMode: boolean, darkLighten: number = 0) => {
  const mainColor = isDarkMode && darkLighten > 0 ? lighten(hexColor, darkLighten) : hexColor
  const advancedStates = generateAdvancedColorStates(mainColor, isDarkMode)

  return {
    base: hexColor, // Opcional, pero util si lo usas en otros lados
    main: mainColor,
    light: lighten(mainColor, 0.2),
    dark: darken(mainColor, 0.15),
    contrastText: getBestContrastColor(mainColor),
    ...advancedStates, // <-- Inyectamos hoverBg, headBg, etc.
  }
}

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

// =========================================================================
// 4.5. COLORES SEMÁNTICOS (Estados del Sistema independientes de la marca)
// =========================================================================
const getSemanticColors = (mode: PaletteMode) => {
  const isDark = mode === 'dark'

  // Función local rápida para elegir el color según el modo
  const c = (light: string, dark: string) => (isDark ? dark : light)

  const semantics = {
    error: { main: c('#d32f2f', '#c62828') },
    warning: { main: c('#ed6c02', '#e65100') },
    success: { main: c('#2e7d32', '#1b5e20') },
    info: { main: c('#0288d1', '#01579b') },
  }

  // Los pasamos por el motor avanzado para que generen softBgColor, faintBgColor, etc.
  return {
    error: {
      ...semantics.error,
      ...generateAdvancedColorStates(semantics.error.main, isDark),
    },
    warning: {
      ...semantics.warning,
      ...generateAdvancedColorStates(semantics.warning.main, isDark),
    },
    success: {
      ...semantics.success,
      ...generateAdvancedColorStates(semantics.success.main, isDark),
    },
    info: {
      ...semantics.info,
      ...generateAdvancedColorStates(semantics.info.main, isDark),
    },
  }
}

// =========================================================================
// 6. ENSAMBLAJE FINAL DEL TEMA
// =========================================================================
const createCompleteTheme = (
  variantName: string,
  mode: PaletteMode,
  themeColorsDefinition: ColorDefinition,
): ThemeOptions => {
  const isDark = mode === 'dark'
  const extendedPalette = getExtendedColors(mode)
  const semanticColors = getSemanticColors(mode)

  const background = {
    paper: getPaperBg(isDark),
    default: getDefaultBg(isDark),
    elevated: getElevatedBg(isDark),
  }

  const getModalContainer = (() => {
    let container: HTMLDivElement | null = null
    return () => {
      if (typeof document === 'undefined') return null
      if (!container) {
        container = document.createElement('div')
        container.id = 'modal-root'
        document.body.appendChild(container)
      }
      return container
    }
  })()

  return {
    palette: {
      mode,
      ...extendedPalette,
      primary: themeColorsDefinition.primary,
      secondary: themeColorsDefinition.secondary,
      text: isDark ? textDark : textLight,
      divider: isDark ? alpha('#ffffff', 0.12) : alpha('#000000', 0.12),
      ...semanticColors,
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
      MuiModal: { defaultProps: { container: getModalContainer } },
      MuiPopover: { defaultProps: { container: getModalContainer } },
    },
  }
}

export const themeColors: Record<string, ThemeOptions> = Object.keys(themeConfig).reduce(
  (acc, key) => {
    const config = themeConfig[key]
    acc[key] = createCompleteTheme(key, 'light', config.light)
    acc[`${key}Dark`] = createCompleteTheme(key, 'dark', config.dark)
    return acc
  },
  {} as Record<string, ThemeOptions>,
)
