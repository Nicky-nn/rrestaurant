import { Assessment, Refresh } from '@mui/icons-material'
import { alpha, Box, Button, Chip, IconButton, Tooltip, Typography } from '@mui/material'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { FC, useMemo, useState } from 'react'

import useAuth from '../../../base/hooks/useAuth'
import { MuiToolbarAlertBannerProps } from '../../../utils/muiTable/materialReactTableUtils'
import { MuiTableNormalOptionsProps } from '../../../utils/muiTable/muiTableNormalOptionsProps'
import { useArqueoCajaListado } from '../queries/useArqueoCajaListado'
import { ArqueoCaja } from '../types'
import ArqueoCajaDetalleDialog from './ArqueoCajaDetalleDialog'

// ─── helpers ──────────────────────────────────────────────────────────────────

const parseFechaDMY = (fecha?: string): Date | null => {
  if (!fecha) return null
  const [datePart, timePart] = fecha.split(' ')
  if (!datePart) return null
  const [day, month, year] = datePart.split('/')
  const iso = `${year}-${month}-${day}${timePart ? 'T' + timePart : ''}`
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

const formatFechaHora = (fecha?: string) => {
  const d = parseFechaDMY(fecha)
  if (!d) return '—'
  return d.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })
}

const fmtMoney = (amount?: number) => (amount != null ? `${Number(amount).toFixed(2)} BOB` : '—')

// ─── Chip estado con color y valor raw ───────────────────────────────────────

const STATE_COLORS: Record<string, { color: string; bg: string }> = {
  FINALIZADO: { color: '#16a34a', bg: '#dcfce7' },
  ELABORADO: { color: '#2563eb', bg: '#dbeafe' },
  ARQUEO: { color: '#d97706', bg: '#fef3c7' },
}

const EstadoChip: FC<{ state?: string }> = ({ state }) => {
  const s = state ?? '—'
  const colors = STATE_COLORS[s] ?? { color: '#6b7280', bg: '#f3f4f6' }
  return (
    <Chip
      label={s}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.7rem',
        letterSpacing: 0.3,
        color: colors.color,
        bgcolor: colors.bg,
        border: `1px solid ${alpha(colors.color, 0.3)}`,
      }}
    />
  )
}

// ─── Chip diferencia ─────────────────────────────────────────────────────────

