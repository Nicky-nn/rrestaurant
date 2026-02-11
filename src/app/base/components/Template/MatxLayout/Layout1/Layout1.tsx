import { Box, styled, ThemeProvider, useMediaQuery, useTheme } from '@mui/material'
import { BoxProps } from '@mui/material/Box'
import React, { useEffect, useRef } from 'react'
import Scrollbar from 'react-perfect-scrollbar'
import { Outlet } from 'react-router-dom'

import LayoutRestriccion from '../../../../../modules/base/components/LayoutRestriccion/LayoutRestriccion'
import { sidenavCompactWidth, sideNavWidth } from '../../../../../utils/constant'
import useSettings from '../../../../hooks/useSettings'
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

const StyledScrollBar = styled(Scrollbar)(() => ({
  height: '100%',
  position: 'relative',
  display: 'flex',
  flexGrow: '1',
  flexDirection: 'column',
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
  // @ts-ignore
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
    let { settings } = ref.current
    let sidebarMode = settings.layout1Settings.leftSidebar.mode
    if (settings.layout1Settings.leftSidebar.show) {
      let mode = isMdScreen ? 'close' : sidebarMode
      updateSettings({
        layout1Settings: {
          leftSidebar: { ...layout1Settings.leftSidebar, mode },
          topbar: layout1Settings.topbar,
        },
      })
    }
  }, [isMdScreen])

  return (
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
            </ThemeProvider>
          </>
        )}

        {settings.perfectScrollbar && (
          <StyledScrollBar>
            {layout1Settings.topbar.show && !layout1Settings.topbar.fixed && (
              <ThemeProvider theme={topbarTheme}>
                <Layout1Topbar />
              </ThemeProvider>
            )}
            <Box flexGrow={1} position="relative">
              <MatxSuspense>
                <Outlet />
              </MatxSuspense>
            </Box>

            {settings.footer.show && !settings.footer.fixed && <Footer />}
          </StyledScrollBar>
        )}

        {!settings.perfectScrollbar && (
          <ContentBox>
            {layout1Settings.topbar.show && !layout1Settings.topbar.fixed && (
              <ThemeProvider theme={topbarTheme}>
                <Layout1Topbar />
                <LayoutRestriccion />
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
  )
}

export default React.memo(Layout1)
