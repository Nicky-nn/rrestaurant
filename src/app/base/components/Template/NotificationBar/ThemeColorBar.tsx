// noinspection DuplicatedCode

import { InvertColors } from '@mui/icons-material'
import {
  Badge,
  Box,
  Button,
  Card,
  Drawer,
  Icon,
  IconButton,
  styled,
  ThemeProvider,
  useTheme,
} from '@mui/material'
import { FC, Fragment, useState } from 'react'

import useSettings from '../../../hooks/useSettings'
import BadgeSelected from '../MatxCustomizer/BadgeSelected'
import { themeShadows } from '../MatxTheme/themeColors'
import { H5 } from '../Typography'
import StyledScrollBar from '../../Container/StyledScrollBar'

const MaxCustomaizer = styled('div')(({ theme }) => ({
  height: '100vh',
  width: 320,
  position: 'fixed',
  top: 0,
  right: 0,
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: '32px',
  boxShadow: themeShadows[12],
  background: theme.palette.background.default,
  '& .helpText': {
    margin: '0px .5rem 1rem',
  },
}))

const LayoutBox = styled(BadgeSelected)(() => ({
  width: '100%',
  height: '152px !important',
  cursor: 'pointer',
  marginTop: '12px',
  marginBottom: '12px',
  '& .layout-name': {
    display: 'none',
  },
  '&:hover .layout-name': {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    zIndex: 12,
  },
}))

const Controller = styled('div')(() => ({
  minHeight: 58,
  padding: '14px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
  boxShadow: themeShadows[6],
}))

const IMG = styled('img')(() => ({
  width: '100%',
}))

const StyledScrollBarSidenav = styled(StyledScrollBar)(() => ({
  paddingLeft: '1rem',
  paddingRight: '1rem',
  position: 'relative',
}))

/**
 * @author isi-template
 * @param container
 * @constructor
 */
const ThemeColorBar: FC<any> = ({ container }: any) => {
  const [open, setOpen] = useState(false)
  const [tabIndex, setTabIndex] = useState(0)
  const { settings, updateSettings }: any = useSettings()
  const theme = useTheme()
  const secondary = theme.palette.text.secondary

  const tooglePanel = () => {
    setOpen(!open)
  }

  const handleDrawerToggle = () => {
    setOpen(!open)
  }
  let activeTheme = { ...settings.themes[settings.activeTheme] }
  const { palette } = useTheme()
  const textColor = palette.text.primary
  return (
    <Fragment>
      <IconButton onClick={handleDrawerToggle}>
        <Badge color="secondary">
          <InvertColors sx={{ color: textColor }} />
        </Badge>
      </IconButton>

      <ThemeProvider theme={activeTheme}>
        <Drawer
          anchor={'right'}
          open={open}
          variant="temporary"
          onClose={tooglePanel}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <MaxCustomaizer>
            <Controller>
              <Box display="flex">
                <Icon className="icon" color="primary">
                  settings
                </Icon>
                <H5 sx={{ ml: 1, fontSize: '1rem' }}>Opciones de Tema</H5>
              </Box>
              <IconButton onClick={tooglePanel}>
                <Icon className="icon">close</Icon>
              </IconButton>
            </Controller>
            <StyledScrollBarSidenav >
              {tabIndex === 0 && (
                <Box sx={{ mb: 4, mx: 3 }}>
                  <Box sx={{ color: secondary }}>Layouts</Box>

                  <Box display="flex" flexDirection="column">
                    {demoLayouts.map((layout: any) => (
                      <LayoutBox
                        color="secondary"
                        badgeContent={'Pro'}
                        invisible={!layout.isPro}
                        key={layout.name}
                      >
                        <Card
                          sx={{
                            position: 'relative',
                          }}
                          onClick={() => updateSettings(layout.options)}
                          elevation={4}
                        >
                          <Box
                            sx={{
                              overflow: 'hidden',
                            }}
                            className="layout-name"
                          >
                            <Button variant="contained" color="secondary">
                              {layout.name}
                            </Button>
                          </Box>

                          <IMG src={layout.thumbnail} alt={layout.name} />
                        </Card>
                      </LayoutBox>
                    ))}
                  </Box>
                </Box>
              )}
            </StyledScrollBarSidenav>
          </MaxCustomaizer>
        </Drawer>
      </ThemeProvider>
    </Fragment>
  )
}

const demoLayouts = [
  {
    name: 'Tema Claro',
    thumbnail: '/assets/images/screenshots/layout1-customizer.png',
    isPro: false,
    options: {
      activeLayout: 'layout1',
      activeTheme: 'blue',
      layout1Settings: {
        leftSidebar: {
          mode: 'full',
          theme: 'whiteBlue',
          bgOpacity: 0.98,
        },
        topbar: {
          theme: 'blueDark',
          fixed: true,
        },
      },
      footer: {
        theme: 'slateDark1',
      },
    },
  },
  {
    name: 'Tema Compacto',
    thumbnail: '/assets/images/screenshots/layout5-customizer.png',
    isPro: false,
    options: {
      activeLayout: 'layout1',
      activeTheme: 'blue',
      layout1Settings: {
        leftSidebar: {
          mode: 'compact',
          theme: 'slateDark1',
          bgOpacity: 0.92,
        },
        topbar: {
          theme: 'whiteBlue',
          fixed: true,
        },
      },
    },
  },
  {
    name: 'Tema Oscuro',
    thumbnail: '/assets/images/screenshots/layout1-blue-customizer.png',
    isPro: false,
    options: {
      activeLayout: 'layout1',
      activeTheme: 'blue',
      layout1Settings: {
        leftSidebar: {
          mode: 'full',
          theme: 'slateDark1',
          bgOpacity: 0.92,
        },
        topbar: {
          theme: 'blueDark',
          fixed: true,
        },
      },
    },
  },
]

export default ThemeColorBar
