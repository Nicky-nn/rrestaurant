import { AllInclusive } from '@mui/icons-material'
import { blue, green, orange, yellow } from '@mui/material/colors'
import { MRT_ColumnDef } from 'material-react-table'
import React from 'react'

import MontoMonedaTexto from '../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { ArticuloProps } from '../../../../interfaces/articulo.ts'

/**
 * Columnas para el listado de articulos
 * @author isi-template
 */
export const ArticuloSeleccionListadoColumns: MRT_ColumnDef<ArticuloProps>[] = [
  {
    id: 'codigoArticulo',
    accessorKey: 'codigoArticulo',
    header: 'Código',
    footer: 'Código',
    enableSorting: false,
    enableColumnActions: false,
    size: 130,
  },
  {
    id: 'nombreArticulo',
    accessorKey: 'nombreArticulo',
    header: 'Nombre',
    footer: 'Nombre',
    enableSorting: false,
    enableColumnActions: false,
  },
  {
    accessorKey: 'articuloPrecioBase.monedaPrimaria.precio',
    header: `Precio`,
    footer: `Precio`,
    muiTableBodyCellProps: {
      align: 'right',
    },
    Cell: ({ row }) => {
      return (
        <MontoMonedaTexto
          monto={row.original.articuloPrecioBase?.monedaPrimaria?.precio}
          sigla={row.original.articuloPrecioBase?.monedaPrimaria?.moneda?.sigla}
        />
      )
    },
    enableColumnFilter: false,
    enableSorting: false,
    enableColumnActions: false,
    size: 130,
  },
  {
    id: 'totalStock',
    header: `T. Stock`,
    footer: `T. Stock`,
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: blue[100],
      },
      align: 'right',
    },
    Cell: ({ row: { original } }) => {
      if (original.verificarStock) {
        if (original.inventario.length > 0)
          return <MontoMonedaTexto monto={original.inventario[0].totalStock} />
        else return <>--</>
      } else {
        if (original.inventario.length > 0) return <AllInclusive fontSize={'small'} />
        else return <>--</>
      }
    },
    enableColumnFilter: false,
    enableSorting: false,
    enableColumnActions: false,
    size: 130,
  },
  {
    id: 'totalSolicitado',
    header: `T. Solicitado`,
    footer: `T. Solicitado`,
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: yellow[100],
      },
      align: 'right',
    },
    Cell: ({ row: { original } }) => {
      if (original.verificarStock) {
        if (original.inventario.length > 0)
          return <MontoMonedaTexto monto={original.inventario[0].totalSolicitado} />
        else return <>--</>
      } else {
        if (original.inventario.length > 0) return <AllInclusive fontSize={'small'} />
        else return <>--</>
      }
    },
    enableColumnFilter: false,
    enableSorting: false,
    enableColumnActions: false,
    size: 130,
  },
  {
    id: 'totalComprometido',
    header: `T. Comprometido`,
    footer: `T. Comprometido`,
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: orange[100],
      },
      align: 'right',
    },
    Cell: ({ row: { original } }) => {
      if (original.verificarStock) {
        if (original.inventario.length > 0)
          return <MontoMonedaTexto monto={original.inventario[0].totalComprometido} />
        else return <>--</>
      } else {
        if (original.inventario.length > 0) return <AllInclusive fontSize={'small'} />
        else return <>--</>
      }
    },
    enableColumnFilter: false,
    enableSorting: false,
    enableColumnActions: false,
    size: 130,
  },
  {
    id: 'totalDisponible',
    header: `Total Disponible`,
    footer: `Total Disponible`,
    muiTableBodyCellProps: {
      align: 'right',
      sx: {
        backgroundColor: green[100],
      },
    },
    Cell: ({ row: { original } }) => {
      if (original.verificarStock) {
        if (original.inventario.length > 0)
          return <MontoMonedaTexto monto={original.inventario[0].totalDisponible} />
        else return <>--</>
      } else {
        if (original.inventario.length > 0) return <AllInclusive fontSize={'small'} />
        else return <>--</>
      }
    },
    enableColumnFilter: false,
    enableSorting: false,
    enableColumnActions: false,
    size: 130,
  },
  {
    accessorKey: 'articuloPrecioBase.articuloUnidadMedida.nombreUnidadMedida',
    header: 'U.M. Principal',
    footer: 'U.M. Principal',
    enableSorting: false,
    Cell: ({ row }) => {
      return (
        row.original.articuloPrecioBase?.articuloUnidadMedida.nombreUnidadMedida || ''
      )
    },
    enableColumnActions: false,
  },
  {
    accessorKey: 'gestionArticulo',
    header: 'Gestionado Por',
    footer: 'Gestionado Por',
    enableSorting: false,
    Cell: ({ row }) => {
      return row.original.gestionArticulo || ''
    },
    enableColumnActions: false,
    size: 130,
  },
]
