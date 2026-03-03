import { clientsRoutesMap } from './modules/clients/clientsRoutes'
import { homeRoutesMap } from './modules/home/HomeRoutes'
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
        name: restauranteRoutesMap.gestion.name,
        iconText: 'PG',
        path: restauranteRoutesMap.gestion.path,
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
