import { styled } from '@mui/material'
import { FC, Fragment, JSX } from 'react'
import Scrollbar from 'react-perfect-scrollbar'

import { navigations } from '../../../../navigations'
import useSettings from '../../../hooks/useSettings'
import MatxVerticalNav from '../MatxVerticalNav/MatxVerticalNav'

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
const Sidenav: FC<any> = ({ children }: SidenavProps) => {
  const { settings, updateSettings }: any = useSettings()

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
        <MatxVerticalNav items={navigations} />
      </StyledScrollBar>

      <SideNavMobile onClick={() => updateSidebarMode({ mode: 'close' })} />
    </Fragment>
  )
}

export default Sidenav
