import { PersonAddAltSharp } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table'
import { FunctionComponent, useMemo, useState } from 'react'

import StackMenu from '../../../../base/components/MyMenu/StackMenu'
import { PAGE_DEFAULT, PageProps } from '../../../../interfaces'
import { genApiQuery } from '../../../../utils/helper'
import { MuiTableAdvancedOptionsProps } from '../../../../utils/muiTable/muiTableAdvancedOptionsProps'
import { apiClienteListado } from '../../api/apiClienteListado.ts'
import RegisterClientDialog from '../../components/RegisterClientDialog'
import { ClientProps } from '../../interfaces/client'
import UpdateClientDialog from '../Update/UpdateClientDialog'
import ActionsMenu from './ActionsMenu'
import { tableColumns } from './TableClientsHeaders'

interface ListClientsProps {}

type Props = ListClientsProps

/**
 * Listado de clientes
 * @param _props
 * @constructor
 */
const ListClients: FunctionComponent<Props> = (_props) => {
  const [openClienteRegistro, setOpenClienteRegistro] = useState(false)
  const [openClienteUpdate, setOpenClienteUpdate] = useState(false)
  const [clientArg, setClientArg] = useState<ClientProps | null>(null)
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
    refetch,
  } = useQuery<ClientProps[]>({
    queryKey: ['client', columnFilters, pagination.pageIndex, pagination.pageSize, sorting],
    queryFn: async () => {
      const query = genApiQuery(columnFilters)
      const fetchPagination: PageProps = {
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
    ...(MuiTableAdvancedOptionsProps as MRT_TableOptions<ClientProps>), // NO USAMOS ESTA FUNCIÓN
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
        <ActionsMenu
          client={row.original}
          onRefetch={refetch}
          onUpdateClient={(client) => {
            setOpenClienteUpdate(true)
            setClientArg(client)
          }}
        />
      )
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    // muiToolbarAlertBannerProps: { MuiToolbarAlertBannerProps(isError) }
  })

  return (
    <>
      <StackMenu asideSidebarFixed>
        <Button
          size={'small'}
          variant="contained"
          onClick={() => setOpenClienteRegistro(true)}
          startIcon={<PersonAddAltSharp />}
          color={'primary'}
        >
          Nuevo Cliente
        </Button>
      </StackMenu>
      <MaterialReactTable table={table} />
      <RegisterClientDialog
        id={'clienteRegistroDialog'}
        open={openClienteRegistro}
        onClose={async (isRegisterSuccess) => {
          setOpenClienteRegistro(false)
          if (isRegisterSuccess) {
            await refetch()
          }
        }}
      />
      <UpdateClientDialog
        id={'updateRegistroDialgo'}
        open={openClienteUpdate}
        client={clientArg}
        onClose={async (isUpdateSuccess) => {
          setOpenClienteUpdate(false)
          setClientArg(null)
          if (isUpdateSuccess) {
            await refetch()
          }
        }}
      />
    </>
  )
}
export default ListClients
