import { lazy } from 'react'

import { authRoles } from '../../../../auth/authRoles'
import Loadable from '../../../base/components/Template/Loadable/Loadable'
import { cuentaRouteMap } from './CuentaRoutesMap'

const AppCuenta = Loadable(lazy(() => import('./view/Cuenta')))
const AppConfiguracion = Loadable(lazy(() => import('./view/Configuracion')))
/**
 * @author isi-template
 */
const cuentaRoutes = [
  {
    path: cuentaRouteMap.cuenta,
    element: <AppCuenta />,
    auth: authRoles.guest,
  },
  {
    path: cuentaRouteMap.configuracion,
    element: <AppConfiguracion />,
    auth: authRoles.admin,
  },
]

export default cuentaRoutes
