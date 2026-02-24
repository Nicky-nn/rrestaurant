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
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { type MRT_ColumnDef, MRT_RowSelectionState } from 'material-react-table'
import React, { useMemo, useState } from 'react'

import { apiLotePorArticuloInventarioAlmacenListado } from '../../../../../base/api/apiLotePorArticuloInventarioAlmacenListado.ts'
import { apiLotePorArticuloListado } from '../../../../../base/api/apiLotePorArticuloListado.ts'
import MuiRenderTopToolbarCustomActions from '../../../../../base/components/MuiTable/MuiRenderTopToolbarCustomActions.tsx'
import { MrtDynamicTable } from '../../../../../base/components/Table/MrtDynamicTable.tsx'
import { MrtTableConfig } from '../../../../../base/components/Table/mrtTypes.ts'
import { MetodoSeleccionLote } from '../../../../../base/services/articuloToArticuloOperacionInputService.ts'
import { apiEstado } from '../../../../../interfaces'
import { LoteProps } from '../../../../../interfaces/lote.ts'
import { alphaByTheme } from '../../../../../utils/colorUtils.ts'
import {
  fechaStringExpirationStatus,
  fechaStringVerificaExpiracion,
} from '../../../../../utils/dayjsHelper.ts'
import { notError } from '../../../../../utils/notification.ts'
import { LoteSeleccionListadoDialogProps } from './LoteSeleccionTypes.ts'
import { procesarLotesDesdeAPI } from './loteSeleccionUtils.ts'

// Componente auxiliar para la leyenda
const LegendItem = ({ color, text }: { color: string; text: string }) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box sx={{ width: 15, height: 15, borderRadius: '2px', bgcolor: color }} />
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
      {text}
    </Typography>
  </Stack>
)

/**
 * Componente que nos permite seleccionar un lote de un artículo, es una funcion auxiliar de SeleccionArticuloDialog
 * asociado al lote, con soporte para ordenamiento FEFO/FIFO y filtros avanzados
 * @param props
 * @author isi-template
 * @constructor
 */
