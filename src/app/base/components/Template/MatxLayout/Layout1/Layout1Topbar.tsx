import {
  DarkMode,
  DisplaySettings,
  LightMode,
  Menu,
  PowerSettingsNew,
  Settings,
  ShoppingBag,
  Store,
  Storefront,
} from '@mui/icons-material'
import {
  Avatar,
  Badge,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Popover,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { sha256 } from 'js-sha256'
import React, { FC, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { cuentaRouteMap } from '../../../../../modules/base/cuenta/CuentaRoutesMap'
import { topBarHeight } from '../../../../../utils/constant'
import { NotificationProvider } from '../../../../contexts/NotificationContext'
import useAuth from '../../../../hooks/useAuth'
import useSettings from '../../../../hooks/useSettings'
import MatxMenu from '../../MatxMenu/MatxMenu'
import NotificationBar from '../../NotificationBar/NotificationBar'
import { Span } from '../../Typography'

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&.MuiBadge-anchorOriginTopRightCircular': {
      top: '0',
      right: '0',
    },
  },
}))
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
}))

const TopbarRoot = styled('div')(() => ({
  top: 0,
  zIndex: 96,
  transition: 'all 0.3s ease',
  // boxShadow: themeShadows[8],
  height: topBarHeight,
}))

const TopbarContainer = styled(Box)(({ theme }) => ({
  padding: '8px',
  paddingLeft: 18,
  paddingRight: 20,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: theme.palette.background.paper,
  [theme.breakpoints.down('sm')]: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  [theme.breakpoints.down('xs')]: {
    paddingLeft: 14,
    paddingRight: 16,
  },
}))

const UserMenu = styled(Box)({
  padding: 4,
  display: 'flex',
  borderRadius: 24,
  cursor: 'pointer',
  alignItems: 'center',
  '& span': { margin: '0 8px' },
})

const StyledItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  minWidth: 185,
  '& a': {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  '& span': {
    marginRight: '10px',
    color: theme.palette.text.primary,
  },
}))

const IconBox = styled('div')(({ theme }) => ({
  display: 'inherit',
  [theme.breakpoints.down('md')]: {
    display: 'none !important',
  },
}))

/**
 * @description Layout top principal
 * @author isi-template
 * @constructor
 */
