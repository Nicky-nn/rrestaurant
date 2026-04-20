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
  ) {
    restFacturaReporteVentasUsuario(entidad: $entidad, fechaInicial: $fechaInicial, fechaFinal: $fechaFinal) {
      sucursal
      puntoVenta
      usuario
      state
      montoTotal
      numeroFacturas
    }
  }
`

export interface VentaReportePorUsuarioProp {
  sucursal: number
  puntoVenta: number
  usuario: string
  state: string
  montoTotal: number
  numeroFacturas: number
}

interface ApiReporteVentasUsuario {
  restFacturaReporteVentasUsuario: VentaReportePorUsuarioProp[]
}

export const apiReporteUsuario = async (args: {
  entidad: EntidadInputProps[] | null
  fechaInicial: string
  fechaFinal: string
}): Promise<ApiReporteVentasUsuario> => {
  try {
    const { entidad, fechaInicial, fechaFinal } = args
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)

    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query, {
      entidad,
      fechaInicial,
      fechaFinal,
    })
    return data
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
