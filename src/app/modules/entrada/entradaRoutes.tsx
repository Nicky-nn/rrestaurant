import { OperacionesProvider } from '../../base/contexts/OperacionesContext.tsx'
import { authRoles } from '../../../auth/authRoles.ts'
import { lazy } from 'react'
import Loadable from '../../base/components/Template/Loadable/Loadable.tsx'

const EntradaGestionApp = Loadable(lazy(() => import('./view/EntradaGestion.tsx')))
const EntradaRegistroRapidoApp = Loadable(lazy(() => import('./view/EntradaRegistroRapido.tsx')))

export const entradaRoutesMap = {
  gestion: {
    path: '/entrada/gestion',
    name: 'Rápida',
    action: 'RAPIDA',
  },
  registro: {
    path: '/entrada/registro-rapido',
    name: 'Nueva entrada rápida',
    action: 'NUEVO',
  },
}

const entradaRoutes = [
  {
    path: entradaRoutesMap.gestion.path,
    element: (
      <OperacionesProvider>
        <EntradaGestionApp />
      </OperacionesProvider>
    ),
    auth: authRoles.admin,
  },
  {
    path: entradaRoutesMap.registro.path,
    element: (
      <OperacionesProvider>
        <EntradaRegistroRapidoApp />
      </OperacionesProvider>
    ),
    auth: authRoles.admin,
  },
]

export default entradaRoutes
