/* eslint-disable no-unused-vars */
import { blue, green } from '@mui/material/colors'
import { MRT_ColumnDef } from 'material-react-table'
import React from 'react'

import { numberWithCommasPlaces } from '../../../../base/components/MyInputs/NumberInput'
import { MonedaProps } from '../../../../base/interfaces/monedaPrecio'
import { genReplaceEmpty } from '../../../../utils/helper'
import ParseMonto from '../../../base/components/PaseMonto'
import { ReportePedidoVentasPorArticuloPuntoVenta } from '../../../pos/api/reporteVentasArticulo'

/**
 * Columnas de la tabla de entradas
 */
export const VapvListadoColumns =
  (): MRT_ColumnDef<ReportePedidoVentasPorArticuloPuntoVenta>[] => [
    {
      accessorKey: 'tipoArticulo',
      header: 'Tipo Articulo',
      enableSorting: false,
      size: 110,
    },
    {
      accessorKey: 'nombreArticulo',
      header: 'Articulo',
      enableSorting: false,
      Cell: ({ renderedCellValue, row }) => {
        return `${row.original.codigoArticulo} - ${genReplaceEmpty(renderedCellValue, '--')}`
      },
    },
    {
      accessorKey: 'codigoArticulo',
      header: 'Codigo',
      enableSorting: false,
      size: 100,
    },
    {
      accessorKey: 'nroVentas',
      header: 'Nro. Ventas',
      enableColumnActions: false,
      enableSorting: false,
      size: 110,
      muiTableBodyCellProps: {
        align: 'right',
        sx: {
          backgroundColor: green[50],
        },
      },
      Cell: ({ row }) => {
        return `${numberWithCommasPlaces(row.original.nroVentas)}`
      },
    },
    {
      accessorKey: 'unidadMedida',
      header: 'Unidad Medida',
      enableColumnActions: false,
      enableSorting: false,
      size: 100,
    },
    {
      accessorKey: 'montoVentas',
      header: 'Monto Ventas',
      muiTableBodyCellProps: {
        align: 'right',
        sx: {
          backgroundColor: blue[50],
        },
      },
      size: 150,
      enableSorting: false,
      enableColumnFilter: false,
      enableColumnActions: false,
      Cell: ({ row }) => {
        return <ParseMonto monto={row.original.montoVentas} sigla={row.original.moneda} />
      },
    },
    {
      accessorKey: 'montoDescuento',
      header: 'Monto Desc.',
      muiTableBodyCellProps: {
        align: 'right',
      },
      Cell: ({ row }) => {
        return (
          <ParseMonto monto={row.original.montoDescuento} sigla={row.original.moneda} />
        )
      },
      size: 90,
      enableSorting: false,
    },
    {
      accessorKey: 'totalFinal',
      header: 'Total Final',
      muiTableBodyCellProps: {
        align: 'right',
      },
      Cell: ({ row }) => {
        return <ParseMonto monto={row.original.totalFinal} sigla={row.original.moneda} />
      },
      enableSorting: false,
      enableColumnFilter: false,
      enableColumnActions: false,
      size: 90,
    },
    {
      accessorKey: 'sucursal',
      header: 'Sucursal',
      enableSorting: false,
      size: 100,
    },
  ]
