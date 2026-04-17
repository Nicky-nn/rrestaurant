import { Checkbox } from '@mui/material'
import { MRT_ColumnDef } from 'material-react-table'
import React from 'react'

import { ArticuloOperacion } from '../../types'

export type ItemAnular = ArticuloOperacion & { selected: boolean; restoreStock: boolean }

export const getAnularPedidoColumns = (
  setItemsAnular: React.Dispatch<React.SetStateAction<ItemAnular[]>>
): MRT_ColumnDef<ItemAnular>[] => [
  {
    id: 'selected',
    header: 'Anular',
    size: 80,
    Cell: ({ row }) => (
      <Checkbox
        size="small"
        checked={row.original.selected}
        onChange={(e) => {
          const checked = e.target.checked
          setItemsAnular((prev) =>
            prev.map((item, idx) => (idx === row.index ? { ...item, selected: checked } : item))
          )
        }}
      />
    ),
  },
  {
    accessorKey: 'nroItem',
    header: 'Item Number',
    size: 55,
  },
  {
    accessorKey: 'codigoArticulo',
    header: 'Codigo Articulo',
    size: 100,
  },
  {
    accessorKey: 'nombreArticulo',
    header: 'Artículo',
  },
  {
    accessorFn: (row) => row.articuloPrecio?.cantidad ?? 0,
    id: 'cantidad',
    header: 'Cantidad',
    size: 80,
  },
  {
    id: 'restoreStock',
    header: 'Restablecer Stock',
    size: 130,
    Cell: ({ row }) => (
      <Checkbox
        size="small"
        checked={row.original.restoreStock}
        onChange={(e) => {
          const checked = e.target.checked
          setItemsAnular((prev) =>
            prev.map((item, idx) => (idx === row.index ? { ...item, restoreStock: checked } : item))
          )
        }}
      />
    ),
  },
]
