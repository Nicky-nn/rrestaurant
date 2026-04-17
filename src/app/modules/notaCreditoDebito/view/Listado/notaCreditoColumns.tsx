import { MRT_ColumnDef } from 'material-react-table'
import { numberWithCommas } from '../../../../base/components/MyInputs/NumberInput'
import { Chip } from '@mui/material'
import { apiEstado } from '../../../../interfaces'
import { muiTableApiEstado } from '../../../../utils/muiTable/materialReactTableUtils'
import { NcdProps } from '../../interfaces/ncdInterface'

export const notaCreditoColumns: MRT_ColumnDef<NcdProps>[] = [
  {
    header: 'Nro. Factura',
    accessorKey: 'numeroFactura',
    size: 140,
  },
  {
    header: 'Número NCD',
    accessorKey: 'numeroNotaCreditoDebito',
    size: 140,
  },
  {
    header: 'Razon Social',
    id: 'cliente.razonSocial',
    accessorKey: 'cliente.razonSocial',
    maxSize: 250,
    minSize: 200,
  },
  {
    id: 'cliente.numeroDocumento',
    header: 'Nro. Documento',
    accessorFn: (row) => (
      <span>
        {row.cliente.numeroDocumento}{' '}
        {row.cliente.complemento ? `-${row.cliente.complemento}` : ''}
      </span>
    ),
    filterFn: (row, id, filterValue) =>
      row.original.cliente.numeroDocumento.startsWith(filterValue),
    size: 155,
  },
  // {
  //   accessorKey: 'cuf',
  //   id: 'cuf',
  //   header: 'C.U.F.',
  // },
  {
    accessorKey: 'montoTotalOriginal',
    header: 'Monto.Original',
    Cell: ({ cell }) => <span>{numberWithCommas(cell.getValue() as number, {})}</span>,
    muiTableBodyCellProps: {
      align: 'right',
    },
  },
  {
    accessorKey: 'montoTotalDevuelto',
    header: 'Monto.Devuelto',
    Cell: ({ cell }) => <span>{numberWithCommas(cell.getValue() as number, {})}</span>,
    muiTableBodyCellProps: {
      align: 'right',
    },
  },
  {
    accessorKey: 'state',
    header: 'Estado',
    accessorFn: (row) => (
      <Chip
        color={
          row.state === apiEstado.validada
            ? 'success'
            : row.state === apiEstado.pendiente
              ? 'warning'
              : 'error'
        }
        label={row.state}
        size={'small'}
      />
    ),
    filterVariant: 'select',
    filterSelectOptions: muiTableApiEstado,
    filterFn: (row, id, filterValue) =>
      row.original.state?.toLowerCase().startsWith(filterValue.toLowerCase()) ?? false,
  },
]