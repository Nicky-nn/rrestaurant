import { Box, styled, ThemeProvider, useMediaQuery, useTheme } from '@mui/material'
import { BoxProps } from '@mui/material/Box'
import React, { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useGlobalPendingOrders } from '../../../../../modules/ecommerce/hooks/useGlobalPendingOrders'

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

  const { pendingCount } = useGlobalPendingOrders()
  const navigate = useNavigate()

  // Obtener la ubicación actual
  const location = useLocation()
  const isPedidosRegistrarPage =
    location.pathname === '/pedidos/registrar' || location.pathname.startsWith('/pedidos/registrar#')

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

  const theme = useTheme()
  const isMdScreen = useMediaQuery(theme.breakpoints.down('md'))
  const isCocina = location.pathname === '/cocina'
  const sidenavWidth = isCocina ? '0px' : getSidenavWidth()

  const ref = useRef({ isMdScreen, settings })
  const layoutClasses = `theme-${theme.palette.primary}`

  // Estilo condicional para StyledScrollBar y ContentBox
  const restrictedScrollStyle = isPedidosRegistrarPage
    ? {
        height: '100vh',
        overflow: 'hidden',
        [theme.breakpoints.down('md')]: {
          overflow: 'auto',
        },
      }
    : {}

  useEffect(() => {
    let { settings } = ref.current
    let sidebarMode = settings.layout1Settings.leftSidebar.mode
    if (settings.layout1Settings.leftSidebar.show) {
      let mode = isMdScreen ? 'close' : sidebarMode
      updateSettings({ layout1Settings: { leftSidebar: { mode } } })
    }
  }, [isMdScreen])

  useEffect(() => {
    if (isPedidosRegistrarPage) {
      updateSettings({ layout1Settings: { leftSidebar: { mode: 'compact' } } })
    }
  }, [location.pathname])

  // Efecto para resetear el scroll cuando se navega a /pedidos/registrar
  useEffect(() => {
    if (isPedidosRegistrarPage) {
      // Función para resetear scroll más agresivamente
      const resetScrollAggressively = () => {
        // Resetear scroll del documento principal
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
        window.scrollTo(0, 0)

        // Buscar y resetear todos los posibles contenedores de scroll
        const scrollElements = document.querySelectorAll(
          '.scrollbar-container, .ps, .ps__rail-y, .ps__thumb-y, .MuiBox-root, [class*="scroll"], [class*="Layout"], .layout-container',
        )
        scrollElements.forEach((element: any) => {
          if (element.scrollTo) {
            element.scrollTo(0, 0)
          }
          if (element.scrollTop !== undefined) {
            element.scrollTop = 0
          }
          if (element.scrollLeft !== undefined) {
            element.scrollLeft = 0
          }
        })
      }

      // Ejecutar múltiples veces con diferentes delays para asegurar el reset
      resetScrollAggressively()
      const timer1 = setTimeout(resetScrollAggressively, 10)
      const timer2 = setTimeout(resetScrollAggressively, 100)
      const timer3 = setTimeout(resetScrollAggressively, 300)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isPedidosRegistrarPage, location.pathname])

  return (
    <CajasProvider>
      <Layout1Root className={layoutClasses}>
        {!isCocina && showSidenav && sidenavMode !== 'close' && (
          <SidenavTheme>
            <Layout1Sidenav />
          </SidenavTheme>
        )}

        <LayoutContainer width={sidenavWidth} open={secondarySidebar.open}>
          {pendingCount > 0 && (
            <Box
              sx={{
                width: '100%',
                bgcolor: '#f57c00', // Striking but not too aggressive orange/amber
                color: 'white',
                p: 1.5,
                textAlign: 'center',
                fontWeight: 'bold',
                cursor: 'pointer',
                zIndex: 999,
                '&:hover': {
                  bgcolor: '#ef6c00'
                }
              }}
              onClick={() => navigate('/ecommerce')}
            >
              Tienes {pendingCount} pedido{pendingCount === 1 ? '' : 's'} en el ecommerce esperando por ser preparado{pendingCount === 1 ? '' : 's'}. Haz clic aquí para ir a Ecommerce.
            </Box>
          )}

          {!isCocina && layout1Settings.topbar.show && layout1Settings.topbar.fixed && (
            <>
              <ThemeProvider theme={topbarTheme}>
                <Layout1Topbar fixed={true} className="elevation-z8" pendingCount={pendingCount} />
                <LayoutRestriccionV2 />
              </ThemeProvider>
            </>
          )}

          {settings.perfectScrollbar && (
            <StyledScrollBarSidenav>
              {!isCocina && layout1Settings.topbar.show && !layout1Settings.topbar.fixed && (
                <ThemeProvider theme={topbarTheme}>
                  <Layout1Topbar pendingCount={pendingCount} />
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
              {!isCocina && layout1Settings.topbar.show && !layout1Settings.topbar.fixed && (
                <ThemeProvider theme={topbarTheme}>
                  <Layout1Topbar pendingCount={pendingCount} />
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
