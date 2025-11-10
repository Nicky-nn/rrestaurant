import { styled } from '@mui/material'
import { FC, Fragment, JSX } from 'react'
import Scrollbar from 'react-perfect-scrollbar'

import { navigations } from '../../../../navigations'
import useSettings from '../../../hooks/useSettings'
import MatxVerticalNav from '../MatxVerticalNav/MatxVerticalNav'
import { useMisRolesPermisoDominio } from '../../../hooks/useMisRolesPermisoDominio'
import { useFilteredNavigations } from '../../../hooks/useFilteredNavigations'
import useAuth from '../../../hooks/useAuth'

const StyledScrollBar: FC<any> = styled(Scrollbar)(() => ({
  paddingLeft: '1rem',
  paddingRight: '1rem',
  position: 'relative',
}))

const SideNavMobile = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: '100vw',
  background: 'rgba(0, 0, 0, 0.54)',
  zIndex: -1,
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}))

type SidenavProps = {
  children: JSX.Element
}
/**
 * @author isi-template
 * @param children
 * @constructor
 */
const Sidenav: FC<any> = ({ children }: SidenavProps) => {
  const { user } = useAuth()
  const { settings, updateSettings }: any = useSettings()
  const { permisos } = useMisRolesPermisoDominio()

  // Verificar si el usuario es administrador
  const isAdmin =
    user.rol &&
    ['administrador', 'admin', 'adm'].some((adminRole) =>
      user.rol.toLowerCase().includes(adminRole),
    )

  // Si es administrador, usar todas las navegaciones sin filtrar
  // Si no, filtrar por permisos
  const filteredNavigations = isAdmin
    ? navigations
    : useFilteredNavigations({
      userPermissions: permisos,
      navigations,
      debug: false,
    })

  const updateSidebarMode = (sidebarSettings: any) => {
    let activeLayoutSettingsName = settings.activeLayout + 'Settings'
    let activeLayoutSettings = settings[activeLayoutSettingsName]


    updateSettings({
      ...settings,
      [activeLayoutSettingsName]: {
        ...activeLayoutSettings,
        leftSidebar: {
          ...activeLayoutSettings.leftSidebar,
          ...sidebarSettings,
        },
      },
    })
  }

  return (
    <Fragment>
      <StyledScrollBar options={{ suppressScrollX: true }}>
        {children}
        <MatxVerticalNav items={filteredNavigations} />
      </StyledScrollBar>

      <SideNavMobile onClick={() => updateSidebarMode({ mode: 'close' })} />
    </Fragment>
  )
}

export default Sidenav
