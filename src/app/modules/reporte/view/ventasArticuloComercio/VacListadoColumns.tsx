import { alpha } from '@mui/material'
import { MRT_ColumnDef } from 'material-react-table'

import ParseMontoMoneda from '../../../../base/components/Mask/ParseMontoMoneda'
import { numberWithCommasPlaces } from '../../../../base/components/MyInputs/NumberInput'
import { genReplaceEmpty } from '../../../../utils/helper'
import { ReportePedidoVentasPorArticuloComercio } from '../../../pos/api/reporteVentasArticulo'

/**
 * Columnas de la tabla de entradas
 */
export const VacListadoColumns = (): MRT_ColumnDef<ReportePedidoVentasPorArticuloComercio>[] => [
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
      sx: (theme) => ({
        backgroundColor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
        color: 'inherit',
      }),
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
      sx: (theme) => ({
        backgroundColor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
        color: 'inherit',
      }),
    },
    size: 150,
    enableSorting: false,
    enableColumnFilter: false,
    enableColumnActions: false,
    Cell: ({ row }) => {
      return <ParseMontoMoneda monto={row.original.montoVentas} sigla={row.original.moneda} />
    },
  },
  {
    accessorKey: 'montoDescuento',
    header: 'Monto Desc.',
    muiTableBodyCellProps: {
      align: 'right',
    },
    Cell: ({ row }) => {
      return <ParseMontoMoneda monto={row.original.montoDescuento} sigla={row.original.moneda} />
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
      return <ParseMontoMoneda monto={row.original.totalFinal} sigla={row.original.moneda} />
    },
    enableSorting: false,
    enableColumnFilter: false,
    enableColumnActions: false,
    size: 90,
  },
  {
    accessorKey: 'puntoVenta',
    header: 'Punto Venta',
    enableSorting: false,
    size: 100,
  },
  {
    accessorKey: 'sucursal',
    header: 'Sucursal',
    enableSorting: false,
    size: 100,
  },
]
