import { darken, lighten, Palette, Theme } from '@mui/material'

import { alphaByTheme } from './colorUtils.ts'

/**
 * CONSTANTES GLOBALES DE INTENSIDAD (Fuente de la verdad)
 * @author isi-template
 */
export const COLOR_TINTS = {
  soft: {
    light: 12,
    dark: 14,
  },
  strong: {
    light: 20, // Bajado antes 24
    dark: 24, // Bajado antes 28
  },
}

type StyledPaletteColors = {
  [K in keyof Palette]: Palette[K] extends { main: string } ? K : never
}[keyof Palette]

/**
 * Obtiene los colores precalculados del sistema de diseño (softBgColor, etc.),
 * o los calcula en tiempo real si se envía un código HEX personalizado.
 *
 * @param theme - El tema global de MUI
 * @param bgColor - bgColor La clave de la paleta (ej. 'primary', 'green') green[200] o un HEX (ej. '#FF0000')
 * @author isi-template
 */
export const getColor = (theme: Theme, bgColor?: StyledPaletteColors | string) => {
  const isDark = theme.palette.mode === 'dark'
  const paperBg = theme.palette.background.paper

  // 1. FONDO NEUTRO (Si no se envía color)
  if (!bgColor) {
    const tintPercent = isDark ? 5 : 3
    const baseColor = isDark ? '#ffffff' : '#000000'
    return {
      bgColor: `color-mix(in srgb, ${baseColor} ${tintPercent}%, ${paperBg})`,
      textColor: theme.palette.text.primary,
      borderColor: theme.palette.divider,
      // Estados interactivos neutros
      hoverColor: theme.palette.action.hover,
      stripedColor: alphaByTheme(theme.palette.action.hover, theme, 0.04, 0.04),
    }
  }

  // 2. COLORES DEL SISTEMA DE DISEÑO (Lectura inmediata desde themeColor.ts)
  if (bgColor in theme.palette) {
    const paletteColor = theme.palette[bgColor as keyof Palette] as any
    if (paletteColor && paletteColor.softBgColor) {
      const mainColor = paletteColor.main
      return {
        bgColor: paletteColor.softBgColor,
        textColor: paletteColor.softTextColor,
        borderColor: paletteColor.borderColor,
        // Si necesitas devolver los strong aquí también:
        strongBgColor: paletteColor.strongBgColor,
        strongTextColor: paletteColor.strongTextColor,
        // Estados interactivos de paleta
        hoverColor: alphaByTheme(mainColor, theme, 0.13, 0.07),
        stripedColor: alphaByTheme(mainColor, theme, 0.06, 0.035),
      }
    }
  }

  // 3. COLOR HEX PERSONALIZADO
  const softTint = isDark ? COLOR_TINTS.soft.dark : COLOR_TINTS.soft.light
  const strongTint = isDark ? COLOR_TINTS.strong.dark : COLOR_TINTS.strong.light

  return {
    // Soft
    bgColor: `color-mix(in srgb, ${bgColor} ${softTint}%, ${paperBg})`,
    textColor: isDark ? lighten(bgColor, 0.55) : darken(bgColor, 0.3),
    borderColor: alphaByTheme(bgColor, theme, 0.3, 0.2),

    // Strong
    strongBgColor: `color-mix(in srgb, ${bgColor} ${strongTint}%, ${paperBg})`,
    strongTextColor: isDark ? lighten(bgColor, 0.7) : darken(bgColor, 0.4),

    // Estados interactivos usado generalmente para hover y striped
    hoverColor: alphaByTheme(bgColor, theme, 0.13, 0.07),
    stripedColor: alphaByTheme(bgColor, theme, 0.06, 0.035),
  }
}
