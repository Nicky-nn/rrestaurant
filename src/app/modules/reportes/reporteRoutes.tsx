import { lazy } from 'react'

import { authRoles } from '../../../auth/authRoles'

const VentasArticuloPuntoVentaApp = lazy(() => import('./view/VentasArticuloPuntoVenta'))
const VentasArticuloComercioApp = lazy(() => import('./view/VentasArticuloComercio'))
const ReportePedidosSospechososApp = lazy(
  () => import('./view/ReportePedidosSospechosos'),
)

export const reporteRoutesMap = {
  articuloPorPuntoVenta: {
    path: '/reporte/ventas-articulo-punto-venta',
    name: 'Artículos por P. V.',
  },
  articuloPorComercio: {
    path: '/reporte/ventas-articulo-comercio',
    name: 'Artículos por Sucursal',
  },
  pedidosSospechosos: {
    path: '/reporte/pedidos-sospechosos',
    name: 'Pedidos Observados',
  },
  arqueoCaja: {
    path: '/reporte/arqueo-caja',
    name: 'Arqueos de Caja',
  },
}

const reporteRoutes = [
  {
    path: reporteRoutesMap.articuloPorPuntoVenta.path,
    element: <VentasArticuloPuntoVentaApp />,
    auth: authRoles.admin,
  },
  {
    path: reporteRoutesMap.articuloPorComercio.path,
    element: <VentasArticuloComercioApp />,
    auth: authRoles.admin,
  },
  {
    path: reporteRoutesMap.pedidosSospechosos.path,
    element: <ReportePedidosSospechososApp />,
    auth: authRoles.admin,
  },
]

export default reporteRoutes
