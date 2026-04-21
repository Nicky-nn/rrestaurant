import { cajasRoutesMap } from './modules/cajas/cajasRoutes'
import { clientsRoutesMap } from './modules/clients/clientsRoutes'
import { homeRoutesMap } from './modules/home/HomeRoutes'
import { impresorasRoutesMap } from './modules/impresoras/impresorasRoutes'
import { reporteRoutesMap } from './modules/reporte/reporteRoutes'
import { restauranteRoutesMap } from './modules/restaurante/restauranteRoutes'

export interface NavigationProps {
  name: string
  path?: string
  icon?: any
  iconText?: string
  label?: string
  type?: string
  badge?: { value: string; color: string }
  children?: Array<{
    name: string
    icon?: string
    iconText: string
    path: string
  }>
}

export const navigations: NavigationProps[] = [
  {
    name: homeRoutesMap.home.name,
    icon: 'dashboard',
    path: homeRoutesMap.home.path,
  },
  {
    name: 'Ventas y Pedidos',
    icon: 'shopping_cart',
    children: [
      {
        name: restauranteRoutesMap.registro.name,
        iconText: 'PR',
        path: restauranteRoutesMap.registro.path,
      },
      {
        name: restauranteRoutesMap.gestion.name,
        iconText: 'PG',
        path: restauranteRoutesMap.gestion.path,
      },
      {
        name: restauranteRoutesMap.facturas.name,
        iconText: 'FA',
        path: restauranteRoutesMap.facturas.path,
      },
    ],
  },
  {
    name: 'Cajas',
    icon: 'point_of_sale',
    children: [
      {
        name: cajasRoutesMap.gestion.name,
        iconText: 'GC',
        path: cajasRoutesMap.gestion.path,
      },
    ],
  },
  {
    name: 'Clientes',
    icon: 'person',
    children: [
      {
        name: clientsRoutesMap.clients.name,
        icon: '',
        iconText: 'CL',
        path: clientsRoutesMap.clients.path,
      },
    ],
  },
  {
    name: 'Reportes',
    icon: 'bar_chart',
    children: [
      {
        name: 'Artículos por PV',
        iconText: 'APV',
        path: reporteRoutesMap.articuloPorPuntoVenta.path,
      },
      {
        name: 'Artículos por Sucursal',
        iconText: 'APS',
        path: reporteRoutesMap.articuloPorComercio.path,
      },
      {
        name: 'Pedidos Observados',
        iconText: 'PO',
        path: reporteRoutesMap.pedidosSospechosos.path,
      },
    ],
  },
  {
    name: 'Impresoras',
    icon: 'print',
    children: [
      {
        name: impresorasRoutesMap.gestion.name,
        iconText: 'IM',
        path: impresorasRoutesMap.gestion.path,
      },
    ],
  },
]

/*
// Ejemplo de estructura con Hijos
  {
    name: 'Configuración',
    icon: 'settings',
    children: [
      {
        name: configuracionRoutesMap.parametrosSistema.name,
        iconText: 'PSI',
        path: configuracionRoutesMap.parametrosSistema.path,
      },
    ],
  }
*/
