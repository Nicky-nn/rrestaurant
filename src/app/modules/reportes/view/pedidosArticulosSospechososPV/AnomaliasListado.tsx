import { Download, Info } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Tooltip,
} from '@mui/material'
import dayjs from 'dayjs'
import exportFromJSON from 'export-from-json'
import { MRT_ColumnDef } from 'material-react-table'
import { MrtDynamicTable } from '../../../../base/components/Table/MrtDynamicTable'
import { MrtTableConfig } from '../../../../base/components/Table/mrtTypes'
import React, { useCallback, useMemo, useState } from 'react'

import { ReporteHistorialPedido } from './ReporteHistoralPedido'
import { DetalleAnomalia } from './DetalleAnomilia'
import { useAppConfirm } from '../../../../base/contexts/AppConfirmProvider'

export type Anomalia = {
  articuloId: string
  fecha: string
  nombre: string
  cantidad: number
  descripcion: string
  resumenCambios?: string
  motivosSospecha?: string[]
  precio: number
  autor: string
  estadoArticulo: string
  accion?: string
  sucursal?: string
  puntoVenta?: string
  pedidoId?: string
  numeroPedido?: string
  orden?: number
}

interface Props {
  anomalias: Anomalia[]
}

const AnomaliasListado: React.FC<Props> = ({ anomalias }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Anomalia | null>(null)
  const { requestConfirm } = useAppConfirm()

  const columns = useMemo<MRT_ColumnDef<Anomalia>[]>(
    () => [
      {
        id: 'acciones',
        header: 'Acciones',
        size: 80,
        Cell: ({ row }) => (
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setPedidoSeleccionado(row.original)
              setOpenDialog(true)
            }}
            sx={{ minWidth: 'auto', padding: '4px' }}
            aria-label="Ver especificaciones del pedido"
            title="Ver Especificaciones"
          >
            <Info fontSize="small" />
          </Button>
        ),
      },
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        size: 160,
      },
      { accessorKey: 'autor', header: 'Autor', size: 100 },
      {
        accessorFn: (row) => `${row.numeroPedido} - ${row.orden}`,
        id: 'pedidoOrden',
        header: 'Pedido / Orden',
        size: 140,
      },
      { accessorKey: 'nombre', header: 'Artículo', size: 200 },
      {
        accessorKey: 'cantidad',
        header: 'Cantidad',
        size: 100,
      },
      {
        accessorFn: (row) => row.motivosSospecha?.join(', ') || '-',
        id: 'motivosSospecha',
        header: 'Motivos Sospecha',
        size: 240,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>()
          return (
            <Tooltip title={value} placement="top" arrow>
              <div
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '220px'
                }}
              >
                {value}
              </div>
            </Tooltip>
          )
        }
      },
      {
        accessorKey: 'precio',
        header: 'Precio',
        size: 110,
        Cell: ({ cell }) =>
          cell.getValue<number>() != null ? cell.getValue<number>().toFixed(2) : '-',
      },
    ],
    [],
  )

  const onExportarCSV = useCallback(async () => {
    if (!anomalias || anomalias.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    const confirm = await requestConfirm({
      title: 'Exportar Reporte',
      description: '¿Está seguro que desea exportar el listado de anomalías en formato CSV?',
      confirmationText: 'Exportar',
      confirmButtonColor: 'primary'
    })

    if (!confirm.confirmed) return

    const dataToExport = anomalias.map((item) => ({
      'Pedido / Orden': `${item.numeroPedido ?? ''} - ${item.orden ?? ''}`,
      'Sucursal / PV': `${item.sucursal ?? ''} - ${item.puntoVenta ?? ''}`,
      Artículo: item.nombre,
      Cantidad: item.cantidad,
      'Resumen Cambios': item.resumenCambios || '',
      'Motivos Sospecha': item.motivosSospecha?.join(', ') || '',
      Precio: item.precio?.toFixed(2) || '',
      Autor: item.autor,
      Fecha: item.fecha || '',
      'Estado Artículo': item.estadoArticulo,
    }))

    exportFromJSON({
      data: dataToExport,
      fileName: 'reporte_anomalias',
      exportType: exportFromJSON.types.csv,
      delimiter: ';',
      withBOM: true,
    })
  }, [anomalias, requestConfirm])

  const config = useMemo<MrtTableConfig<Anomalia>>(
    () => ({
      id: 'anomalias-listado',
      columns,
      renderTopToolbarCustomActions: () => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Download />}
          onClick={onExportarCSV}
          sx={{ m: 1 }}
        >
          Exportar CSV
        </Button>
      ),
      renderDetailPanel: (row) => (
          <DetalleAnomalia
            anomalia={row}
          />
      ),
      additionalOptions: {
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        initialState: {
          density: 'compact',
        },
        enableColumnActions: false,
        enableRowActions: false,
        muiTablePaperProps: {
          elevation: 0,
          sx: { backgroundColor: 'transparent' },
        },
      },
    }),
    [columns, anomalias, onExportarCSV]
  )

  return (
    <>
      <Paper
        elevation={1}
      >
        <MrtDynamicTable
          config={config}
          data={anomalias}
        />
      </Paper>

      {/* Diálogo para mostrar especificaciones del pedido */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Evolución del Pedido Nº {pedidoSeleccionado?.numeroPedido ?? ''}
        </DialogTitle>
        <DialogContent dividers>
          {pedidoSeleccionado ? (
            <ReporteHistorialPedido
              pedidoId={pedidoSeleccionado.pedidoId || ''}
            />
          ) : (
            <div>No hay datos para mostrar</div>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AnomaliasListado
