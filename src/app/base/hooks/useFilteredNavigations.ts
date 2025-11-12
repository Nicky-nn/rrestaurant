import { useMemo } from 'react'

import { NavigationProps } from '../../navigations'
import { buildPermissionFromEnv, hasPermission } from '../../utils/menuPermissionFilter'

/**
 * Opciones de configuración para el filtrado de navegaciones
 */
export interface FilterNavigationsOptions {
  userPermissions: string[]
  navigations: NavigationProps[]
  debug?: boolean

  /**
   * Si es true, permite acceso a items sin children vacíos después del filtrado
   * @default false
   */
  showEmptyParents?: boolean
}

export const useFilteredNavigations = ({
  userPermissions,
  navigations,
  debug = false,
  showEmptyParents = false,
}: FilterNavigationsOptions): NavigationProps[] => {
  return useMemo(() => {
    // Validaciones iniciales
    if (!userPermissions || userPermissions.length === 0) {
      if (debug) {
        console.warn('No hay permisos de usuario. Retornando menú vacío.')
      }
      return []
    }

    if (!navigations || navigations.length === 0) {
      return []
    }

    if (debug) {
      console.log('Iniciando filtrado de navegaciones...')
      console.log('Permisos del usuario:', userPermissions)
    }

    /**
     * Verifica si un item de navegación tiene permiso.
     * Delega la construcción de la clave a la utilidad `buildPermissionFromEnv`.
     */
    const checkItemPermission = (
      parentName: string | null,
      itemName: string,
    ): boolean => {
      if (!itemName) return false

      const permissionKey = buildPermissionFromEnv(parentName, itemName)
      const hasAccess = hasPermission(userPermissions, permissionKey)

      if (debug) {
        console.log(
          `${hasAccess ? 'SI:' : 'NO:'} [${permissionKey}] ${parentName ? `${parentName} > ` : ''
          }${itemName}`,
        )
      }

      return hasAccess
    }

    /**
     * Filtra una lista de items de navegación y a sus hijos recursivamente.
     */
    const filterItemsRecursively = (
      items: NavigationProps[],
      parentName: string | null = null,
    ): NavigationProps[] => {
      // Usamos reduce para filtrar y mapear en una sola pasada.
      return items.reduce((acc: NavigationProps[], item) => {
        // Caso 1: Items tipo 'label' siempre se muestran
        if (item.type === 'label') {
          acc.push(item)
          return acc
        }

        // Caso especial: Página Principal siempre se muestra
        const isHomePage =
          item.path === '/' ||
          item.name === 'Página Principal' ||
          item.name === 'Home' ||
          item.icon === 'home'

        if (isHomePage) {
          acc.push({ ...item, children: undefined })
          return acc
        }

        // Caso 2: Item con hijos (grupo)
        if (item.children && item.children.length > 0) {
          // Llamada recursiva para filtrar los hijos
          const filteredChildren = filterItemsRecursively(
            item.children,
            item.name, // El 'name' de este item es el 'parentName' de sus hijos
          )

          // Si quedan hijos, se mantiene el padre con sus hijos filtrados
          if (filteredChildren.length > 0) {
            acc.push({
              ...item,
              children: filteredChildren.map((child) => ({
                name: child.name,
                iconText: child.iconText || '',
                path: child.path || '',
              })),
            })
          }
          // Si no quedan hijos, pero `showEmptyParents` es true
          else if (showEmptyParents) {
            // FIX: Se crea una copia y se setea children a undefined
            // en lugar de usar ...rest, que elimina la propiedad.
            acc.push({ ...item, children: undefined })
          }
          // Si no, el padre se filtra (no se añade al acumulador)
          return acc
        }

        // Caso 3: Item sin hijos (link directo)
        // Verificamos su permiso
        if (checkItemPermission(parentName, item.name)) {
          // FIX: Se crea una copia y se setea children a undefined
          acc.push({ ...item, children: undefined })
        }

        // Si no cumple ninguna condición, el item se filtra (no se añade)
        return acc
      }, [])
    }

    // Ejecución
    const filtered = filterItemsRecursively(navigations)

    if (debug) {
      console.log('Navegaciones filtradas:', filtered)
    }

    return filtered
  }, [userPermissions, navigations, debug, showEmptyParents])
}
