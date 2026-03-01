import { CssBaseline, ThemeProvider } from '@mui/material'
import { FC, ReactNode } from 'react'

import useSettings from '../../../hooks/useSettings'

type MatxThemeProps = {
  children: ReactNode | ReactNode[]
}

/**
 * Inicio y creación de la plantilla matx
 * @author isi-template
 * @param children
 * @constructor
 */
const MatxTheme: FC<MatxThemeProps> = ({ children }: MatxThemeProps) => {
  const { settings } = useSettings()
  const activeTheme = { ...settings.themes[settings.activeTheme] }

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export default MatxTheme
