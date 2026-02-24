import { Navigate } from 'react-router-dom'

import AuthGuard from '../../auth/AuthGuard'
import MatxLayout from '../base/components/Template/MatxLayout/MatxLayout'
import cuentaRoutes from '../modules/base/cuenta/CuentaRoutes'
import NotFound from '../modules/base/sessions/NotFound'
import sessionRoutes from '../modules/base/sessions/SessionRoutes'
import homeRoutes, { homeRoutesMap } from '../modules/home/HomeRoutes'

export const appRoutes = [
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [...homeRoutes, ...cuentaRoutes],
  },
  ...sessionRoutes,
  { path: '/', element: <Navigate to={homeRoutesMap.home.path} /> },
  { path: '*', element: <NotFound /> },
]
