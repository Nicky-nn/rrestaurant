import { QueryFunctionContext, QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query'
import {
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_RowData,
  MRT_SortingState,
} from 'material-react-table'

import { MrtQueryFnResult, MrtTableFetchContext } from './mrtTypes.ts'
import { useMrtQueryState } from './useMrtQueryState.tsx'

/*
// Mapa de filtros para el sistema de filtros inteligentes
const CLIENT_FILTER_TYPES: FilterTypeMap<ClientProps> = {
  lineaCredito: 'boolean', // Convertirá "true" -> true
  telefono: 'number', // Convertirá "25" -> 25
  numeroDocumento: 'string',
}

const clientes = useMrtQuery({
  queryKey: ['clients'],
  queryFn: async (ctx) => {
    const pgs = genMrtQueryPagination(ctx, { filterTypes: CLIENT_FILTER_TYPES })
    return await apiClienteListado(pgs)
  },
  isServerSide: true,
})
<MrtDynamicTable config={config} {...clientes} />
 */

// Interfaz de entrada para el hook
/**
 * Props para el hook useMrtQuery.
 * T es el tipo de dato de la fila (ej: Product, User).
 */
export interface MrtQueryProps<T extends MRT_RowData, TResult = MrtQueryFnResult<T>> {
  // 1. Requerido: La llave única para el caché de React Query
  queryKey: QueryKey

  // 2. Requerido: La función que trae los datos.
  // Ahora usa MrtTableFetchContext para tener acceso a pagination, signal, sorting, etc.
  queryFn: (context: MrtTableFetchContext) => Promise<TResult>

  // 3. Opcional: Define si los cambios de estado disparan nuevas consultas.
  // true = Paginación/Filtros en Backend.
  // false = Carga todo una vez y filtra en Frontend.
  // Default: true
  isServerSide?: boolean

  // 4. Estados Iniciales (Opcionales)
  initialPagination?: MRT_PaginationState
  initialColumnFilters?: MRT_ColumnFiltersState
  initialGlobalFilter?: string
  initialSorting?: MRT_SortingState

  // 5. Opciones avanzadas de React Query
  // (ej: enabled, staleTime, refetchOnWindowFocus, retry)
  // Omitimos queryKey y queryFn porque ya los definimos explícitamente arriba
  queryOptions?: Omit<UseQueryOptions<TResult, Error, TResult, QueryKey>, 'queryKey' | 'queryFn'>
}

/**
 * hook para generar los datos de listado para material-react-table, ojo, solo es compatible con el hook <MMrtDynamicTable>
 * Si se quiere usar en un material-react-table simple, se debe castear {..., data: data as T[]}
 * @param props
 */
export const useMrtQuery = <T extends MRT_RowData, TResult = MrtQueryFnResult<T>>(
  props: MrtQueryProps<T, TResult>,
) => {
  const { isServerSide = true } = props
  // 1. Gestión del Estado UI (Hook pequeño)
  const { state, onStateChange, debouncedState } = useMrtQueryState({
    initialPagination: props.initialPagination,
    initialColumnFilters: props.initialColumnFilters,
    initialGlobalFilter: props.initialGlobalFilter,
    initialSorting: props.initialSorting,
  })

  // 2. Gestión de la Data (React Query)
  const query = useQuery<TResult>({
    // Cache Key Dinámica
    queryKey: isServerSide ? [...props.queryKey, debouncedState] : [...props.queryKey],

    // Función Fetch Enriquecida
    queryFn: (fnContext: QueryFunctionContext<QueryKey>) => {
      // Creamos el contexto fusionando React Query + Nuestro Estado
      const enrichedContext: MrtTableFetchContext = {
        ...fnContext, // trae signal, queryKey, meta
        ...debouncedState, // trae pagination, sorting, filters
      }
      return props.queryFn(enrichedContext)
    },

    // Opciones extra (ej: enabled: false)
    ...props.queryOptions,
  })

  return {
    ...query,
    state,
    onStateChange,
  }
}
