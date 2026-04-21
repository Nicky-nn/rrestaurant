import { clientsRoutesMap } from './modules/clients/clientsRoutes'
import { homeRoutesMap } from './modules/home/HomeRoutes'
import { impresorasRoutesMap } from './modules/impresoras/impresorasRoutes'
import { ncdGestionRoutesMap } from './modules/notaCreditoDebito/notaCreditoDebitoRoutes'
import { reporteRoutesMap } from './modules/reportes/reporteRoutes'
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
        iconText: 'PF',
        path: restauranteRoutesMap.facturas.path,
      }
    ],
  },
  {
    name: 'Notas de Credito/Debito',
    icon: 'receipt',
    children: [
      {
        name: ncdGestionRoutesMap.ncdGestion.name,
        iconText: 'NG',
        path: ncdGestionRoutesMap.ncdGestion.path,
      }
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
    icon: 'receipt',
    children: [
      {
        name: reporteRoutesMap.articuloPorComercio.name,
        iconText: 'AP',
        path: reporteRoutesMap.articuloPorComercio.path,
      },
      {
        name: reporteRoutesMap.articuloPorPuntoVenta.name,
        iconText: 'APV',
        path: reporteRoutesMap.articuloPorPuntoVenta.path,
      },
      {
        name: reporteRoutesMap.pedidosSospechosos.name,
        iconText: 'NG',
        path: reporteRoutesMap.pedidosSospechosos.path,
      }
    ],
  },
  {
    name:'Impresoras',
    icon:'print',
    children:[
      {
        name: impresorasRoutesMap.gestion.name,
        iconText: 'IP',
        path: impresorasRoutesMap.gestion.path,
      },
    ]
  }
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
