import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'

const apiMutation = gql`
  mutation ANULAR($entidad: EntidadParamsInput, $cuf: String!, $codigoMotivo: Int!) {
    restNotaCreditoDebitoAnular(
      entidad: $entidad
      cuf: $cuf
      codigoMotivo: $codigoMotivo
    ) {
      nitEmisor
      state
      representacionGrafica {
        pdf
        xml
        rollo
        sin
      }
    }
  }
`

/**
 * @description Anulación de una NCD
 * @param cuf
 * @param codigoMotivo
 * @param codigoSucursal
 * @param codigoPuntoVenta
 * @param notificacion
 */
export const apiNcdAnular = async (
  cuf: string,
  codigoMotivo: number,
  codigoSucursal: number,
  codigoPuntoVenta: number,
): Promise<{ estado: string; mensaje: string }> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const entidad = {
      codigoSucursal,
      codigoPuntoVenta,
    }

    const data: any = await client.request(apiMutation, {
      entidad,
      cuf,
      codigoMotivo,
    })
    return data.restNotaCreditoDebitoAnular
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