const LoteSeleccionPorArticuloListadoDialog: React.FC<LoteSeleccionListadoDialogProps> = (props) => {
  const {
    onClose,
    open,
    codigoArticulo,
    fuente,
    almacenId,
    inventarioId,
    metodoSeleccion = MetodoSeleccionLote.MANUAL,
    excluirVencidos = false,
    validarFechaVencimiento = false,
    ...others
  } = props

  const theme = useTheme()
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({}) //ts type available

  // ===== CARGA DE LOTES DESDE API =====
  const {
    data: lotesAPI = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['lotes-por-articulo-servidor-dialog', codigoArticulo, almacenId, inventarioId, fuente],
    enabled: () => {
      if (!codigoArticulo) return false
      if (fuente === 'inv') {
        return !!(almacenId && inventarioId)
      }
      return true
    },
    queryFn: async () => {
      if (fuente === 'tbl') {
        return await apiLotePorArticuloListado(codigoArticulo)
      }

      if (fuente === 'inv') {
        if (!inventarioId || !almacenId) return []
        return await apiLotePorArticuloInventarioAlmacenListado(codigoArticulo, inventarioId, almacenId)
      }
      return []
    },
  })

  // ===== PROCESAMIENTO DE LOTES =====
  const lotesProcesados = useMemo(() => {
    return procesarLotesDesdeAPI(lotesAPI, metodoSeleccion, excluirVencidos)
  }, [lotesAPI, metodoSeleccion, excluirVencidos])

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

  // ===== COLORES DE ESTADO =====
  const statusColors = {
    expired: theme.palette.error.light,
    warning: theme.palette.warning.light,
    healthy: theme.palette.success.light,
  }

  // ===== CONFIGURACIÓN DE LA TABLA =====
  const config: MrtTableConfig<LoteProps> = {
    id: 'listado-lotes-por-seleccion',
    columns,
    manualPagination: false,
    enableSelection: true,
    multiSelection: false,
    showIconRefetch: true,
    renderBottomToolbarCustomActions: () => <MuiRenderTopToolbarCustomActions refetch={refetch} />,
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
            backgroundColor: alphaByTheme(
              statusColors[status],
              theme,
              theme.palette.mode === 'light' ? 0.8 : 0.2,
            ),
            '&:hover': {
              backgroundColor: alphaByTheme(
                statusColors[status],
                theme,
                theme.palette.mode === 'light' ? 0.7 : 0.3,
              ), // Un poco más intenso en hover
            },
            // Añadimos un borde izquierdo para reforzar el color
            borderLeft: `5px solid ${
              status === 'expired'
                ? alphaByTheme(theme.palette.error.main, theme)
                : status === 'warning'
                  ? alphaByTheme(theme.palette.warning.main, theme)
                  : alphaByTheme(theme.palette.success.main, theme)
            }`,
          },
        }
      },
    },
  }

  // ===== MANEJO DE CONFIRMACIÓN =====
  const handleConfirmAction = () => {
    const selectedRows = lotesProcesados.filter((item) => Object.keys(rowSelection).includes(item._id))

    if (selectedRows.length > 0) {
      // Verificar si se debe validar la expiración
      if (validarFechaVencimiento && fechaStringVerificaExpiracion(selectedRows[0].fechaVencimiento)) {
        notError(
          `El producto/artículo expiró el ${selectedRows[0].fechaVencimiento}. Seleccione o registre un nuevo lote`,
        )
        return
      }

      onClose(selectedRows[0])
    }
  }
  // ===== TEXTO DEL METODO DE ORDENAMIENTO =====
  const metodoTexto = useMemo(() => {
    switch (metodoSeleccion) {
      case MetodoSeleccionLote.FEFO:
        return 'ordenados por vencimiento (FEFO - más próximo primero)'
      case MetodoSeleccionLote.FIFO:
        return 'ordenados por antigüedad (FIFO - más antiguo primero)'
      case MetodoSeleccionLote.MANUAL:
      default:
        return 'en orden natural del inventario'
    }
  }, [metodoSeleccion])

  /**********************************************************************************/
  /**********************************************************************************/
  // useEffect(() => {
  //   if (open) {
  //     setRowSelection({})
  //   }
  // }, [open])

  // ===== RENDERIZADO =====
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
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Ballot sx={{ color: 'primary.main' }} />
          <Box>
            <Typography fontSize="large">Selección de lotes</Typography>
            {metodoSeleccion !== MetodoSeleccionLote.MANUAL && (
              <Typography variant="caption" color="text.secondary">
                Lotes {metodoTexto}
              </Typography>
            )}
          </Box>
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
                color={
                  theme.palette.mode === 'dark'
                    ? alphaByTheme(statusColors.healthy, theme, 0.5)
                    : statusColors.healthy
                }
                text="Vigente (Vence en +30 días)"
              />
              <LegendItem
                color={
                  theme.palette.mode === 'dark'
                    ? alphaByTheme(statusColors.warning, theme, 0.5)
                    : statusColors.warning
                }
                text="Próximo a vencer (<30 días)"
              />
              <LegendItem
                color={
                  theme.palette.mode === 'dark'
                    ? alphaByTheme(statusColors.expired, theme, 0.6)
                    : statusColors.expired
                }
                text="Lote Vencido"
              />
            </Stack>

            {excluirVencidos && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                ⚠️ Los lotes vencidos están ocultos según la configuración
              </Typography>
            )}
          </Alert>
        </Box>
        <MrtDynamicTable
          config={config}
          data={lotesProcesados}
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
          startIcon={<Save />}
          disabled={Object.keys(rowSelection).length === 0}
          onClick={handleConfirmAction}
        >
          Confirmar selección ({Object.keys(rowSelection).length})
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LoteSeleccionPorArticuloListadoDialog
