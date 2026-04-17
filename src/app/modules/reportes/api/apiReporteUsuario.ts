// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { EntidadInputProps } from '../../../interfaces'

const query = gql`
  query VENTAS_X_USUARIO(
    $entidad: [EntidadParamsInput] = null
    $fechaInicial: DateDMY!
    $fechaFinal: DateDMY!
    $usuario: String = null
  ) {
    ventaReportePorUsuario(
      entidad: $entidad
      fechaInicial: $fechaInicial
      fechaFinal: $fechaFinal
      usuario: $usuario
    ) {
      sucursal
      puntoVenta
      usuario
      numeroVentas
      elaborados
      anulados
      numeroFacturas
      numeroFacturasAnulado
      montoTotal
      montoTotalAnulado
      montoFacturado
      montoFacturadoAnulado
    }
    ventaReportePorUsuarioPeriodo(
      entidad: $entidad
      fechaInicial: $fechaInicial
      fechaFinal: $fechaFinal
      usuario: $usuario
    ) {
      fechaEmision
      sucursal
      puntoVenta
      usuario
      numeroVentas
      elaborados
      anulados
      numeroFacturas
      numeroFacturasAnulado
      montoTotal
      montoTotalAnulado
      montoFacturado
      montoFacturadoAnulado
    }
  }
`

export interface VentaReportePorUsuarioProp {
  sucursal: number
  puntoVenta: number
  usuario: string
  numeroVentas: number
  elaborados: number
  anulados: number
  numeroFacturas: number
  numeroFacturasAnulado: number
  montoTotal: number
  montoTotalAnulado: number
  montoFacturado: number
  montoFacturadoAnulado: number
}

export interface VentaReportePorUsuarioPeriodoProp {
  fechaEmision: string
  sucursal: number
  puntoVenta: number
  usuario: string
  numeroVentas: number
  elaborados: number
  anulados: number
  numeroFacturas: number
  numeroFacturasAnulado: number
  montoTotal: number
  montoTotalAnulado: number
  montoFacturado: number
  montoFacturadoAnulado: number
}

interface ApiReporteVentasUsuario {
  ventaReportePorUsuario: VentaReportePorUsuarioProp[]
  ventaReportePorUsuarioPeriodo: VentaReportePorUsuarioPeriodoProp[]
}

/**
 * Dos reportes de usuario y periodo
 * @param args
 */
export const apiReporteUsuario = async (args: {
  entidad: EntidadInputProps[] | null
  fechaInicial: string
  fechaFinal: string
  usuario: string | null
}): Promise<ApiReporteVentasUsuario> => {
  try {
    const { entidad, fechaInicial, fechaFinal, usuario } = args
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)

    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query, {
      entidad,
      fechaInicial,
      fechaFinal,
      usuario,
    })
    return data
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
