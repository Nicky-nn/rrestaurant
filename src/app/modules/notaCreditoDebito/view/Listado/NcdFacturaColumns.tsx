import { MRT_ColumnDef } from 'material-react-table'
import { numberWithCommas } from '../../../../base/components/MyInputs/NumberInput'
import { genReplaceEmpty } from '../../../../utils/helper'
import { SalidaFactura } from '../../../restaurante/types'

export const NcdFacturaColumns: MRT_ColumnDef<SalidaFactura>[] = [
  {
    header: 'Número',
    accessorKey: 'numeroFactura',
    size: 120,
  },
  {
    accessorKey: 'fechaEmision',
    header: 'Fecha Emisión',
    id: 'fechaEmision',
    size: 150,
    enableColumnFilter: false,
  },
  {
    header: 'Importe',
    accessorKey: 'montoTotal',
    muiTableBodyCellProps: {
      align: 'right',
    },
    Cell: ({ cell }) => <span>{numberWithCommas(cell.getValue() as number, {})}</span>,
    size: 100,
    enableColumnFilter: false,
  },
  {
    header: 'Razon Social',
    id: 'cliente.razonSocial',
    accessorKey: 'cliente.razonSocial',
    maxSize: 180,
  },
  {
    id: 'cliente.numeroDocumento',
    header: 'Nro. Documento',
    accessorFn: (row) => (
      <span>
        {row.cliente?.numeroDocumento}{' '}
        {row.cliente?.complemento ? `-${row.cliente?.complemento}` : ''}
      </span>
    ),
    filterFn: (row, id, filterValue) =>
      row.original.cliente?.numeroDocumento?.startsWith(filterValue) ?? false,
  },
  {
    accessorKey: 'cuf',
    id: 'cuf',
    header: 'C.U.F.',
  },
  {
    accessorKey: 'state',
    id: 'state',
    header: 'ESTADO',
  },
]