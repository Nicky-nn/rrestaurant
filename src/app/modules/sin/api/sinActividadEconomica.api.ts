// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { SinActividadesProps } from '../interfaces/sin.interface'

const query = gql`
  query FCV_PARAMETROS {
    sinActividades {
      codigoCaeb
      descripcion
      tipoActividad
    }
  }
`

export const fetchSinActividades = async (): Promise<SinActividadesProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query)
    return data.sinActividades || []
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
