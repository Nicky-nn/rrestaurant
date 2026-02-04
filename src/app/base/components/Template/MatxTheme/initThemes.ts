import { createTheme, Theme } from '@mui/material'
import { esES } from '@mui/material/locale'

import { themeColors } from './themeColors.ts'
import themeOptions from './themeOptions'
// 1. Magia de TypeScript:
// En lugar de escribir manualmente "blue" | "blueDark", obtenemos las llaves del objeto
type ThemeNames = keyof typeof themeColors

// Definimos que nuestro objeto de temas tendrá esas llaves y contendrá un Tema de MUI
export type ThemesMap = Record<ThemeNames, Theme>

/**
 * @author isi-template
 */
const createMatxThemes = (): ThemesMap => {
  let themes: ThemesMap = {} as ThemesMap
  // Recorremos nuestro objeto de colores generado anteriormente
  Object.keys(themeColors).forEach((key) => {
    const themeName = key as ThemeNames
    const colorOptions = themeColors[themeName]

    // 2. Optimización:
    // createTheme ya hace un "deep merge" nativo.
    // No necesitas lodash.merge.
    // El orden es: Base -> Colores Específicos -> Idioma
    themes[themeName] = createTheme(themeOptions, colorOptions, esES)
  })
  return themes
}
export const themes = createMatxThemes()
