import { Chip, TextField } from '@mui/material'
import { MRT_ColumnDef } from 'material-react-table'

import { SalidaFactura } from '../../../ventas/types'

export const tableFacturaColumns: MRT_ColumnDef<SalidaFactura>[] = [
  {
    accessorKey: 'numeroFactura',
    header: 'Nro. Factura',
    size: 110,
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
    accessorKey: 'moneda.descripcion',
    header: 'Moneda',
    size: 120,    
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
    Cell: ({ cell }) => {
      const val = cell.getValue<string>()
      const color = val === 'ANULADO' ? 'error' : val === 'VALIDADA' ? 'success' : 'warning'
      return <Chip size="small" label={val || 'PENDIENTE'} color={color} variant="filled" />
    },
  },
]
