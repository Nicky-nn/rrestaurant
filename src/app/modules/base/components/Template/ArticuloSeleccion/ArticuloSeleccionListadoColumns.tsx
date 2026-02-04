import { AllInclusive } from '@mui/icons-material'
import { alpha } from '@mui/material'
import { MRT_ColumnDef } from 'material-react-table'
import React from 'react'

import MontoMonedaTexto from '../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { ArticuloProps } from '../../../../../interfaces/articulo.ts'

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
    size: 130,
  },
  {
    id: 'totalStock',
    header: `T. Stock`,
    footer: `T. Stock`,
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: (theme) => alpha(theme.palette.blue.light, 0.7),
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
    size: 130,
  },
  {
    id: 'totalSolicitado',
    header: `T. Solicitado`,
    footer: `T. Solicitado`,
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: (theme) => alpha(theme.palette.yellow.light, 0.7),
        color: (theme) => theme.palette.yellow.contrastText,
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
    size: 130,
  },
  {
    id: 'totalComprometido',
    header: `T. Comprometido`,
    footer: `T. Comprometido`,
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: (theme) => alpha(theme.palette.orange.light, 0.7),
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
    size: 130,
  },
  {
    id: 'totalDisponible',
    header: `Total Disponible`,
    footer: `Total Disponible`,
    muiTableBodyCellProps: {
      align: 'right',
      sx: {
        backgroundColor: (theme) => alpha(theme.palette.green.light, 0.7),
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
    size: 130,
  },
  {
    accessorKey: 'articuloPrecioBase.articuloUnidadMedida.nombreUnidadMedida',
    header: 'U.M. Principal',
    footer: 'U.M. Principal',
    Cell: ({ row }) => {
      return (
        row.original.articuloPrecioBase?.articuloUnidadMedida.nombreUnidadMedida || ''
      )
    },
  },
  {
    accessorKey: 'gestionArticulo',
    header: 'Gestionado Por',
    footer: 'Gestionado Por',
    Cell: ({ row }) => {
      return row.original.gestionArticulo || ''
    },
    size: 130,
  },
]
