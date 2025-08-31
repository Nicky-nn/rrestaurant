import { Theme, ThemeProvider } from '@mui/material'
import { ReactNode } from 'react'

type SecondarySidenavThemeProps = {
  theme: Theme
  classes?: string
  children: ReactNode
  open?: any
}

const SecondarySidenavTheme = ({
  theme,
  classes,
  children,
  open,
}: SecondarySidenavThemeProps) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
export default SecondarySidenavTheme
