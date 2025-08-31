import {
  DisplaySettings,
  Menu,
  PowerSettingsNew,
  Settings,
  ShoppingBag,
  Store,
  Storefront,
} from '@mui/icons-material'
import {
  Avatar,
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
import React, { FC, useState } from 'react'
import { Link } from 'react-router-dom'

import { cuentaRouteMap } from '../../../../../modules/base/cuenta/CuentaRoutesMap'
import { topBarHeight } from '../../../../../utils/constant'
import { NotificationProvider } from '../../../../contexts/NotificationContext'
import useAuth from '../../../../hooks/useAuth'
import useSettings from '../../../../hooks/useSettings'
import MatxMenu from '../../MatxMenu/MatxMenu'
import { themeShadows } from '../../MatxTheme/themeColors'
import NotificationBar from '../../NotificationBar/NotificationBar'
import { Span } from '../../Typography'

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
}))

const TopbarRoot = styled('div')(() => ({
  top: 0,
  zIndex: 96,
  transition: 'all 0.3s ease',
  boxShadow: themeShadows[8],
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
  background: theme.palette.background.default,
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
  const { logout, user }: any = useAuth()
  const isMdScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

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
                <Chip
                  size={'small'}
                  icon={<Storefront />}
                  color={'success'}
                  label={'Producción'}
                />
              ) : (
                <Chip
                  size={'small'}
                  icon={<Storefront />}
                  color={'warning'}
                  label={'Piloto'}
                />
              )}
            </Tooltip>
          </StyledIconButton>
        </Box>
        <Box display="flex" alignItems="center">
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
                <Avatar src={user.avatar} sx={{ cursor: 'pointer', ml: 1 }} />
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
