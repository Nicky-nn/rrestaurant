import { clientsRoutesMap } from './modules/clients/clientsRoutes'
import { homeRoutesMap } from './modules/home/HomeRoutes'

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
