import { lazy } from 'react'

import { authRoles } from '../../../auth/authRoles'

const NCDGestionApp = lazy(() => import('./view/NCDGestion'))
const NCDRegistroApp = lazy(() => import('./view/NCDRegistro'))

export const ncdGestionRoutesMap = {
  ncdGestion: {
    path: '/notaCreditoDebito/gestion',
    name: 'Gestión de Notas',
  },
  ncdRegistro: {
    path: '/notaCreditoDebito/registro',
    name: 'Nueva Nota',
  },
}

const ncdGestionRoutes = [
  {
    path: ncdGestionRoutesMap.ncdGestion.path,
    element: <NCDGestionApp />,
    auth: authRoles.admin,
  },
  {
    path: ncdGestionRoutesMap.ncdRegistro.path,
    element: <NCDRegistroApp />,
    auth: authRoles.admin,
  },
]

export default ncdGestionRoutes
