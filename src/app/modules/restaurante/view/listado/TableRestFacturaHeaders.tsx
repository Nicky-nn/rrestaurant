import { alpha, Chip, MenuItem, Select, TextField } from '@mui/material'
import { MRT_ColumnDef } from 'material-react-table'

import { SalidaFactura } from '../../types'

export const tableFacturaColumns: MRT_ColumnDef<SalidaFactura>[] = [
  {
    accessorKey: 'numeroFactura',
    header: 'Nro. Factura',
    size: 110,
    visibleInShowHideMenu: false,
    enableHiding: true,
  },
  {
    id: 'detalle',
    accessorFn: (row) => (row.detalle?.length ? `${row.detalle.length} producto(s)` : 'Sin productos'),
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
    accessorKey: 'fechaEmision',
    header: 'Fecha Emisión',
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
    accessorKey: 'usuario',
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
        {['VALIDADA', 'ANULADA'].map((v) => (
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </Select>
    ),
    Cell: ({ cell }) => {
      const val = cell.getValue<string>()
      const colorMap: Record<string, 'yellow' | 'cyan' | 'green' | 'error'> = {
        VALIDADA: 'green',
        ANULADA: 'error',
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
]
