import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { navigations } from '../../navigations'
import { useBreadcrumb } from '../contexts/BreadcrumbContext'

/**
 * Hook que detecta automáticamente el menú raíz de cualquier página
 * INCLUSO si no tiene componente <Breadcrumb />
 * @author isi-template 2026.1 para rol dominio
 */
export const useBreadcrumbDetector = () => {
  const location = useLocation()
  const { setCurrentPath, setRootMenu, setFullHierarchy } = useBreadcrumb()

  useEffect(() => {
    setCurrentPath(location.pathname)

    const currentPath = location.pathname.startsWith('/') ? location.pathname : `/${location.pathname}`

    // Función recursiva para buscar en cualquier nivel de profundidad
    const searchInChildren = (
      children: any[],
      parentMenu: string,
      parentIcon: string,
      breadcrumbTrail: string[] = [],
    ): { trail: string[] } | null => {
      if (!children || children.length === 0) return null

      for (const child of children) {
        const childPath = child.path ? (child.path.startsWith('/') ? child.path : `/${child.path}`) : null

        const currentTrail = [...breadcrumbTrail, child.name]

        // Si encontramos el path en este nivel
        if (childPath === currentPath) {
          return {
            trail: [parentMenu, ...currentTrail],
          }
        }

        // Si tiene hijos, buscar recursivamente
        if (child.children && child.children.length > 0) {
          const found = searchInChildren(child.children, parentMenu, parentIcon, currentTrail)
          if (found) return found
        }
      }
      return null
    }

    // Buscar en todos los menús raíz
    for (const menuItem of navigations) {
      // Si el menu tiene hijos, verificar recursivamente
      if (menuItem.children && menuItem.children.length > 0) {
        const found = searchInChildren(menuItem.children, menuItem.name, menuItem.icon || '')
        if (found) {
          setRootMenu(menuItem.name)
          setFullHierarchy(found.trail)
          // console.log('Ruta:', found.trail.join(' → '))
          return
        }
      }
      // Si el menu no tiene hijos y coincide con la ruta
      else if (menuItem.path) {
        const menuPath = menuItem.path.startsWith('/') ? menuItem.path : `/${menuItem.path}`
        if (menuPath === currentPath) {
          setRootMenu(menuItem.name)
          setFullHierarchy([menuItem.name])
          // console.log('Ruta:', menuItem.name)
          return
        }
      }
    }
    // eslint-disable-next-line
  }, [location.pathname])
}
