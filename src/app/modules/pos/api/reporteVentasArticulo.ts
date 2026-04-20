import { gql, GraphQLClient } from 'graphql-request'
import Swal from 'sweetalert2'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'

export interface ReportePedidoVentasPorArticuloPuntoVenta {
  codigoArticulo: string
  moneda: string
  montoDescuento: number
  montoVentas: number
  nombreArticulo: string
  nroVentas: number
  otrosCostos?: number
  sucursal: string
  totalFinal: number
  tipoArticulo: string
  tuvoVariacionPrecio?: boolean
  unidadMedida: string
  preciosRegistrados?: Array<{
    precio: number
    cantidad: number
  }>
}

export interface ReportePedidoVentasPorArticuloComercio {
  codigoArticulo: string
  moneda: string
  montoDescuento: number
  montoVentas: number
  nombreArticulo: string
  nroVentas: number
  otrosCostos?: number
  puntoVenta: string
  sucursal: string
  totalFinal: number
  tipoArticulo: string
  tuvoVariacionPrecio?: boolean
  unidadMedida: string
  preciosRegistrados?: Array<{
    precio: number
    cantidad: number
  }>
}

const queryReporteVentasPorArticuloPuntoVenta = gql`
  query REPORTE_VENTAS_ARTICULO_PUNTO_VENTA(
    $fechaInicial: DateDMY!
    $fechaFinal: DateDMY!
    $codigoSucursal: Int!
    $codigoPuntoVenta: [Int] = []
    $mostrarTodos: Boolean = true
  ) {
    restReportePedidoVentasPorArticuloPuntoVenta(
      fechaInicial: $fechaInicial
      fechaFinal: $fechaFinal
      codigoSucursal: $codigoSucursal
      codigoPuntoVenta: $codigoPuntoVenta
      mostrarTodos: $mostrarTodos
    ) {
      tipoArticulo
      codigoArticulo
      nombreArticulo
      sucursal
      nroVentas
      unidadMedida
      montoVentas
      montoDescuento
      otrosCostos
      moneda
      totalFinal
      tuvoVariacionPrecio
      preciosRegistrados {
        precio
        cantidad
      }
    }
  }
`

const queryReporteVentasPorArticuloComercio = gql`
  query REPORTE_VENTAS_ARTICULO_COMERCIO(
    $fechaInicial: DateDMY!
    $fechaFinal: DateDMY!
    $codigoSucursal: [Int]!
  ) {
    restReportePedidoVentasPorArticuloComercio(
      fechaInicial: $fechaInicial
      fechaFinal: $fechaFinal
      codigoSucursal: $codigoSucursal
    ) {
      tipoArticulo
      codigoArticulo
      nombreArticulo
      sucursal
      nroVentas
      unidadMedida
      montoVentas
      montoDescuento
      otrosCostos
      moneda
      totalFinal
      tuvoVariacionPrecio
      preciosRegistrados {
        precio
        cantidad
      }
    }
  }
`

export const obtenerReporteVentasPorArticuloPuntoVenta = async (
  fechaInicial: string,
  fechaFinal: string,
  codigoSucursal: number,
  codigoPuntoVenta: number[],
  mostrarTodos: boolean,
): Promise<ReportePedidoVentasPorArticuloPuntoVenta[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)

    const data: {
      restReportePedidoVentasPorArticuloPuntoVenta: ReportePedidoVentasPorArticuloPuntoVenta[]
    } = await client.request(queryReporteVentasPorArticuloPuntoVenta, {
      fechaInicial,
      fechaFinal,
      codigoSucursal,
      codigoPuntoVenta,
      mostrarTodos,
    })
    return data.restReportePedidoVentasPorArticuloPuntoVenta
  } catch (error: any) {
    const errorMessage =
      error.response?.errors?.[0]?.message || 'Ocurrió un error inesperado, por favor intente de nuevo'
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
      confirmButtonText: 'Entendido',
    })
    console.error('Error en obtenerReporteVentasPorArticuloPuntoVenta', error)
    throw new MyGraphQlError(error)
  }
}

export const obtenerReporteVentasPorArticuloComercio = async (
  fechaInicial: string,
  fechaFinal: string,
  codigoSucursal: number[],
): Promise<ReportePedidoVentasPorArticuloComercio[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)

    const data: {
      restReportePedidoVentasPorArticuloComercio: ReportePedidoVentasPorArticuloComercio[]
    } = await client.request(queryReporteVentasPorArticuloComercio, {
      fechaInicial,
      fechaFinal,
      codigoSucursal,
    })

    return data.restReportePedidoVentasPorArticuloComercio
  } catch (error: any) {
    const errorMessage =
      error.response?.errors?.[0]?.message || 'Ocurrió un error inesperado, por favor intente de nuevo'
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
      confirmButtonText: 'Entendido',
    })
    console.error('Error en obtenerReporteVentasPorArticuloComercio', error)
    throw new MyGraphQlError(error)
  }
}
