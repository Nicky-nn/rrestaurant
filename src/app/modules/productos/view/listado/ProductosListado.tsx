import { Delete } from '@mui/icons-material'
import { Button, Chip } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { sumBy } from 'lodash'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_RowSelectionState,
  MRT_SortingState,
  MRT_TableOptions,
} from 'material-react-table'
import { FunctionComponent, useMemo, useState } from 'react'

import StackMenuActionTable, {
  StackMenuItem,
} from '../../../../base/components/MyMenu/StackMenuActionTable'
import { PAGE_DEFAULT, PageProps } from '../../../../interfaces'
import { genApiQuery, genReplaceEmpty } from '../../../../utils/helper'
import { MuiToolbarAlertBannerProps } from '../../../../utils/muiTable/materialReactTableUtils'
import { MuiTableAdvancedOptionsProps } from '../../../../utils/muiTable/muiTableAdvancedOptionsProps'
import { notSuccess } from '../../../../utils/notification'
import { swalAsyncConfirmDialog, swalException } from '../../../../utils/swal'
import { apiProductos } from '../../api/producto.api'
import { apiProductosEliminar } from '../../api/productoEliminar.api'
import { ProductoProps } from '../../interfaces/producto.interface'
import ProductoMenu from './ProductoMenu'

interface OwnProps {}

type Props = OwnProps

const tableColumns: MRT_ColumnDef<ProductoProps>[] = [
  {
    accessorFn: (row) => {
      return genReplaceEmpty(row.actividadEconomica?.codigoCaeb, '')
    },
    header: 'Act.Eco.',
    id: 'actividadEconomica.codigoCaeb',
  },
  {
    accessorKey: 'titulo',
    header: 'Producto',
    id: 'titulo',
    size: 400,
  },
  {
    accessorFn: (row) => {
      const cantidad = sumBy(row.variantes, (item) => {
        return sumBy(item.inventario, (inv) => inv.stock!)
      })
      if (!row.varianteUnica) {
        return (
          <Chip
            size={'small'}
            label={`${cantidad} items para ${row.variantes.length} variantes`}
            color={'info'}
          />
        )
      }
      return <Chip size={'small'} label={`${cantidad} items`} color={'default'} />
    },
    id: 'inventario',
    header: 'Inventario',
  },
  {
    id: 'tipoProducto.descripcion',
    header: 'Tipo Producto',
    accessorFn: (row) => genReplaceEmpty(row.tipoProducto?.descripcion, ''),
  },
  {
    accessorKey: 'proveedor',
    id: 'proveedor',
    header: 'Proveedor',
    accessorFn: (row) => <span>{row.proveedor?.nombre}</span>,
  },
  {
    accessorFn: (row) => <Chip size={'small'} label={row.state} color={'success'} />,
    id: 'state',
    header: 'Estado',
  },
]

/**
 * @description Tabla listado de productos
 * @param props
 * @constructor
 */
const ProductosListado: FunctionComponent<Props> = (props) => {
  // ESTADO DATATABLE
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: PAGE_DEFAULT.page,
    pageSize: PAGE_DEFAULT.limit ?? 10,
  })
  const [rowCount, setRowCount] = useState(0)
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  // FIN ESTADO DATATABLE

  const { data, isError, isLoading, refetch, isRefetching } = useQuery<ProductoProps[]>({
    queryKey: [
      'productosListado',
      columnFilters,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
    ],
    queryFn: async () => {
      const query = genApiQuery(columnFilters)
      const fetchPagination: PageProps = {
        ...PAGE_DEFAULT,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        reverse: sorting.length <= 0,
        query,
      }
      const { pageInfo, docs } = await apiProductos(fetchPagination)
      setRowCount(pageInfo.totalDocs)
      return docs
    },
    refetchOnWindowFocus: false,
  })

  const columns = useMemo(() => tableColumns, [])

  /**
   * @description Eliminamos los productos seleccionados
   * @param data
   */
  const handleDeleteData = async (data: any) => {
    const products = data.map((item: any) => item.original._id)
    await swalAsyncConfirmDialog({
      text: 'Confirma que desea eliminar los registros seleccionados y sus respectivas variantes, esta operación no se podra revertir',
      preConfirm: async () => {
        return apiProductosEliminar(products).catch((err) => {
          swalException(err)
          return false
        })
      },
    }).then((resp) => {
      if (resp.isConfirmed) {
        notSuccess()
        setRowSelection({})
        refetch()
      }
    })
  }
  return (
    <>
      <MaterialReactTable
        {...(MuiTableAdvancedOptionsProps as MRT_TableOptions<ProductoProps>)}
        columns={columns}
        data={data ?? []}
        initialState={{ showColumnFilters: true }}
        muiToolbarAlertBannerProps={MuiToolbarAlertBannerProps(isError)}
        onColumnFiltersChange={setColumnFilters}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        rowCount={rowCount}
        state={{
          isLoading,
          columnFilters,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isRefetching,
          density: 'compact',
          sorting,
          rowSelection,
        }}
        renderRowActions={({ row }) => (
          <ProductoMenu row={row.original} refetch={refetch} />
        )}
        enableRowSelection
        onRowSelectionChange={setRowSelection}
        renderTopToolbarCustomActions={({ table }) => {
          return (
            <StackMenuActionTable refetch={refetch}>
              <StackMenuItem>
                <Button
                  color="error"
                  onClick={() => handleDeleteData(table.getSelectedRowModel().flatRows)}
                  startIcon={<Delete />}
                  variant="contained"
                  size={'small'}
                  disabled={table.getSelectedRowModel().flatRows.length === 0}
                >
                  Eliminar
                </Button>
              </StackMenuItem>
            </StackMenuActionTable>
          )
        }}
      />
    </>
  )
}

export default ProductosListado
