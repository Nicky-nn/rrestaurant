import { createTheme, Theme } from '@mui/material'
import { esES } from '@mui/material/locale'
import { forEach, merge } from 'lodash'

import { CreateMatxThemesProps, themeColors } from './themeColors'
import themeOptions from './themeOptions'

interface CreateThemeProps extends CreateMatxThemesProps, Theme {}

/**
 * @author isi-template
 */
const createMatxThemes = (): CreateMatxThemesProps => {
  let themes: CreateThemeProps = {} as CreateThemeProps
  forEach(themeColors, (value, key) => {
    const mergeTheme: CreateMatxThemesProps = merge(
      {} as CreateMatxThemesProps,
      themeOptions,
      value,
    )
    // @ts-ignore
    themes[key] = createTheme(mergeTheme, esES)
  })
  return themes as CreateThemeProps
}
export const themes = createMatxThemes()
