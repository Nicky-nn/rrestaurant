import { ThemeProvider, useTheme } from '@mui/material'
import { FC, JSX } from 'react'

import useSettings from '../../../../hooks/useSettings'

interface SidenavThemeProp {
  children: JSX.Element
}

const SidenavTheme: FC<SidenavThemeProp> = ({ children }: SidenavThemeProp) => {
  const theme = useTheme()
  const { settings } = useSettings()
  const sidenavTheme =
    settings.themes[settings.layout1Settings.leftSidebar.theme] || theme

  return <ThemeProvider theme={sidenavTheme}>{children}</ThemeProvider>
}

export default SidenavTheme
