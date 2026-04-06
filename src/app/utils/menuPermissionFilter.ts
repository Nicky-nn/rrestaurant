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
 * @author isi-template 2026.1 para rol dominio
 */
export const normalizeString = (str: string | null | undefined): string => {
  if (!str) return ''

  return str
    .toUpperCase()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina marcas diacríticas
    .replace(/[/\s\-.]+/g, '_') // Convierte espacios, slashes, guiones y puntos a underscores
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
 * @author isi-template 2026.1 para rol dominio
 */
export const buildPermissionKey = (
  dominio: string | null | undefined,
  seccion: string | null | undefined,
  accion: string | null | undefined,
): string => {
  // Normaliza todas las partes
  const parts = [normalizeString(dominio), normalizeString(seccion), normalizeString(accion)]

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
 * @author isi-template 2026.1 para rol dominio
 */
export const hasPermission = (userPermissions: string[], permissionToCheck: string): boolean => {
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
 * @author isi-template 2026.1 para rol dominio
 */
export const hasAnyPermission = (userPermissions: string[], permissionsToCheck: string[]): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false
  if (!permissionsToCheck || permissionsToCheck.length === 0) return false

  // Optimización: Normaliza la lista de permisos del usuario UNA SOLA VEZ
  // Complejidad O(n + m) en lugar de O(n * m)
  const permissionSet = new Set(userPermissions.map(normalizeString))

  return permissionsToCheck.some((permission) => permissionSet.has(normalizeString(permission)))
}

/**
 * Verifica múltiples permisos usando lógica AND
 * Retorna true si el usuario tiene TODOS los permisos
 *
 * @param userPermissions - Array de permisos del usuario
 * @param permissionsToCheck - Array de permisos a verificar
 * @returns true si tiene todos los permisos
 * @author isi-template 2026.1 para rol dominio
 */
export const hasAllPermissions = (userPermissions: string[], permissionsToCheck: string[]): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false
  if (!permissionsToCheck || permissionsToCheck.length === 0) return false

  // Optimización: Normaliza la lista de permisos del usuario UNA SOLA VEZ
  // Complejidad O(n + m) en lugar de O(n * m)
  const permissionSet = new Set(userPermissions.map(normalizeString))

  return permissionsToCheck.every((permission) => permissionSet.has(normalizeString(permission)))
}

/**
 * Extrae información del dominio desde variables de entorno
 * Lee ISI_DOMINIO del import.meta.env
 *
 * @returns Dominio configurado (ej: "REST")
 * @author isi-template 2026.1 para rol dominio
 */
export const getDominioFromEnv = (): string => {
  // Proporciona un string vacío como fallback si la variable no existe
  return import.meta.env.ISI_DOMINIO || import.meta.env.ISI_MODULO || ''
}

/**
 * Construye el permiso completo usando el dominio del environment
 *
 * @param seccion - Sección del menú
 * @param accion - Acción específica
 * @returns Permiso completo en formato DOMINIO:SECCION:ACCION
 * @author isi-template 2026.1 para rol dominio
 */
export const buildPermissionFromEnv = (
  seccion: string | null | undefined,
  accion: string | null | undefined,
): string => {
  const dominio = getDominioFromEnv()
  // Delega a la función `buildPermissionKey` mejorada
  return buildPermissionKey(dominio, seccion, accion)
}

/**
 * Convierte una ruta con parámetros dinámicos a un patrón de ruta base
 * Ejemplos:
 *   /productos/modificar/69322a71bab88cb97ea2f549 -> /productos/modificar
 *   /ventas/factura/123/detalle/456 -> /ventas/factura
 *   /clientes/editar/abc123def456 -> /clientes/editar
 *
 * @param path - Ruta actual con o sin parámetros dinámicos
 * @returns Ruta base sin parámetros
 * @author isi-template 2026.1 para rol dominio
 */
export const extractBaseRoute = (path: string): string => {
  if (!path) return '/'

  // Normalizar path (remover query params y trailing slash)
  const cleanPath = path.split('?')[0].replace(/\/$/, '')

  // Patrones comunes de IDs/parámetros dinámicos
  const dynamicPatterns = [
    /\/[0-9a-fA-F]{24}$/, // MongoDB ObjectID (24 hex chars)
    /\/[0-9a-fA-F]{8,}$/, // IDs hexadecimales largos
    /\/[0-9]+$/, // IDs numéricos
    /\/[a-zA-Z0-9_-]{10,}$/, // IDs alfanuméricos largos (10+ chars)
    /\/[0-9]+\/[^/]+$/, // Patrón /id/accion
  ]

  let basePath = cleanPath

  // Remover segmentos que coincidan con patrones de IDs
  for (const pattern of dynamicPatterns) {
    if (pattern.test(basePath)) {
      // Remover el último segmento que coincide con el patrón
      basePath = basePath.substring(0, basePath.lastIndexOf('/'))
      break // Solo remover un nivel
    }
  }

  return basePath || '/'
}

/**
 * Compara dos rutas considerando parámetros dinámicos
 * 100% BACKWARDS COMPATIBLE con v1
 *
 * @param pathA - Primera ruta (normalmente URL actual del navegador)
 * @param pathB - Segunda ruta (normalmente ruta del menú)
 * @returns true si las rutas coinciden
 * @author isi-template 2026.1 para rol dominio
 */
export const matchRoute = (pathA: string, pathB: string): boolean => {
  if (!pathA || !pathB) return false

  const normalizePathForMatch = (p: string) => p.split('?')[0].replace(/\/$/, '') || '/'

  const a = normalizePathForMatch(pathA)
  const b = normalizePathForMatch(pathB)

  // 1. Comparación exacta (v1 - sin cambios)
  if (a === b) return true

  // 2. Si b tiene :param (caso v1: menuPath con :param)
  if (b.includes(':')) {
    const regexB = new RegExp('^' + b.replace(/:[^/]+/g, '[^/]+') + '$')
    if (regexB.test(a)) return true
  }

  // 3. Si a tiene :param (nuevo en v2, para casos como ProductosRoutes)
  if (a.includes(':')) {
    const regexA = new RegExp('^' + a.replace(/:[^/]+/g, '[^/]+') + '$')
    if (regexA.test(b)) return true

    // Caso especial v2: /dominio/123/:id debe matchear /dominio/123
    const segmentsA = a.split('/').filter(Boolean)
    const segmentsB = b.split('/').filter(Boolean)
    const minLength = Math.min(segmentsA.length, segmentsB.length)

    let allMatch = true
    for (let i = 0; i < minLength; i++) {
      const segA = segmentsA[i]
      const segB = segmentsB[i]
      if (segA.startsWith(':') || segB.startsWith(':')) continue
      if (segA !== segB) {
        allMatch = false
        break
      }
    }

    if (allMatch) {
      const longerSegments = segmentsA.length > segmentsB.length ? segmentsA : segmentsB
      const extraSegments = longerSegments.slice(minLength)
      if (extraSegments.every((seg) => seg.startsWith(':'))) return true
    }
  }

  // 4. Comparación inteligente sin :param (v1 mejorado)
  if (!a.includes(':') && !b.includes(':')) {
    const baseA = extractBaseRoute(a)
    const baseB = extractBaseRoute(b)

    if (baseA === baseB) return true

    // v1: a (currentPath) empieza con b (menuPath) + ID
    if (a.startsWith(b + '/')) {
      const remainder = a.substring(b.length + 1)
      const firstSegment = remainder.split('/')[0]
      if (
        /^[0-9a-fA-F]{8,}$/.test(firstSegment) ||
        /^[0-9]+$/.test(firstSegment) ||
        /^[a-zA-Z0-9_-]{10,}$/.test(firstSegment)
      ) {
        return true
      }
    }
  }

  return false
}

/**
 * Construye un permiso directamente desde una URL
 * Útil para rutas que NO están en el menú pero tienen permisos
 *
 * Ejemplo:
 *   URL: /productos/modificar/69322a71bab88cb97ea2f549
 *   Resultado: REST:PRODUCTOS:MODIFICAR
 *
 * @param url - La URL actual (puede contener IDs dinámicos)
 * @returns Permiso construido desde la URL
 * @author isi-template 2026.1 para rol dominio
 */
export const buildPermissionFromUrl = (url: string): string => {
  if (!url) return ''

  const dominio = getDominioFromEnv()

  // Extraer la ruta base sin IDs
  const basePath = extractBaseRoute(url)

  // Dividir en segmentos y filtrar vacíos
  const segments = basePath.split('/').filter(Boolean)

  // Normalizar cada segmento
  const normalizedSegments = segments.map(normalizeString)

  // Construir permiso: DOMINIO:SEGMENTO1:SEGMENTO2
  const parts = [normalizeString(dominio), ...normalizedSegments].filter(Boolean)

  return parts.join(':')
}
