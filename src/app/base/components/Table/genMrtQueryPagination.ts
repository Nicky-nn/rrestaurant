import { MRT_ColumnFiltersState, MRT_PaginationState, MRT_SortingState } from 'material-react-table'

import { PAGE_DEFAULT } from '../../../interfaces'
import { genApiQuery } from '../../../utils/helper.ts'
import { castMrtFilters, FilterTypeMap } from './castMrtFilters.ts'
import { MrtStateValues } from './mrtTypes.ts'

/**
 * // 2. USO EN LA QUERY
 *       // TypeScript infiere T automáticamente o puedes ser explícito
 *       const typedFilters = castMrtFilters<ClientProps>(
 *         ctx.columnFilters,
 *         CLIENT_FILTER_TYPES
 *       );
 */

/**
 * Define funciones personalizadas para transformar los valores.
 * Si retornas algo aquí, sobreescribe la lógica por defecto.
 */
interface MrtMappers {
  page?: (pagination: MRT_PaginationState) => number
  limit?: (pagination: MRT_PaginationState) => number
  reverse?: (sorting: MRT_SortingState) => boolean
  query?: (filters: MRT_ColumnFiltersState, fields: string[]) => any
}

/**
 * Opciones de configuración para el adaptador.
 * T: Es el tipo de los parámetros extra que tu API necesite.
 */
interface AdaptOptions<T = Record<string, any>> {
  // Array de campos que genApiQuery necesita (ej: ['nombre=Richard', 'codigo=123'])
  filterFields?: string[]
  // Parámetros adicionales específicos para el endpoint (ej: `{ active: true, limit, page, query }`) donde active:true es extraParams
  extraParams?: Record<string, any>
  // Mapeo de reemplazo de parametros page, limit, reverse, query
  mappers?: MrtMappers
  // Mapa de tipos para el filtro inteligente Ej:
  // `const filterTypes: FilterTypeMap<ClientProps> = {...props}`
  filterTypes?: FilterTypeMap<T>
}

/**
 * Convierte el contexto de MRT al formato de tu API Backend.
 * @template T Tipo de los parámetros extra (opcional)
 */
export const genMrtQueryPagination = <T = Record<string, any>>(
  state: MrtStateValues,
  options: AdaptOptions<T> = {},
) => {
  const { pagination, sorting, columnFilters, globalFilter } = state
  const { filterFields = [], extraParams, mappers, filterTypes } = options

  // 1. Lógica por defecto
  const defaultPage = pagination.pageIndex + 1 // MRT es 0-index
  const defaultLimit = pagination.pageSize
  const defaultReverse = sorting.length > 0 ? sorting[0].desc : true // Asumiendo default true
  const finalFilters = filterTypes ? castMrtFilters(columnFilters, filterTypes) : columnFilters

  const defaultQuery = genApiQuery(finalFilters, filterFields)

  return {
    ...PAGE_DEFAULT,
    ...extraParams,
    // Paginación
    page: mappers?.page ? mappers.page(pagination) : defaultPage,
    limit: mappers?.limit ? mappers.limit(pagination) : defaultLimit,
    // Ordenamiento
    reverse: mappers?.reverse ? mappers.reverse(sorting) : defaultReverse,
    sortField: sorting.length > 0 ? sorting[0].id : undefined,
    // Filtros y Búsqueda
    // Aquí pasamos el array 'filterFields' que pediste a tu función
    query: mappers?.query ? mappers.query(columnFilters, filterFields) : defaultQuery,
    // Si tu API usa un campo separado para búsqueda global:
    search: globalFilter || undefined,
  }
}
