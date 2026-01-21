import React, { createContext, FC, ReactNode, useContext, useMemo } from 'react'

import { normalizeString } from '../../utils/menuPermissionFilter.ts'
import useAuth from '../hooks/useAuth.ts'
import { useMisRolesPermisoDominio } from '../hooks/useMisRolesPermisoDominio.ts'
import { useBreadcrumb } from './BreadcrumbContext'

interface SecurityContextProps {
  /**
   * Verifica si el usuario tiene permiso para realizar una acción específica
   * basándose en la jerarquía actual (breadcrumb o ruta)
   */
  hasActionPermission: (_action: string) => boolean

  /**
   * Verifica si el usuario tiene un permiso estático específico
   * sin usar la jerarquía automática
   */
  hasStaticPermission: (_staticPermission: string) => boolean

  /**
   * Permisos completos del usuario normalizados
   */
  userPermissions: Set<string>

  /**
   * Indica si los permisos están cargando
   */
  loading: boolean
}

const SecurityContext = createContext<SecurityContextProps | undefined>(undefined)

export const SecurityProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { permisos, loading } = useMisRolesPermisoDominio()
  const { fullHierarchy } = useBreadcrumb()
  const { user } = useAuth()

  // Verificar si el usuario es administrador
  const isAdmin = useMemo(() => {
    return (
      user?.rol &&
      ['administrador', 'admin', 'adm'].some((adminRole) =>
        user.rol.toLowerCase().includes(adminRole),
      )
    )
  }, [user?.rol])

  // Normaliza todos los permisos del usuario UNA SOLA VEZ
  const userPermissions = useMemo(() => {
    const normalizedPermissions = new Set(permisos.map(normalizeString))
    return normalizedPermissions
  }, [permisos])

  /**
   * Construye el permiso completo usando la jerarquía actual + acción
   * Formato: DOMINIO:MENU:SUBMENU:...:ACCION
   */
  const hasActionPermission = (action: string): boolean => {
    // Si es administrador, siempre tiene permiso
    if (isAdmin) return true

    if (loading || !action) return false

    // Si no hay jerarquía, no podemos validar
    if (!fullHierarchy || fullHierarchy.length === 0) {
      return false
    }

    // Eliminar duplicados consecutivos (ej: ['Productos', 'Productos', 'Modificar'] -> ['Productos', 'Modificar'])
    const uniqueHierarchy = fullHierarchy.filter(
      (item, index, arr) => index === 0 || item !== arr[index - 1],
    )

    // Normalizar y construir permiso
    const hierarchyParts = uniqueHierarchy.map(normalizeString)
    const actionNormalized = normalizeString(action)

    // Unir jerarquía + acción
    const parts = [...hierarchyParts, actionNormalized].filter(Boolean)

    // Obtener el dominio del env
    const dominio = normalizeString(import.meta.env.ISI_MODULO || '')

    // Construir permiso completo: DOMINIO:PARTE1:PARTE2:...:ACCION
    const fullPermission = [dominio, ...parts].filter(Boolean).join(':')
    const hasPermission = userPermissions.has(fullPermission)

    return hasPermission
  }

  /**
   * Verifica un permiso estático sin usar la jerarquía automática
   * El desarrollador especifica el permiso completo manualmente
   * Formato: SECCION:SUBSECCION:...:ACCION (sin dominio, se agrega automáticamente)
   */
  const hasStaticPermission = (staticPermission: string): boolean => {
    // Si es administrador, siempre tiene permiso
    if (isAdmin) return true

    if (loading || !staticPermission) return false

    // Obtener el dominio del env
    const dominio = normalizeString(import.meta.env.ISI_MODULO || '')

    // Normalizar el permiso estático
    const normalizedStaticPermission = normalizeString(staticPermission)

    // Construir permiso completo: DOMINIO:PERMISO_ESTATICO
    const fullPermission = [dominio, normalizedStaticPermission].filter(Boolean).join(':')
    const hasPermission = userPermissions.has(fullPermission)

    // console.log(`[ESTATICO] Permiso solicitado: ${staticPermission}`)
    // console.log(
    //   `Permiso: ${fullPermission} - ${hasPermission ? 'PERMITIDO' : 'DENEGADO'}`,
    // )

    return hasPermission
  }

  const value: SecurityContextProps = {
    hasActionPermission,
    hasStaticPermission,
    userPermissions,
    loading,
  }

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>
}

export const useSecurity = () => {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider')
  }
  return context
}
