// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { FacturaProps } from '../interfaces/factura'

export const FCV_ONLINE = gql`
  mutation FCV_ANULAR($cuf: String!, $codigoMotivo: Int!, $entidad: EntidadParamsInput!) {
    restFacturaAnular(cuf: $cuf, codigoMotivo: $codigoMotivo, entidad: $entidad) {
      representacionGrafica {
        pdf
      }
    }
  }
`

/**
 * @description Anula una factura
 * @param id
 * @param codigoMotivo
 * @param entidad
 */
export const fetchFacturaAnular = async (
  cuf: string,
  codigoMotivo: number,
  entidad: { codigoSucursal: number; codigoPuntoVenta: number },
): Promise<FacturaProps> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(FCV_ONLINE, { cuf, codigoMotivo, entidad })
    return data.restFacturaAnular
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
