// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'

export const CONSULTA_FACTURA_SIN = gql`
  query CONSULTA_FACTURA_SIN($cufs: [String!]!) {
    fcvSinConsultaFacturas(cufs: $cufs) {
      cuf
      fechaEmision
      numeroFactura
      codigoSucursal
      codigoPuntoVenta
      codigoDescripcion
      codigoEstado
      codigoRecepcion
      log
    }
  }
`

/**
 * @description Consulta información de facturas por sus CUFs
 * @param cufs Lista de CUFs a consultar
 */
export const fetchConsultaFacturaSin = async (
  cufs: string[],
): Promise<
  {
    cuf: string
    fechaEmision: string
    numeroFactura: string
    codigoSucursal: number
    codigoPuntoVenta: number
    codigoDescripcion: string
    codigoEstado: string
    codigoRecepcion: string
    log: string
  }[]
> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(CONSULTA_FACTURA_SIN, { cufs })
    return data.fcvSinConsultaFacturas
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
