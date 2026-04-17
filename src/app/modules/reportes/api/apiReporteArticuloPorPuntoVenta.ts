// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'

const query = gql`
  query REPORTE_VENTAS_ARTICULO_PUNTO_VENTA(
    $fechaInicial: DateDMY!
    $fechaFinal: DateDMY!
    $codigoSucursal: Int!
    $codigoPuntoVenta: [Int] = []
    $mostrarTodos: Boolean = true
    $limit: Int = 1000
  ) {
    ventaReporteArticuloPorPuntoVenta(
      fechaInicial: $fechaInicial
      fechaFinal: $fechaFinal
      codigoSucursal: $codigoSucursal
      codigoPuntoVenta: $codigoPuntoVenta
      mostrarTodos: $mostrarTodos
      limit: $limit
    ) {
      tipoArticulo
      sucursal
      codigoArticulo
      nombreArticulo
      unidadMedida
      moneda
      nroVentas
      montoVentas
      montoDescuento
      montoDescuentoAdicional
    }
  }
`

export interface ReporteArticuloPorPuntoVentaProp {
  tipoArticulo: string
  sucursal: number
  codigoArticulo: string
  nombreArticulo: string
  unidadMedida: string
  moneda: string
  nroVentas: number
  montoVentas: number
  montoDescuento: number
  montoDescuentoAdicional: number
}

/**
 * Reporte top ventas de articulos
 * @param args
 */
export const apiReporteArticuloPorPuntoVenta = async (args: {
  fechaInicial: string
  fechaFinal: string
  codigoSucursal: number
  codigoPuntoVenta: number[]
  mostrarTodos: boolean
  limit: number
}): Promise<ReporteArticuloPorPuntoVentaProp[]> => {
  try {
    const {
      fechaInicial,
      fechaFinal,
      codigoSucursal,
      codigoPuntoVenta,
      mostrarTodos,
      limit,
    } = args
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)

    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query, {
      fechaInicial,
      fechaFinal,
      codigoSucursal,
      codigoPuntoVenta,
      mostrarTodos,
      limit,
    })
    return data.ventaReporteArticuloPorPuntoVenta
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
