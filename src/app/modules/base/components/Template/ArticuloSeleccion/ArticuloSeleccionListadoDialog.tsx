import { CheckBoxOutlined, SelectAllOutlined } from '@mui/icons-material'
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogProps } from '@mui/material'
import React, { FunctionComponent, ReactNode, useMemo } from 'react'

import { apiArticuloInventarioListado } from '../../../../../base/api/apiArticuloInventarioListado.ts'
import { MyDialogTitle } from '../../../../../base/components/Dialog/MyDialogTitle.tsx'
import { FilterTypeMap } from '../../../../../base/components/Table/castMrtFilters.ts'
import { genMrtQueryPagination } from '../../../../../base/components/Table/genMrtQueryPagination.ts'
import { MrtDynamicTable } from '../../../../../base/components/Table/MrtDynamicTable.tsx'
import { MrtTableConfig } from '../../../../../base/components/Table/mrtTypes.ts'
import { useMrtQuery } from '../../../../../base/components/Table/useMrtQuery.tsx'
import { useMrtSelectionBag } from '../../../../../base/components/Table/useMrtSelectionBag.tsx'
import { useToast } from '../../../../../base/contexts/ToastContext.tsx'
import { TipoMontoProps } from '../../../../../base/interfaces/base.ts'
import { EntidadInputProps } from '../../../../../interfaces'
import { ArticuloProps } from '../../../../../interfaces/articulo.ts'
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
  /** Titulo del cuadro de dialogo */
  titulo?: ReactNode | string
  /** Sub-titulo de la tarjeta del cuadro de dialogo */
  subTitulo?: ReactNode | string
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
    titulo = 'Selección de articulos',
    subTitulo = '',
    ...other
  } = props

  const { toast } = useToast()

  const columns = useMemo(() => ArticuloSeleccionListadoColumns(tipoMonto), [tipoMonto])

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
      placeholderData: (previousData) => previousData,
    },
  })

  // Hook del selección automatico
  const { rowSelection, selectedItems, handleRemoveItem, onRowSelectionChange } =
    useMrtSelectionBag<ArticuloProps>({
      open,
      currentDocs: datos.data?.docs,
      idKey: 'codigoArticulo', // Le decimos cuál es la llave principal
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

  /** Seleccion de articulos (Envío final) */
  const onSeleccionArticulos = () => {
    if (selectedItems.length > 0) {
      onClose(selectedItems)
    } else {
      toast.warning('Debe seleccionar al menos un artículo')
    }
  }

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
      <MyDialogTitle onClose={() => onClose([])} icon={SelectAllOutlined} subtitle={subTitulo}>
        {titulo}
      </MyDialogTitle>
      <DialogContent>
        {/* Chips con los artículos seleccionados */}
        <Box
          sx={(theme) => ({
            p: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            minHeight: '40px',
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 3,
            mb: 1,
          })}
        >
          {selectedItems.map((art) => (
            <Chip
              key={art.codigoArticulo}
              label={`${art.codigoArticulo} - ${art.nombreArticulo || ''}`}
              onDelete={() => handleRemoveItem(art.codigoArticulo)}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
          {selectedItems.length === 0 && (
            <span style={{ fontSize: '0.85rem', margin: 'auto 0' }}>No hay artículos seleccionados</span>
          )}
        </Box>
        <MrtDynamicTable
          config={config}
          {...datos}
          state={{
            ...datos.state, // Mantiene paginación/filtros
            rowSelection, // Agrega la selección
          }}
          onStateChange={{
            ...datos.onStateChange,
            onRowSelectionChange: onRowSelectionChange, // Sincroniza el cambio
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
          Seleccionar {selectedItems.length > 0 ? `(${selectedItems.length})` : ''} Artículos
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ArticuloSeleccionListadoDialog
