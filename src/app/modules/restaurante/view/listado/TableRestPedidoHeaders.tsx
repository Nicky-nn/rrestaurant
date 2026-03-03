import { alpha, Chip, MenuItem, Select, TextField } from '@mui/material'
import { MRT_ColumnDef } from 'material-react-table'

import { RestPedido } from '../../types'

export const tableColumns: MRT_ColumnDef<RestPedido>[] = [
  {
    accessorKey: 'numeroPedido',
    header: 'Nro. Pedido',
    size: 110,
    visibleInShowHideMenu: false,
    enableHiding: true,
  },
  {
    accessorKey: 'numeroOrden',
    header: 'Orden / Mesa',
    size: 130,
    enableSorting: false,
    Cell: ({ row }) => `${row.original.numeroOrden ?? '-'} / ${row.original.mesa?.nombre ?? '-'}`,
  },
  {
    id: 'productos',
    accessorFn: (row) => (row.productos?.length ? `${row.productos.length} producto(s)` : 'Sin productos'),
    header: 'Producto',
    size: 130,
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    accessorKey: 'cliente.razonSocial',
    header: 'Razón Social',
  },
  {
    id: 'cliente.numeroDocumento',
    accessorKey: 'cliente.numeroDocumento',
    accessorFn: (row) =>
      row.cliente?.numeroDocumento
        ? `${row.cliente.numeroDocumento}${row.cliente.complemento ? `-${row.cliente.complemento}` : ''}`
        : '-',
    header: 'Nro. Documento',
    size: 140,
  },
  {
    accessorKey: 'fechaDocumento',
    header: 'Fecha',
    size: 160,
    enableSorting: false,
    Filter: ({ column }) => (
      <TextField
        type="date"
        size="small"
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        slotProps={{ htmlInput: { max: new Date().toISOString().split('T')[0] } }}
        sx={{ width: 150, mt: 0.5 }}
      />
    ),
  },
  {
    accessorKey: 'montoTotal',
    header: 'Monto Total',
    size: 120,
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const val = cell.getValue<number>()
      return val != null ? val.toFixed(2) : '-'
    },
  },
  {
    accessorKey: 'usucre',
    header: 'Usuario',
    size: 130,
  },
  {
    id: 'state',
    accessorKey: 'state',
    header: 'Estado',
    size: 120,
    Filter: ({ column }) => (
      <Select
        size="small"
        displayEmpty
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        sx={{ minWidth: 120, mt: 0.5 }}
      >
        <MenuItem value="">
          <em>Todos</em>
        </MenuItem>
        {['ELABORADO', 'COMPLETADO', 'FINALIZADO', 'ANULADO'].map((v) => (
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </Select>
    ),
    Cell: ({ cell }) => {
      const val = cell.getValue<string>()
      // Colores custom del tema: funcionan en light y dark mode
      // El sx con alpha(contrastText) garantiza legibilidad en ambos modos
      const colorMap: Record<string, 'yellow' | 'cyan' | 'green' | 'error'> = {
        ELABORADO: 'yellow', // pendiente/en proceso
        COMPLETADO: 'cyan', // procesado
        FINALIZADO: 'green', // cerrado ok
        ANULADO: 'error', // usa el rojo estándar de MUI (no requiere sx)
      }
      const color = colorMap[val] ?? 'yellow'
      if (color === 'error') {
        return <Chip size="small" label={val} color="error" variant="filled" />
      }
      return (
        <Chip
          size="small"
          label={val}
          color={color as any}
          variant="filled"
          sx={{ color: (theme) => alpha((theme.palette as any)[color].contrastText, 0.9) }}
        />
      )
    },
  },
  {
    accessorKey: 'tipoDocumento',
    header: 'Tipo Documento',
    size: 130,
    enableSorting: false,
    Filter: ({ column }) => (
      <Select
        size="small"
        displayEmpty
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        sx={{ minWidth: 120, mt: 0.5 }}
      >
        <MenuItem value="">
          <em>Todos</em>
        </MenuItem>
        <MenuItem value="FACTURA">FACTURA</MenuItem>
        <MenuItem value="NOTA_VENTA">NOTA_VENTA</MenuItem>
      </Select>
    ),
    // Colorea el fondo de la celda según el tipo, adaptado a light/dark
    muiTableBodyCellProps: ({ cell }) => ({
      sx: (theme) => {
        const val = cell.getValue<string>()
        const isDark = theme.palette.mode === 'dark'
        const colorKey = val === 'NOTA_VENTA' ? 'orange' : 'green'
        const paletteColor = (theme.palette as any)[colorKey]
        return {
          backgroundColor: alpha(paletteColor.main, isDark ? 0.25 : 0.18),
          color: isDark ? '#ffffff' : '#000000',
        }
      },
    }),
  },
]
