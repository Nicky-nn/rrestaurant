import { Navigate } from 'react-router-dom'

import AuthGuard from '../../auth/AuthGuard'
import MatxLayout from '../base/components/Template/MatxLayout/MatxLayout'
import adsRoutes from '../modules/ads/adsRoutes'
import cuentaRoutes from '../modules/base/cuenta/CuentaRoutes'
import NotFound from '../modules/base/sessions/NotFound'
import sessionRoutes from '../modules/base/sessions/SessionRoutes'
import cajasRoutes from '../modules/cajas/cajasRoutes'
import clientsRoutes from '../modules/clients/clientsRoutes'
import homeRoutes, { homeRoutesMap } from '../modules/home/HomeRoutes'
import impresorasRoutes from '../modules/impresoras/impresorasRoutes'
import ncdGestionRoutes from '../modules/notaCreditoDebito/notaCreditoDebitoRoutes'
import reporteRoutes from '../modules/reporte/reporteRoutes'
import restaurantRoutes from '../modules/restaurante/restauranteRoutes'
import ecommerceRoutes from '../modules/ecommerce/ecommerceRoutes'

export const appRoutes = [
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      ...homeRoutes,
      ...cuentaRoutes,
      ...adsRoutes,
      ...cajasRoutes,
      ...clientsRoutes,
      ...restaurantRoutes,
      ...impresorasRoutes,
      ...reporteRoutes,
      ...ncdGestionRoutes,
      ...ecommerceRoutes,
    ],
  },
  ...sessionRoutes,
  { path: '/', element: <Navigate to={homeRoutesMap.home.path} /> },
  { path: '*', element: <NotFound /> },
]
