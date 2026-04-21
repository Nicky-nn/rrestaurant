import { Box, styled, ThemeProvider, useMediaQuery, useTheme } from '@mui/material'
import { BoxProps } from '@mui/material/Box'
import React, { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'

import LayoutRestriccionV2 from '../../../../../modules/base/components/LayoutRestriccion/LayoutRestriccionV2.tsx'
import { sidenavCompactWidth, sideNavWidth } from '../../../../../utils/constant'
import { CajasProvider } from '../../../../contexts/CajasContext.tsx'
import useSettings from '../../../../hooks/useSettings'
import StyledScrollBar from '../../../Container/StyledScrollBar'
import Footer from '../../Footer/Footer'
import MatxSuspense from '../../MatxSuspense/MatxSuspense'
import SidenavTheme from '../../MatxTheme/SidenavTheme/SidenavTheme'
import Layout1Sidenav from './Layout1Sidenav'
import Layout1Topbar from './Layout1Topbar'

const Layout1Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  background: theme.palette.background.default,
}))

const ContentBox = styled(Box)(() => ({
  height: '100%',
  display: 'flex',
  overflowY: 'auto',
  overflowX: 'hidden',
  flexDirection: 'column',
  justifyContent: 'space-between',
}))

const StyledScrollBarSidenav = styled(StyledScrollBar)(() => ({
  paddingLeft: '1rem',
  paddingRight: '1rem',
  position: 'relative',
}))

interface LayoutContainerProps extends BoxProps {
  width: string | number
  open: boolean
}

const LayoutContainer = styled(Box)(({ width, open }: LayoutContainerProps) => ({
  height: '100vh',
  display: 'flex',
  flexGrow: '1',
  flexDirection: 'column',
  verticalAlign: 'top',
  marginLeft: width,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  marginRight: open ? 50 : 0,
}))

const Layout1 = () => {
  const { settings, updateSettings } = useSettings()
  const { layout1Settings, secondarySidebar } = settings
  const topbarTheme = settings.themes[layout1Settings.topbar.theme]
  const {
    leftSidebar: { mode: sidenavMode, show: showSidenav },
  } = layout1Settings

  const getSidenavWidth = () => {
    switch (sidenavMode) {
      case 'full':
        return sideNavWidth

      case 'compact':
        return sidenavCompactWidth

      default:
        return '0px'
    }
  }

  const sidenavWidth = getSidenavWidth()
  const theme = useTheme()
  const isMdScreen = useMediaQuery(theme.breakpoints.down('md'))

  const ref = useRef({ isMdScreen, settings })
  const layoutClasses = `theme-${theme.palette.primary}`

  useEffect(() => {
    const { settings } = ref.current
    const sidebarMode = settings.layout1Settings.leftSidebar.mode
    if (settings.layout1Settings.leftSidebar.show) {
      const mode = isMdScreen ? 'close' : sidebarMode
      updateSettings({ layout1Settings: { leftSidebar: { mode } } })
    }
  }, [isMdScreen])

  return (
    <CajasProvider>
    <Layout1Root className={layoutClasses}>
      {showSidenav && sidenavMode !== 'close' && (
        <SidenavTheme>
          <Layout1Sidenav />
        </SidenavTheme>
      )}

      <LayoutContainer width={sidenavWidth} open={secondarySidebar.open}>
        {layout1Settings.topbar.show && layout1Settings.topbar.fixed && (
          <>
            <ThemeProvider theme={topbarTheme}>
              <Layout1Topbar fixed={true} className="elevation-z8" />
              <LayoutRestriccionV2 />
            </ThemeProvider>
          </>
        )}

        {settings.perfectScrollbar && (
          <StyledScrollBarSidenav>
            {layout1Settings.topbar.show && !layout1Settings.topbar.fixed && (
              <ThemeProvider theme={topbarTheme}>
                <Layout1Topbar />
                <LayoutRestriccionV2 />
              </ThemeProvider>
            )}
            <Box flexGrow={1} position="relative">
              <MatxSuspense>
                <Outlet />
              </MatxSuspense>
            </Box>

            {settings.footer.show && !settings.footer.fixed && <Footer />}
          </StyledScrollBarSidenav>
        )}

        {!settings.perfectScrollbar && (
          <ContentBox>
            {layout1Settings.topbar.show && !layout1Settings.topbar.fixed && (
              <ThemeProvider theme={topbarTheme}>
                <Layout1Topbar />
                <LayoutRestriccionV2 />
              </ThemeProvider>
            )}

            <Box flexGrow={1} position="relative">
              <MatxSuspense>
                <Outlet />
              </MatxSuspense>
            </Box>

            {settings.footer.show && !settings.footer.fixed && <Footer />}
          </ContentBox>
        )}

        {settings.footer.show && settings.footer.fixed && <Footer />}
      </LayoutContainer>

      {/*settings.secondarySidebar.show && <SecondarySidebar/>*/}
    </Layout1Root>
    </CajasProvider>
  )
}

export default React.memo(Layout1)
