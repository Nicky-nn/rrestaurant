/**
 * Sistema de filtrado de menús basado en permisos de usuario
 *
 * Este módulo proporciona utilidades para filtrar menús y navegaciones
 * según los permisos obtenidos del backend.
 *
 * @module menuPermissionFilter
 */

/**
 * Normaliza un string para comparación:
 * - Convierte a mayúsculas
 * - Elimina acentos/diacríticos
 * - Reemplaza espacios y guiones por underscores
 * - Elimina caracteres especiales excepto : y _
 */
export const normalizeString = (str: string | null | undefined): string => {
  if (!str) return ''

  return str
    .toUpperCase()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina marcas diacríticas
    .replace(/[/\s\-\.]+/g, '_') // Convierte espacios, slashes, guiones y puntos a underscores
    .replace(/[^A-Z0-9_:]/g, '') // Elimina caracteres especiales excepto : y _
    .replace(/_+/g, '_') // Elimina underscores duplicados
    .replace(/^_|_$/g, '') // Elimina underscores al inicio y final
}

/**
 * Construye el permiso completo en formato: DOMINIO:SECCION:ACCION
 * Maneja inteligentemente partes nulas o vacías.
 *
 * @param dominio - Dominio de la aplicación (ej: "REST", "POS", "ADMIN")
 * @param seccion - Sección del menú (ej: "VENTAS", "CLIENTES")
 * @param accion - Acción específica (ej: "GESTION_FACTURAS", "REGISTRAR_PEDIDOS")
 * @returns Permiso en formato normalizado
 */
export const buildPermissionKey = (
  dominio: string | null | undefined,
  seccion: string | null | undefined,
  accion: string | null | undefined,
): string => {
  // Normaliza todas las partes
  const parts = [
    normalizeString(dominio),
    normalizeString(seccion),
    normalizeString(accion),
  ]

  // Filtra las partes vacías (resultantes de null o '') y las une.
  // Esto previene claves como "DOMINIO::ACCION" y genera "DOMINIO:ACCION"
  return parts.filter(Boolean).join(':')
}

/**
 * Verifica si un permiso existe en la lista de permisos del usuario
 * Utiliza un Set para búsqueda O(1) en lugar de Array.includes O(n).
 *
 * @param userPermissions - Array de permisos del usuario (del backend)
 * @param permissionToCheck - Permiso a verificar
 * @returns true si el usuario tiene el permiso
 */
export const hasPermission = (
  userPermissions: string[],
  permissionToCheck: string,
): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false
  if (!permissionToCheck) return false

  const normalizedCheck = normalizeString(permissionToCheck)

  // Esta sigue siendo O(n) porque se reconstruye en cada llamada,
  // pero es O(n) + O(1) en lugar de O(n) + O(n).
  // La optimización real debe hacerla el HOC/hook (memoizando el Set).
  // Sin embargo, para `hasAny` y `hasAll`, SÍ podemos optimizarlo aquí.
  const permissionSet = new Set(userPermissions.map(normalizeString))

  return permissionSet.has(normalizedCheck)
}

/**
 * Verifica múltiples permisos usando lógica OR
 * Retorna true si el usuario tiene AL MENOS UNO de los permisos
 *
 * @param userPermissions - Array de permisos del usuario
 * @param permissionsToCheck - Array de permisos a verificar
 * @returns true si tiene al menos un permiso
 */
export const hasAnyPermission = (
  userPermissions: string[],
  permissionsToCheck: string[],
): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false
  if (!permissionsToCheck || permissionsToCheck.length === 0) return false

  // Optimización: Normaliza la lista de permisos del usuario UNA SOLA VEZ
  // Complejidad O(n + m) en lugar de O(n * m)
  const permissionSet = new Set(userPermissions.map(normalizeString))

  return permissionsToCheck.some((permission) =>
    permissionSet.has(normalizeString(permission)),
  )
}

/**
 * Verifica múltiples permisos usando lógica AND
 * Retorna true si el usuario tiene TODOS los permisos
 *
 * @param userPermissions - Array de permisos del usuario
 * @param permissionsToCheck - Array de permisos a verificar
 * @returns true si tiene todos los permisos
 */
export const hasAllPermissions = (
  userPermissions: string[],
  permissionsToCheck: string[],
): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false
  if (!permissionsToCheck || permissionsToCheck.length === 0) return false

  // Optimización: Normaliza la lista de permisos del usuario UNA SOLA VEZ
  // Complejidad O(n + m) en lugar de O(n * m)
  const permissionSet = new Set(userPermissions.map(normalizeString))

  return permissionsToCheck.every((permission) =>
    permissionSet.has(normalizeString(permission)),
  )
}

/**
 * Extrae información del dominio desde variables de entorno
 * Lee ISI_DOMINIO del import.meta.env
 *
 * @returns Dominio configurado (ej: "REST")
 */
export const getDominioFromEnv = (): string => {
  // Proporciona un string vacío como fallback si la variable no existe
  return import.meta.env.ISI_DOMINIO || ''
}

/**
 * Construye el permiso completo usando el dominio del environment
 *
 * @param seccion - Sección del menú
 * @param accion - Acción específica
 * @returns Permiso completo en formato DOMINIO:SECCION:ACCION
 */
export const buildPermissionFromEnv = (
  seccion: string | null | undefined,
  accion: string | null | undefined,
): string => {
  const dominio = getDominioFromEnv()
  // Delega a la función `buildPermissionKey` mejorada
  return buildPermissionKey(dominio, seccion, accion)
}