const DiferenciaChip: FC<{ diferencia?: number }> = ({ diferencia }) => {
  if (diferencia == null) return <Typography variant="caption">—</Typography>
  const isOk = diferencia === 0
  const isPos = diferencia > 0
  const color = isOk ? '#16a34a' : isPos ? '#2563eb' : '#dc2626'
  const bg = isOk ? '#dcfce7' : isPos ? '#dbeafe' : '#fee2e2'
  return (
    <Chip
      label={`${diferencia > 0 ? '+' : ''}${Number(diferencia).toFixed(2)} BOB`}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.7rem',
        color,
        bgcolor: bg,
        border: `1px solid ${alpha(color, 0.3)}`,
      }}
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const HistorialCajas: FC = () => {
  const { user } = useAuth()
  const { usuario, sucursal, puntoVenta } = user

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Trae todas las cajas del sistema y filtramos en cliente porque la API
  // no soporta filtros con notacion de punto en campos anidados.
  // Pedimos suficientes registros para poder paginar en cliente.
  const { data, isLoading, isError, isRefetching, refetch } = useArqueoCajaListado(
    { limit: 200, query: 'state=FINALIZADO', reverse: true },
    { staleTime: 60_000 },
  )

  // Filtrado cliente: solo cajas de este punto de venta y sucursal
  const rows = useMemo<ArqueoCaja[]>(() => {
    const docs = data?.docs ?? []
    return docs.filter(
      (d) =>
        d.puntoVenta?.codigo === puntoVenta.codigo &&
        d.sucursal?.codigo === sucursal.codigo &&
        d.usuarioApertura === usuario,
    )
  }, [data?.docs, puntoVenta.codigo, sucursal.codigo, usuario])

  // Derivado de rows — debe ir DESPUÉS del useMemo de rows
  const selectedCaja = selectedIndex !== null ? (rows[selectedIndex] ?? null) : null

  const columns = useMemo<MRT_ColumnDef<ArqueoCaja>[]>(
    () => [
      {
        accessorKey: 'cajaCodigo',
        header: 'Caja',
        size: 100,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={700}>
            {cell.getValue<string>() ?? '—'}
          </Typography>
        ),
      },
      {
        id: 'turno',
        header: 'Turno',
        size: 110,
        accessorFn: (row) => row.turnoCaja?.nombre ?? '—',
        Cell: ({ cell }) => (
          <Typography variant="body2" color="text.secondary">
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'fechaApertura',
        header: 'Apertura',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2">{formatFechaHora(cell.getValue<string>())}</Typography>
        ),
      },
      {
        accessorKey: 'fechaCierre',
        header: 'Cierre',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2">{formatFechaHora(cell.getValue<string>())}</Typography>
        ),
      },
      {
        id: 'cajero',
        header: 'U. (Apertura / Cierre)',
        size: 190,
        accessorFn: (row) => `${row.usuarioApertura ?? '—'} / ${row.usuarioCierre ?? '—'}`,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" color="text.primary">
              {row.original.usuarioApertura ?? '—'}
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mx: 0.3 }}>
              /
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.original.usuarioCierre ?? '—'}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'nroVentas',
        header: 'Ventas',
        size: 120,
        muiTableBodyCellProps: { align: 'center' },
        muiTableHeadCellProps: { align: 'center' },
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<number>() ?? 0}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.78rem',
              bgcolor: (t) => alpha(t.palette.text.primary, 0.07),
            }}
          />
        ),
      },
      {
        accessorKey: 'totalVentas',
        header: 'Total Ventas',
        size: 130,
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight={700}>
            {fmtMoney(cell.getValue<number>())}
          </Typography>
        ),
      },
      {
        accessorKey: 'montoInicial',
        header: 'Fondo Inicial',
        size: 120,
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
        Cell: ({ cell }) => <Typography variant="body2">{fmtMoney(cell.getValue<number>())}</Typography>,
      },
      {
        accessorKey: 'montoReal',
        header: 'Total Declarado',
        size: 140,
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <Typography variant="body2" fontWeight={600} color="primary.main">
            {fmtMoney(row.original.montoReal ?? row.original.montoTeorico)}
          </Typography>
        ),
      },
      {
        accessorKey: 'diferencia',
        header: 'Diferencia',
        size: 130,
        muiTableBodyCellProps: { align: 'center' },
        muiTableHeadCellProps: { align: 'center' },
        Cell: ({ cell }) => <DiferenciaChip diferencia={cell.getValue<number>()} />,
      },
      {
        accessorKey: 'state',
        header: 'Estado',
        size: 130,
        muiTableBodyCellProps: { align: 'center' },
        muiTableHeadCellProps: { align: 'center' },
        Cell: ({ cell }) => <EstadoChip state={cell.getValue<string>()} />,
      },
    ],
    [],
  )

  const table = useMaterialReactTable({
    ...(MuiTableNormalOptionsProps as MRT_TableOptions<ArqueoCaja>),
    columns,
    data: rows,
    // Paginación cliente
    manualPagination: false,
    onPaginationChange: setPagination,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      density: 'compact',
      pagination,
    },
    enablePagination: true,
    enableBottomToolbar: true,
    paginationDisplayMode: 'pages',
    muiPaginationProps: {
      color: 'primary',
      rowsPerPageOptions: [10, 20, 50],
      shape: 'rounded',
      variant: 'outlined',
    },
    // Click en fila para abrir el dialog
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => setSelectedIndex(row.index),
      sx: { cursor: 'pointer' },
    }),
    renderRowActions: ({ row }) => {
      const pdf = row.original.representacionGrafica?.pdf
      if (!pdf) return null
      return (
        <Tooltip title="Ver Arqueo Completo">
          <a href={pdf} target="_blank" rel="noopener noreferrer">
            <IconButton
              size="small"
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.08) },
              }}
            >
              <Assessment fontSize="small" />
            </IconButton>
          </a>
        </Tooltip>
      )
    },
    // Toolbar
    enableColumnActions: false,
    muiToolbarAlertBannerProps: MuiToolbarAlertBannerProps(isError),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Refresh sx={{ fontSize: '1rem !important' }} />}
          onClick={() => refetch()}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '0.8rem',
          }}
        >
          Actualizar
        </Button>
        <Typography variant="caption" color="text.secondary">
          {rows.length} registro{rows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    ),
    localization: MRT_Localization_ES,
    // Mensaje vacio
    renderEmptyRowsFallback: () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Sin historial de cajas
        </Typography>
        <Typography variant="caption" color="text.disabled">
          No hay cajas cerradas en este punto de venta
        </Typography>
      </Box>
    ),
  })

  return (
    <>
      <MaterialReactTable table={table} />
      <ArqueoCajaDetalleDialog
        open={selectedIndex !== null}
        caja={selectedCaja}
        onClose={() => setSelectedIndex(null)}
        canPrev={selectedIndex !== null && selectedIndex > 0}
        canNext={selectedIndex !== null && selectedIndex < rows.length - 1}
        onPrev={() => setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
        onNext={() => setSelectedIndex((i) => (i !== null && i < rows.length - 1 ? i + 1 : i))}
      />
    </>
  )
}

export default HistorialCajas
