import { CheckBoxOutlined, Close } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
} from '@mui/material'
import { MRT_RowSelectionState } from 'material-react-table'
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'

import { apiArticuloInventarioListado } from '../../../../../base/api/apiArticuloInventarioListado.ts'
import { FilterTypeMap } from '../../../../../base/components/Table/castMrtFilters.ts'
import { genMrtQueryPagination } from '../../../../../base/components/Table/genMrtQueryPagination.ts'
import { MrtDynamicTable } from '../../../../../base/components/Table/MrtDynamicTable.tsx'
import { MrtTableConfig } from '../../../../../base/components/Table/mrtTypes.ts'
import { useMrtQuery } from '../../../../../base/components/Table/useMrtQuery.tsx'
import { TipoMontoProps } from '../../../../../base/interfaces/base.ts'
import { EntidadInputProps } from '../../../../../interfaces'
import { ArticuloProps } from '../../../../../interfaces/articulo.ts'
import { notDanger } from '../../../../../utils/notification.ts'
import { ArticuloSeleccionListadoColumns } from './ArticuloSeleccionListadoColumns.tsx'

interface OwnProps extends DialogProps {
  id: string // identificador unico del componente
  entidad: EntidadInputProps
  verificarPrecio?: boolean
  verificarInventario?: boolean
  bloquearCodigosArticulo: string[] // bloquea los articulos según el codigo de articulo
  seleccionMultiple?: boolean // default true
  /** Renderizado de columna precio a precio, delivery, Costo */
  tipoMonto?: TipoMontoProps
  open: boolean
  extraQuery?: string[] // Condiciones extras para filtro de articulos Ej: ["key=1", "key2=2"]
  onClose: (value: ArticuloProps[]) => void
}

type Props = OwnProps

const CLIENT_FILTER_TYPES: FilterTypeMap<ArticuloProps> = {
  'articuloPrecioBase.monedaPrimaria.precio': 'number',
}

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
    tipoMonto = 'precio',
    ...other
  } = props

  const columns = useMemo(() => ArticuloSeleccionListadoColumns(tipoMonto), [tipoMonto])

  // Estado para la selección de filas
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  // Llamada a la api de listado
  const datos = useMrtQuery({
    queryKey: ['articulo-seleccion-listado-dialog', open, entidad, verificarPrecio, verificarInventario],
    queryFn: async (ctx) => {
      // Paginación y filtros
      const pgs = genMrtQueryPagination(ctx, {
        filterTypes: CLIENT_FILTER_TYPES,
        filterFields: extraQuery,
      })
      return await apiArticuloInventarioListado(entidad, pgs, {
        verificarPrecio,
        verificarInventario,
      })
    },
    queryOptions: {
      enabled: open,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
    },
  })

  // Configuración del data table
  const config: MrtTableConfig<ArticuloProps> = {
    id: 'listado-articulos-inventario-a2dd',
    columns,
    manualPagination: true,
    showIconRefetch: true,
    additionalOptions: {
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
      enableRowSelection: (row) => !bloquearCodigosArticulo.includes(row.original.codigoArticulo),
      enableMultiRowSelection: seleccionMultiple,
    },
  }

  /** Seleccion de articulos */
  const onSeleccionArticulos = () => {
    const idsArticulo = Object.keys(rowSelection)
    if (idsArticulo.length > 0) {
      const articulos = (datos.data?.docs || []).filter((a) => idsArticulo.includes(a.codigoArticulo))
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
  }, [open, datos.state.columnFilters])
  /***********************************************************************************/
  /***********************************************************************************/
  /***********************************************************************************/

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { maxHeight: '88vh' } }}
      maxWidth="xl"
      fullWidth
      open={open}
      onClose={() => onClose([])}
      {...other}
    >
      <DialogTitle>Selección de articulos</DialogTitle>
      <IconButton
        aria-label="close"
        title={'Cerrar o presione la tecla ESC'}
        onClick={() => onClose([])}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent>
        <MrtDynamicTable
          config={config}
          {...datos}
          state={{
            ...datos.state, // Mantiene paginación/filtros
            rowSelection, // Agrega la selección
          }}
          onStateChange={{
            ...datos.onStateChange,
            onRowSelectionChange: setRowSelection, // Sincroniza el cambio
          }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button color={'error'} onClick={() => onClose([])}>
          Cerrar
        </Button>
        <Button
          color={'primary'}
          variant={'contained'}
          startIcon={<CheckBoxOutlined />}
          onClick={onSeleccionArticulos}
        >
          Seleccionar Articulo
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ArticuloSeleccionListadoDialog