const Layout1Topbar: FC<any> = () => {
  const theme = useTheme()
  const { settings, updateSettings }: any = useSettings()
  const { logout, user, updateTheme }: any = useAuth()
  const isMdScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  // Función para generar el hash SHA256 del email (como indica la documentación de Gravatar)
  const getGravatarUrl = (email: string, size: number = 80): string => {
    const normalizedEmail = email?.trim().toLowerCase() || 'usuario@email.com'
    const hash = sha256(normalizedEmail)
    // Usar robohash como tipo de imagen por defecto
    return `https://gravatar.com/avatar/${hash}?s=${size}&d=robohash&r=x`
  }

  const updateSidebarMode = (sidebarSettings: any) => {
    updateSettings({
      layout1Settings: {
        leftSidebar: {
          ...sidebarSettings,
        },
      },
    })
  }

  const handleSidebarToggle = () => {
    const { layout1Settings } = settings
    let mode
    if (isMdScreen) {
      mode = layout1Settings.leftSidebar.mode === 'close' ? 'mobile' : 'close'
    } else {
      mode = layout1Settings.leftSidebar.mode === 'full' ? 'close' : 'full'
    }
    updateSidebarMode({ mode })
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const darkModeButtonRef = useRef<HTMLButtonElement>(null)

  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const isNight = settings.mode === 'dark'
    const newMode = isNight ? 'light' : 'dark'

    const applyTheme = () => {
      updateTheme(newMode)
      localStorage.setItem('nightMode', (!isNight).toString())
    }

    if (!('startViewTransition' in document)) {
      applyTheme()
      return
    }

    const btn = event.currentTarget
    const rect = btn.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    const transition = document.startViewTransition(applyTheme)

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 380,
          easing: 'ease-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <TopbarRoot>
      <TopbarContainer>
        <Box display="flex">
          <StyledIconButton onClick={handleSidebarToggle}>
            <Menu>Menu</Menu>
          </StyledIconButton>
          <IconBox>
            <StyledIconButton>
              <Tooltip title={import.meta.env.ISI_TITLE || ''}>
                <Chip
                  size={'small'}
                  icon={<ShoppingBag />}
                  color={'primary'}
                  variant={'outlined'}
                  label={import.meta.env.ISI_SIGLA || ''}
                />
              </Tooltip>
            </StyledIconButton>
          </IconBox>
          <IconBox>
            <StyledIconButton>
              <Tooltip title="Comercio">
                <Chip
                  icon={<Store />}
                  size={'small'}
                  variant={'outlined'}
                  color={'info'}
                  label={user.miEmpresa.tienda}
                  onClick={(event: any) => handleClick(event)}
                  aria-describedby={id}
                />
              </Tooltip>
            </StyledIconButton>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <Box sx={{ p: 2, maxWidth: '80%' }}>
                <Typography gutterBottom>
                  URL Comercio: <strong>{user.miEmpresa.tienda}</strong>
                </Typography>
                <Typography gutterBottom>
                  Rol: <strong>{user.rol}</strong>
                </Typography>
                <Typography gutterBottom>
                  <strong>ACCESOS PERMITIDOS</strong>
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateRows: 'repeat(2, 1fr)', pl: 1 }}>
                  {user.dominio.map((d: string) => (
                    <Typography variant={'body2'} key={d}>
                      {d}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Popover>
          </IconBox>
          <StyledIconButton>
            <Tooltip title="Ambiente">
              {user.miEmpresa.codigoAmbiente === 1 ? (
                <Chip size={'small'} icon={<Storefront />} color={'success'} label={'Producción'} />
              ) : (
                <Chip size={'small'} icon={<Storefront />} color={'warning'} label={'Piloto'} />
              )}
            </Tooltip>
          </StyledIconButton>
        </Box>
        <Box display="flex" alignItems="center">
          <IconButton
            ref={darkModeButtonRef}
            aria-label="Cambio modo oscuro/claro"
            onClick={handleThemeToggle}
          >
            {settings.mode === 'dark' ? <DarkMode /> : <LightMode />}
          </IconButton>
          {/*<UxModoMenu*/}
          {/*  value={user.uxModo}*/}
          {/*  onChange={(modo) => {*/}
          {/*    // refreshUser()*/}
          {/*  }}*/}
          {/*/>*/}
          <NotificationProvider>
            <NotificationBar />
          </NotificationProvider>
          {/*<ThemeColorBarProvider>
            <ThemeColorBar />
          </ThemeColorBarProvider>*/}

          <MatxMenu
            menuButton={
              <UserMenu>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Span>
                    Hola <strong>{user.nombres} </strong>
                  </Span>
                </Box>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar
                    sx={{
                      cursor: 'pointer',
                      width: 36,
                      height: 36,
                      border: `2px solid ${theme.palette.primary.main}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: theme.shadows[4],
                      },
                    }}
                    src={getGravatarUrl(
                      user.correo || user.email || user.username || 'usuario@email.com',
                      80,
                    )}
                  />
                </StyledBadge>
              </UserMenu>
            }
          >
            <StyledItem>
              <Link to={cuentaRouteMap.cuenta}>
                <Settings> settings </Settings> &nbsp;&nbsp;
                <Span> Opciones de Sistema </Span>
              </Link>
            </StyledItem>
            <StyledItem>
              <Link to={cuentaRouteMap.configuracion}>
                <DisplaySettings> settings </DisplaySettings> &nbsp;&nbsp;
                <Span> Configuración </Span>
              </Link>
            </StyledItem>
            <StyledItem onClick={() => logout()}>
              <PowerSettingsNew> power_settings_new </PowerSettingsNew> &nbsp;&nbsp;
              <Span> Cerrar Sesión </Span>
            </StyledItem>
          </MatxMenu>
        </Box>
      </TopbarContainer>
    </TopbarRoot>
  )
}

export default React.memo(Layout1Topbar)
