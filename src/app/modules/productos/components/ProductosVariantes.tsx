import { AllInclusive } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'
import { MaterialReactTable, MRT_ColumnDef, MRT_TableOptions } from 'material-react-table'
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'

import { numberWithCommas } from '../../../base/components/MyInputs/NumberInput'
import useAuth from '../../../base/hooks/useAuth'
import { PAGE_DEFAULT, PageProps } from '../../../interfaces'
import { genApiQuery, genReplaceEmpty } from '../../../utils/helper'
import { MuiToolbarAlertBannerProps } from '../../../utils/muiTable/materialReactTableUtils'
import { MuiTableAdvancedOptionsProps } from '../../../utils/muiTable/muiTableAdvancedOptionsProps'
import { apiProductosVariantes } from '../api/productosVariantes.api'
import { ProductoVarianteProps } from '../interfaces/producto.interface'

interface OwnProps {
  codigoActividad: string
  setProductosVariantes: React.Dispatch<React.SetStateAction<ProductoVarianteProps[]>>
}

type Props = OwnProps

const ProductosVariantes: FunctionComponent<Props> = (props) => {
  const {
    user: { sucursal },
  } = useAuth()

  const columns = useMemo<MRT_ColumnDef<ProductoVarianteProps>[]>(
    () => [
      {
        accessorKey: 'codigoProducto',
        header: 'Código Producto',
        size: 100,
      },
      {
        accessorKey: 'nombre',
        header: 'Producto / Servicio',
      },
      {
        accessorKey: 'precio',
        header: 'Precio',
        muiTableBodyCellProps: {
          align: 'right',
        },
        accessorFn: (row) => {
          return numberWithCommas(row.precio, {})
        },
        size: 100,
      },
      {
        header: 'Stock',
        muiTableBodyCellProps: {
          align: 'right',
        },
        accessorFn: (row) => {
          if (row.incluirCantidad) {
            const stock = row.inventario.find(
              (i) => i.sucursal.codigo === sucursal.codigo,
            )
            return genReplaceEmpty(stock?.stock, 0)
          } else {
            return <AllInclusive color={'primary'} fontSize={'small'} />
          }
        },
        size: 50,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'unidadMedida.descripcion',
        header: 'Unidad Medida',
        enableColumnFilter: false,
      },
    ],
    [],
  )

  const { setProductosVariantes } = props
  // DATA TABLE
  const [rowCount, setRowCount] = useState(0)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_DEFAULT.page,
    pageSize: PAGE_DEFAULT.limit ?? 10,
  })
  const [rowSelection, setRowSelection] = useState({})

  // FIN DATA TABLE
  const { data, isError, isFetching, isLoading } = useQuery<ProductoVarianteProps[]>({
    queryKey: [
      'tableProductoVarianteDialog',
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
      const { pageInfo, docs } = await apiProductosVariantes(fetchPagination)
      setRowCount(pageInfo.totalDocs)
      return docs
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
  })
  useEffect(() => {
    if (rowSelection) {
      const p = Object.keys(rowSelection)
      if (data) {
        const pvs = data!.filter((item) => p.includes(item._id))
        setProductosVariantes(pvs)
      }
    }
  }, [rowSelection])

  return (
    <>
      <MaterialReactTable
        {...(MuiTableAdvancedOptionsProps as MRT_TableOptions<ProductoVarianteProps>)}
        columns={columns}
        data={data ?? []}
        initialState={{ showColumnFilters: true }}
        muiToolbarAlertBannerProps={MuiToolbarAlertBannerProps(isError)}
        onColumnFiltersChange={setColumnFilters}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        enableDensityToggle={false}
        enableGlobalFilter={false}
        rowCount={rowCount ?? 0}
        state={{
          isLoading,
          columnFilters,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isFetching,
          sorting,
          density: 'compact',
          rowSelection,
        }}
        enableRowSelection
        enableColumnActions={false}
        enableRowActions={false}
        enableSelectAll={false}
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row._id}
        muiTableContainerProps={{
          sx: {
            maxHeight: '100%',
          },
        }}
        muiTableBodyRowProps={({ row }) => ({
          onClick: row.getToggleSelectedHandler(),
          sx: { cursor: 'pointer' },
        })}
      />
    </>
  )
}

export default ProductosVariantes
