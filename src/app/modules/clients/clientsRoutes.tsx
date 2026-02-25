import { lazy } from 'react'

import { authRoles } from '../../../auth/authRoles'

const ClientsApp = lazy(() => import('./view/Clients'))

export const clientsRoutesMap = {
  clients: {
    path: '/clientes/gestion',
    name: 'Gestión de Clientes',
    action: 'GESTION_DE_CLIENTES',
  },
}

const clientsRoutes = [
  {
    path: clientsRoutesMap.clients.path,
    element: <ClientsApp />,
    auth: authRoles.admin,
  },
]

export default clientsRoutes
