import { Palette, Theme } from '@mui/material'

import { getColor } from '../../../utils/getColor.ts'

type StyledPaletteColors = {
  [K in keyof Palette]: Palette[K] extends { main: string } ? K : never
}[keyof Palette]

/**
 * Genera un conjunto de colores para Material React Table
 * consumiendo la fuente de la verdad centralizada (getColor).
 *
 * @param colorBase
 * @param theme
 */
export const getMrtColors = (colorBase: StyledPaletteColors | string | undefined, theme: Theme) => {
  // 1. Obtenemos toda la paleta de colores usando tu helper centralizado
  const colors = getColor(theme, colorBase)

  // 2. Extraer el mainColor (MRT lo necesita puro para controles de UI internos)
  let mainColor = theme.palette.primary.main
  if (colorBase) {
    if (colorBase in theme.palette) {
      const target = theme.palette[colorBase as keyof Palette] as any
      if (target && target.main) mainColor = target.main
    } else {
      mainColor = colorBase // Asumimos que es un HEX
    }
  }

  // 3. Retornamos el objeto mapeado.
  // Usamos bgColor (Soft) porque sus porcentajes (12/14%) son los más
  // cercanos a los que definiste originalmente para MRT (8/12%).
  return {
    headBg: colors.bgColor,
    headText: colors.textColor,
    borderColor: colors.borderColor,
    hoverBg: colors.hoverColor,
    stripedBg: colors.stripedColor,
    mainColor,
  }
}
