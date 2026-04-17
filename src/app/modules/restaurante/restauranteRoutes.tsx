import { lazy } from 'react'

import { authRoles } from '../../../auth/authRoles'

const RestRegistroApp = lazy(() => import('./view/RestRegistrar'))
const RestGestionApp = lazy(() => import('./view/RestGestion'))
const RestFacturasApp = lazy(() => import('./view/RestFacturas'))

export const restauranteRoutesMap = {
  registro: {
    path: '/pedidos/registrar',
    name: 'Registrar Pedido',
    action: 'REGISTRAR_PEDIDO',
  },
  gestion: {
    path: '/pedidos/gestion',
    name: 'Gestión de Pedidos',
    action: 'GESTION_DE_PEDIDOS',
  },
  facturas: {
    path: '/pedidos/facturas',
    name: 'Gestión de Facturas',
    action: 'GESTION_DE_FACTURAS',
  },
}

const restaurantRoutes = [
  {
    path: restauranteRoutesMap.registro.path,
    element: <RestRegistroApp />,
    auth: authRoles.admin,
  },
  {
    path: restauranteRoutesMap.gestion.path,
    element: <RestGestionApp />,
    auth: authRoles.admin,
  },
  {
    path: restauranteRoutesMap.facturas.path,
    element: <RestFacturasApp />,
    auth: authRoles.admin,
  },
]

export default restaurantRoutes
