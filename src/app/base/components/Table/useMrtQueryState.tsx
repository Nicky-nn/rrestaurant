import { MRT_ColumnFiltersState, MRT_PaginationState, MRT_SortingState } from 'material-react-table'
import { useEffect, useState } from 'react'

interface MrtStateQueryProps {
  initialPagination?: MRT_PaginationState
  initialColumnFilters?: MRT_ColumnFiltersState
  initialGlobalFilter?: string
  initialSorting?: MRT_SortingState
}

/**
 * Definicion de estados para el uso de `useQuery` manual, usado en listados
 * @author isi-template
 * @param initialPagination
 * @param initialColumnFilters
 * @param initialGlobalFilter
 * @param initialSorting
 */
export const useMrtQueryState = ({
  initialPagination = { pageIndex: 0, pageSize: 10 },
  initialColumnFilters = [],
  initialGlobalFilter = '',
  initialSorting = [],
}: MrtStateQueryProps = {}) => {
  // 1. Estados de la UI (Necesarios siempre, sea Server o Client side)
  const [pagination, setPagination] = useState<MRT_PaginationState>(initialPagination)
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(initialColumnFilters)
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter)
  const [sorting, setSorting] = useState<MRT_SortingState>(initialSorting)

  // 2. Estados Debounced para retrasar 300 ms en filtros, evita multiples llamadas al servidor
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState(initialGlobalFilter)
  const [debouncedColumnFilters, setDebouncedColumnFilters] =
    useState<MRT_ColumnFiltersState>(initialColumnFilters)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter)
      setDebouncedColumnFilters(columnFilters)
    }, 300)
    return () => clearTimeout(handler)
  }, [globalFilter, columnFilters])

  return {
    // Estado crudo para la Tabla (UI)
    state: {
      pagination,
      globalFilter,
      columnFilters,
      sorting,
    },
    // Estado Debounced (Útil SOLO si vas a enviar filtros a la API)
    debouncedState: {
      pagination,
      sorting,
      globalFilter: debouncedGlobalFilter,
      columnFilters: debouncedColumnFilters,
    },
    // Setters para la Tabla
    onStateChange: {
      onPaginationChange: setPagination,
      onGlobalFilterChange: setGlobalFilter,
      onColumnFiltersChange: setColumnFilters,
      onSortingChange: setSorting,
    },
    // Setters manuales
    setters: {
      setPagination,
      setGlobalFilter,
      setColumnFilters,
      setSorting,
    },
  }
}
