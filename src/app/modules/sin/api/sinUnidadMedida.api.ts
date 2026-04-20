// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { SinUnidadMedidaProps } from '../interfaces/sin.interface'

const query = gql`
  query UNIDAD_MEDIDA {
    sinUnidadMedida {
      codigoClasificador
      descripcion
    }
  }
`

/**
 * @description Clasificador de unidades de medida
 *
 */
export const apiSinUnidadMedida = async (): Promise<SinUnidadMedidaProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query)
    return data.sinUnidadMedida
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
