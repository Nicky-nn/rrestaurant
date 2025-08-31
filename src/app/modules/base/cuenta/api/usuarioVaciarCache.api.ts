// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../../base/services/GraphqlError'

const gqlQuery = gql`
  mutation CLEAR_CACHE {
    clearCache
  }
`

/**
 * Elimina redis de la memoria ram, esto en el servidor
 * @author isi-template
 */
export const apiUsuarioVaciarCache = async (): Promise<Boolean> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(gqlQuery)
    return data.clearCache
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
