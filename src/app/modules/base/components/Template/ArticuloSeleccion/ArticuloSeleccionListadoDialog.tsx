import { Save } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import {
  MaterialReactTable,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_RowSelectionState,
  MRT_SortingState,
  MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table'
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'

import { apiArticuloInventarioListado } from '../../../../../base/api/apiArticuloInventarioListado.ts'
import MuiRenderTopToolbarCustomActions from '../../../../../base/components/MuiTable/MuiRenderTopToolbarCustomActions.tsx'
import {
  EntidadInputProps,
  PAGE_DEFAULT,
  PageInputProps,
} from '../../../../../interfaces'
import { ArticuloProps } from '../../../../../interfaces/articulo.ts'
import { genApiQuery } from '../../../../../utils/helper.ts'
import {
  MuiTablePaginationProps,
  MuiToolbarAlertBannerProps,
} from '../../../../../utils/muiTable/materialReactTableUtils.ts'
import { MuiTableAdvancedOptionsProps } from '../../../../../utils/muiTable/muiTableAdvancedOptionsProps.ts'
import { notDanger } from '../../../../../utils/notification.ts'
import { ArticuloSeleccionListadoColumns } from './ArticuloSeleccionListadoColumns.tsx'

interface OwnProps extends DialogProps {
  id: string // identificador unico del componente
  entidad: EntidadInputProps
  verificarPrecio?: boolean
  verificarInventario?: boolean
  bloquearCodigosArticulo: string[] // bloquea los articulos según el codigo de articulo
  seleccionMultiple?: boolean // default true
  open: boolean
  extraQuery?: string[] // Condiciones extras para filtro de articulos Ej: ["key=1", "key2=2"]
  onClose: (value: ArticuloProps[]) => void
}

type Props = OwnProps

/**
 * Listamos los articulos de inventario
 * puede contener inventario o no
 * @author isi-template
 * @constructor
 */
const ArticuloSeleccionListadoDialog: FunctionComponent<Props> = (props) => {
  const {
    onClose,
    open,
    bloquearCodigosArticulo,
    entidad,
    verificarPrecio,
    verificarInventario,
    seleccionMultiple = true,
    extraQuery = [],
    ...other
  } = props

  const columns = useMemo(() => ArticuloSeleccionListadoColumns, [])

  // ESTADO DATATABLE
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: PAGE_DEFAULT.page,
    pageSize: PAGE_DEFAULT.limit,
  })
  const [rowCount, setRowCount] = useState<number>(0)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({}) //ts type available
  // FIN ESTADO DATATABLE

  const { data, isError, isRefetching, isLoading, refetch } = useQuery({
    queryKey: [
      'articulo-seleccion-listado-dialog',
      open,
      entidad,
      columnFilters,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
    ],
    queryFn: async () => {
      if (open) {
        const query = genApiQuery(columnFilters, [...extraQuery])
        const fetchPagination: PageInputProps = {
          ...PAGE_DEFAULT,
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          reverse: sorting.length <= 0,
          query,
        }
        const { docs, pageInfo } = await apiArticuloInventarioListado(
          entidad,
          fetchPagination,
          {
            verificarPrecio,
            verificarInventario,
          },
        )
        setRowCount(pageInfo.totalDocs)
        return docs || []
      }
      return []
    },
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  })

  const table = useMaterialReactTable({
    ...(MuiTableAdvancedOptionsProps as MRT_TableOptions<ArticuloProps>),
    columns: columns,
    data: data || [],
    initialState: { showColumnFilters: true },
    getRowId: (row) => row.codigoArticulo,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: { cursor: 'pointer' },
    }),
    muiSelectCheckboxProps: {
      sx: {
        '&.Mui-disabled': {
          backgroundColor: (theme) => theme.palette.text.disabled,
        },
      },
    },
    enablePagination: true,
    enableRowNumbers: true,
    enableRowActions: false,
    enableColumnActions: false,
    enableSorting: false,
    enableColumnPinning: false,
    enableHiding: false,
    enableFullScreenToggle: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    rowCount,
    enableRowSelection: (row) =>
      !bloquearCodigosArticulo.includes(row.original.codigoArticulo),
    enableMultiRowSelection: seleccionMultiple,
    muiToolbarAlertBannerProps: MuiToolbarAlertBannerProps(isError),
    onRowSelectionChange: setRowSelection,
    state: {
      isLoading,
      columnFilters,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      density: 'compact',
      rowSelection,
      sorting,
    },
    muiPaginationProps: {
      ...MuiTablePaginationProps,
    },
    enableTopToolbar: false,
    enableBottomToolbar: true,
    enableTableFooter: false,
    muiTableProps: {
      sx: {
        '& .MuiTableRow-root.MuiTableRow-head': {
          paddingTop: 0.2,
        },
      },
    },
    positionToolbarAlertBanner: 'none',
    renderBottomToolbarCustomActions: () => (
      <MuiRenderTopToolbarCustomActions refetch={refetch} />
    ),
  })

  /**
   * Selección de articulos
   */
  const onSeleccionArticulos = () => {
    const idsArticulo = Object.keys(rowSelection)
    if (idsArticulo.length > 0) {
      const articulos = (data || []).filter((a) => idsArticulo.includes(a.codigoArticulo))
      // const articuloOperaciones = articuloToOperacion(articulos)
      onClose(articulos)
    } else {
      notDanger('Debe seleccionar al menos un artículo')
    }
  }

  /***********************************************************************************/
  /***********************************************************************************/
  useEffect(() => {
    if (open) {
      setRowSelection({})
    }
  }, [open])
  /***********************************************************************************/
  /***********************************************************************************/
  /***********************************************************************************/

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { maxHeight: '85vh' } }}
      maxWidth="xl"
      fullWidth
      open={open}
      onClose={() => onClose([])}
      {...other}
    >
      <DialogTitle>Selección de articulos</DialogTitle>
      <DialogContent dividers>
        <MaterialReactTable table={table} />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button color={'error'} onClick={() => onClose([])}>
          Cerrar
        </Button>
        <Button
          color={'primary'}
          variant={'contained'}
          startIcon={<Save />}
          onClick={onSeleccionArticulos}
        >
          Seleccionar Articulo
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ArticuloSeleccionListadoDialog
