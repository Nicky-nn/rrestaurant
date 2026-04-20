import { Download, Info } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
} from '@mui/material'
import dayjs from 'dayjs'
import exportFromJSON from 'export-from-json'
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table'
import React, { useMemo, useState } from 'react'

import { HistorialPedido } from '../../../pos/view/listado/ReporteHistoralPedido'
import { DetalleAnomalia } from './DetalleAnomilia'

export type Anomalia = {
  articuloId: string
  fecha: string
  nombre: string
  cantidad: number
  descripcion: string
  precio: number
  autor: string
  estadoArticulo: string
  sucursal?: string
  puntoVenta?: string
  pedidoId?: string
  numeroPedido?: string
  orden?: number
  productos?: any[]
  historial?: any[]
  usucre?: string
  fechaDocumento?: string
  numeroOrden?: number
}

interface Props {
  anomalias: Anomalia[]
}

const AnomaliasListado: React.FC<Props> = ({ anomalias }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Anomalia | null>(null)

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
      {
        accessorFn: (row) => `${row.sucursal} - ${row.puntoVenta}`,
        id: 'sucursalPunto',
        header: 'Sucursal / PV',
        size: 125,
      },
      { accessorKey: 'nombre', header: 'Artículo', size: 200 },
      {
        accessorKey: 'cantidad',
        header: 'Cantidad',
        size: 100,
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        size: 240,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>() || '-'
          const valueLower = value.toLowerCase()
          let color = 'inherit'
          let fontWeight: 'normal' | 'bold' = 'normal'

          if (valueLower.includes('eliminado') || valueLower.includes('eliminación')) {
            color = 'red'
            fontWeight = 'bold'
          } else if (valueLower.includes('disminución')) {
            color = 'orange'
          } else if (valueLower.includes('aumento')) {
            color = 'green'
          }

          return <span style={{ color, fontWeight }}>{value}</span>
        },
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

  const onExportarCSV = () => {
    if (!anomalias || anomalias.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    const dataToExport = anomalias.map((item) => ({
      'Pedido / Orden': `${item.numeroPedido || ''} - ${item.orden || ''}`,
      'Sucursal / PV': `${item.sucursal || ''} - ${item.puntoVenta || ''}`,
      Artículo: item.nombre,
      Cantidad: item.cantidad,
      Descripción: item.descripcion,
      Precio: item.precio?.toFixed(2) || '',
      Autor: item.autor,
      Fecha: dayjs(item.fecha).format('YYYY-MM-DD HH:mm'),
      'Estado Artículo': item.estadoArticulo,
    }))

    exportFromJSON({
      data: dataToExport,
      fileName: 'reporte_anomalias',
      exportType: exportFromJSON.types.csv,
      delimiter: ';',
      withBOM: true,
    })
  }

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          backgroundColor: '#fff',
          borderRadius: 2,
          p: 1,
        }}
      >
        <MaterialReactTable
          columns={columns}
          data={anomalias}
          enableColumnResizing
          columnResizeMode="onChange"
          initialState={{
            density: 'compact',
          }}
          enableColumnActions={false}
          enableRowActions={false}
          muiTablePaperProps={{
            elevation: 0, // evita doble sombra
            sx: { backgroundColor: 'transparent' }, // para que use el del Paper padre
          }}
          renderTopToolbarCustomActions={() => (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={onExportarCSV}
              sx={{ m: 1 }}
            >
              Exportar CSV
            </Button>
          )}
          renderDetailPanel={({ row }) =>
            row.original.historial && row.original.historial.length > 0 ? (
              <DetalleAnomalia
                articuloId={row.original.articuloId}
                historial={row.original.historial}
                productos={row.original.productos || []}
                fecha={row.original.fechaDocumento || row.original.fecha}
                autor={row.original.usucre || row.original.autor}
              />
            ) : null
          }
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
          Historial del Pedido Nº {pedidoSeleccionado?.numeroPedido ?? ''}
        </DialogTitle>
        <DialogContent dividers>
          {pedidoSeleccionado ? (
            <HistorialPedido
              montoTotal={pedidoSeleccionado.precio}
              historial={pedidoSeleccionado.historial || []}
              productos={pedidoSeleccionado.productos || []}
              numeroPedido={pedidoSeleccionado.numeroPedido || ''}
              fecha={pedidoSeleccionado.fechaDocumento || pedidoSeleccionado.fecha}
              autor={pedidoSeleccionado.usucre || pedidoSeleccionado.autor || ''}
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
