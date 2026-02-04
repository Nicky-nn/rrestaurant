import { Ballot, Close, InfoOutlined, Save } from '@mui/icons-material'
import {
  Alert,
  AlertTitle,
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useReactTable } from '@tanstack/react-table'
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  MRT_RowSelectionState,
  MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table'
import React, { useEffect, useMemo, useState } from 'react'

import { apiLotePorArticuloInventarioAlmacenListado } from '../../../../../base/api/apiLotePorArticuloInventarioAlmacenListado.ts'
import { apiLotePorArticuloListado } from '../../../../../base/api/apiLotePorArticuloListado.ts'
import MuiRenderTopToolbarCustomActions from '../../../../../base/components/MuiTable/MuiRenderTopToolbarCustomActions.tsx'
import { MrtDynamicTable } from '../../../../../base/components/Table/MrtDynamicTable.tsx'
import { MrtTableConfig } from '../../../../../base/components/Table/mrtTypes.ts'
import { useMrtQuery } from '../../../../../base/components/Table/useMrtQuery.tsx'
import { apiEstado } from '../../../../../interfaces'
import { LoteProps } from '../../../../../interfaces/lote.ts'
import {
  fechaStringExpirationStatus,
  fechaStringVerificaExpiracion,
} from '../../../../../utils/dayjsHelper.ts'
import {
  MuiTablePaginationProps,
  MuiToolbarAlertBannerProps,
} from '../../../../../utils/muiTable/materialReactTableUtils.ts'
import { MuiTableNormalOptionsProps } from '../../../../../utils/muiTable/muiTableNormalOptionsProps.ts'
import { notError } from '../../../../../utils/notification.ts'
import { apiLoteTipoLista } from './LoteSeleccion.tsx'

interface OwnProps extends Omit<DialogProps, 'onClose'> {
  onClose: (resp?: LoteProps | null) => void
  codigoArticulo: string
  almacenId?: string
  inventarioId?: string
  tipoLista: any // es de LoteSeleccionTipoLista
  validarFechaVencimiento?: boolean
  open: boolean
}

// Componente auxiliar para la leyenda
const LegendItem = ({ color, text }: { color: string; text: string }) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: color }} />
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
      {text}
    </Typography>
  </Stack>
)

type Props = OwnProps

/**
 * Componente que nos permite seleccionar un lote de un artículo, es una funcion auxiliar de SeleccionArticuloDialog
 * asociado al lote
 * @param props
 * @author isi-template
 * @constructor
 */
const LoteSeleccionPorArticuloListadoDialog: React.FC<Props> = (props) => {
  const {
    onClose,
    open,
    codigoArticulo,
    tipoLista,
    almacenId,
    inventarioId,
    validarFechaVencimiento = false,
    ...others
  } = props

  const theme = useTheme()

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({}) //ts type available

  const {
    data: lotes = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      'lotes-por-articulo-servidor',
      codigoArticulo,
      almacenId,
      inventarioId,
      tipoLista,
    ],
    enabled: () => {
      if (!codigoArticulo) return false
      if (apiLoteTipoLista.almacen === tipoLista) {
        return !!(almacenId && inventarioId)
      }
      return true
    },
    queryFn: async () => {
      if (tipoLista == apiLoteTipoLista.articulo) {
        return await apiLotePorArticuloListado(codigoArticulo)
      }

      if (tipoLista === apiLoteTipoLista.almacen) {
        if (!inventarioId || !almacenId) return []
        return await apiLotePorArticuloInventarioAlmacenListado(
          codigoArticulo,
          inventarioId,
          almacenId,
        )
      }
      return []
    },
  })

  // 2. Columnas con MRT_ColumnDef<Lote>
  const columns = useMemo<MRT_ColumnDef<LoteProps>[]>(
    () => [
      {
        accessorKey: 'codigoLote',
        header: 'Lote',
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        enableColumnFilter: true,
        size: 200,
      },
      {
        accessorKey: 'codigoArticulo',
        header: 'Cód. Artículo',
        size: 120,
        Cell: ({ cell }) => cell.getValue<string>() ?? 'N/A',
      },
      {
        accessorKey: 'fechaAdmision',
        header: 'Admisión',
        size: 150,
      },
      {
        accessorKey: 'fechaFabricacion',
        header: 'Fabricación',
        size: 150,
      },
      {
        accessorKey: 'fechaVencimiento',
        header: 'Vencimiento',
        size: 150,
      },
      {
        accessorKey: 'atributo1',
        header: 'Atributo 1',
        size: 100,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'atributo2',
        header: 'Atributo 2',
        size: 100,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'state',
        header: 'Estado',
        size: 110,
        enableColumnFilter: false,
        Cell: ({ cell }) => {
          const state = cell.getValue<string>()
          return (
            <Chip
              label={state}
              size="small"
              color={state === apiEstado.elaborado ? 'success' : 'default'}
              variant="filled"
            />
          )
        },
      },
    ],
    [],
  )

  const statusColors = {
    expired: alpha(theme.palette.error.light, 0.5), // Rojo suave
    warning: alpha(theme.palette.warning.light, 0.5), // Naranja/Amarillo suave
    healthy: alpha(theme.palette.success.light, 0.5), // Verde suave
  }

  const config: MrtTableConfig<LoteProps> = {
    id: 'listado-lotes-por-seleccion',
    columns,
    manualPagination: false,
    enableSelection: true,
    multiSelection: false,
    showIconRefetch: true,
    renderBottomToolbarCustomActions: () => (
      <MuiRenderTopToolbarCustomActions refetch={refetch} />
    ),
    additionalOptions: {
      enableTopToolbar: false,
      enableBottomToolbar: true,
      enableTableFooter: false,
      getRowId: (row) => row._id,
      muiTableBodyRowProps: ({ row }) => {
        const status = fechaStringExpirationStatus(row.original.fechaVencimiento, 30)
        return {
          onClick: row.getToggleSelectedHandler(),
          sx: {
            cursor: 'pointer',
            backgroundColor: statusColors[status],
            '&:hover': {
              backgroundColor: alpha(statusColors[status], 0.2), // Un poco más intenso en hover
            },
            // Añadimos un borde izquierdo para reforzar el color
            borderLeft: `5px solid ${
              status === 'expired'
                ? theme.palette.error.main
                : status === 'warning'
                  ? theme.palette.warning.main
                  : theme.palette.success.main
            }`,
          },
        }
      },
    },
  }

  const handleConfirmAction = () => {
    const selectedRows = lotes.filter((item) =>
      Object.keys(rowSelection).includes(item._id),
    )
    if (selectedRows.length > 0) {
      // Verificamos si se debe validar la expiracion
      if (
        validarFechaVencimiento &&
        fechaStringVerificaExpiracion(selectedRows[0].fechaVencimiento)
      ) {
        // Si la fecha está vencida, no permitimos la selección
        notError(
          `El producto / articulo expiro el ${selectedRows[0].fechaVencimiento}. Seleccione o registre un nuevo lote`,
        )
        return
      } else {
        onClose(selectedRows[0])
      }
    }
  }

  /**********************************************************************************/
  /**********************************************************************************/
  useEffect(() => {
    if (open) {
      setRowSelection({})
    }
  }, [open])

  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="xl" {...others}>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction={'row'} spacing={0.5}>
          <Ballot sx={{ color: 'primary.main' }} />
          <Typography fontSize={'large'}>Selección de Lotes</Typography>
        </Stack>
      </DialogTitle>

      <IconButton
        aria-label="close"
        title={'Cerrar o presione la tecla ESC'}
        onClick={() => onClose()}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>

      <DialogContent dividers>
        <Box sx={{ p: 1, mb: 1, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
          <Alert
            severity="info"
            variant="outlined"
            icon={<InfoOutlined fontSize="small" />}
            sx={{ borderStyle: 'dashed', backgroundColor: 'background.paper' }}
          >
            <AlertTitle sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
              Guía de colores de vencimiento
            </AlertTitle>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={1}>
              <LegendItem
                color={statusColors.healthy}
                text="Vigente (Vence en +30 días)"
              />
              <LegendItem
                color={statusColors.warning}
                text="Próximo a vencer (<30 días)"
              />
              <LegendItem color={statusColors.expired} text="Lote Vencido" />
            </Stack>
          </Alert>
        </Box>
        <MrtDynamicTable
          config={config}
          data={lotes}
          state={{
            rowSelection,
          }}
          onStateChange={{
            onRowSelectionChange: setRowSelection,
          }}
          isLoading={isLoading}
          refetch={refetch}
          isError={isError}
          isFetching={isFetching}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button color={'error'} onClick={() => onClose()}>
          Cerrar
        </Button>
        <Button
          color={'primary'}
          variant={'contained'}
          size={'small'}
          startIcon={<Save />}
          disabled={Object.keys(rowSelection).length === 0}
          onClick={handleConfirmAction}
        >
          Confirmar Selección ({Object.keys(rowSelection).length})
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LoteSeleccionPorArticuloListadoDialog
