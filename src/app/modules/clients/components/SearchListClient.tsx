import { Button } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table'
import { FunctionComponent, useMemo, useState } from 'react'

import { PAGE_DEFAULT, PageInputProps } from '../../../interfaces'
import { genApiQuery } from '../../../utils/helper'
import { MuiTableAdvancedOptionsProps } from '../../../utils/muiTable/muiTableAdvancedOptionsProps'
import { apiClienteListado } from '../api/apiClienteListado.ts'
import { ClientProps } from '../interfaces/client'
import { tableColumns } from '../view/ListClients/TableClientsHeaders'

interface SearcListClientProps {
  onSelectedClient: (client: ClientProps) => void
  withCreditLine: boolean
}

type Props = SearcListClientProps

const SearcListClient: FunctionComponent<Props> = ({ onSelectedClient, withCreditLine = false }) => {
  const columns = useMemo<MRT_ColumnDef<ClientProps>[]>(() => tableColumns, [])

  // DATA TABLE
  const [rowCount, setRowCount] = useState(0)
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: PAGE_DEFAULT.page,
    pageSize: PAGE_DEFAULT.limit,
  })

  const {
    data = [],
    isError,
    isLoading,
  } = useQuery<ClientProps[]>({
    queryKey: ['search_list_client', columnFilters, pagination.pageIndex, pagination.pageSize, sorting],
    queryFn: async () => {
      const query = genApiQuery(columnFilters, [`lineaCredito=${withCreditLine}`])

      const fetchPagination: PageInputProps = {
        ...PAGE_DEFAULT,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        reverse: sorting.length <= 0,
        query,
      }
      const clientResponse = await apiClienteListado(fetchPagination)
      const { pageInfo, docs } = clientResponse
      setRowCount(pageInfo.totalDocs)
      return docs
    },
    refetchInterval: false,
  })

  const table = useMaterialReactTable({
    ...(MuiTableAdvancedOptionsProps as MRT_TableOptions<ClientProps>),
    columns,
    data,
    initialState: { showColumnFilters: true },
    state: {
      isLoading,
      density: 'compact',
      showAlertBanner: isError,
      pagination: pagination,
      sorting,
      columnFilters,
    },
    rowCount,
    renderRowActions: ({ row }) => {
      return (
        <Button variant="outlined" onClick={() => onSelectedClient(row.original)}>
          Seleccionar
        </Button>
      )
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
  })

  return <MaterialReactTable table={table} />
}

export default SearcListClient
