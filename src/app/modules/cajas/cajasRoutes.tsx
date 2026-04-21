import { lazy } from 'react'

import { authRoles } from '../../../auth/authRoles'

const GestionCajasApp = lazy(() => import('./view/GestionCajas'))

export const cajasRoutesMap = {
  gestion: {
    path: '/cajas/gestion',
    name: 'Gestión de Cajas',
    action: 'GESTION_DE_CAJAS',
  },
}

const cajasRoutes = [
  {
    path: cajasRoutesMap.gestion.path,
    element: <GestionCajasApp />,
    auth: authRoles.admin,
  },
]

export default cajasRoutes
