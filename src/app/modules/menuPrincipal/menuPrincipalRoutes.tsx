import { lazy } from 'react'

import { authRoles } from '../../../auth/authRoles'
import Loadable from '../../base/components/Template/Loadable/Loadable'

const Analytics = Loadable(lazy(() => import('./menuPrincipal')))

export const menuPrincipalRoutesMap = {
  home: {
    path: '/menuPrincipal',
    name: 'Menu Principal',
  },
}

/**
 * Estructura de ruta para cargar la página principal
 */
const menuPrincipalRoutes = [
  {
    path: menuPrincipalRoutesMap.home.path,
    element: <Analytics />,
    auth: authRoles.admin,
  },
]

export default menuPrincipalRoutes
