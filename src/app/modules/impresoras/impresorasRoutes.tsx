import { lazy } from 'react'

import { authRoles } from '../../../auth/authRoles'

const ListImpresoras = lazy(() => import('./view/ListImpresoras/ListImpresoras'))

export const impresorasRoutesMap = {
  gestion: {
    path: '/impresoras/gestion',
    name: 'Gestión de Impresoras',
    action: 'GESTION_DE_IMPRESORAS',
  },
}

const impresorasRoutes = [
  {
    path: impresorasRoutesMap.gestion.path,
    element: <ListImpresoras />,
    auth: authRoles.admin,
  },
]

export default impresorasRoutes
