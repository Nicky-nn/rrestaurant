import { Chip } from '@mui/material'
import { MRT_ColumnDef } from 'material-react-table'

import { genReplaceEmpty } from '../../../../utils/helper'
import { ClientProps } from '../../interfaces/client'

export const tableColumns: MRT_ColumnDef<ClientProps>[] = [
  {
    accessorKey: 'codigoCliente',
    header: 'Código Cliente',
    size: 130,
    enableSorting: true,
  },
  {
    accessorKey: 'razonSocial',
    header: 'Razon Social',
  },
  {
    accessorKey: 'nombres',
    header: 'Nombre(s)',
    accessorFn: (row) => `${genReplaceEmpty(row.nombres, '')} ${row.apellidos || ''}`,
  },
  {
    accessorFn: (row) => `${row.numeroDocumento}${row.complemento ? `-${row.complemento}` : ''}`,
    accessorKey: 'numeroDocumento',
    header: 'Nro. Documento',
  },
  {
    header: 'Correo',
    accessorKey: 'email',
  },
  {
    accessorKey: 'tipoDocumentoIdentidad.descripcion',
    header: 'Tipo Documento',
  },
  {
    accessorKey: 'telefono',
    header: 'Teléfono ',
  },
  {
    accessorKey: 'state',
    Cell: ({ renderedCellValue }) => <Chip size={'small'} label={renderedCellValue} color={'success'} />,
    header: 'Estado',
    size: 120,
    enableColumnFilter: false,
  },
]
