import { gql, GraphQLClient } from 'graphql-request'
import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { CLIENT_FIELDS_FRAGMENT } from '../graphql/clientsGql'
import { ClientProps } from '../interfaces/client'

const clientSearchListQuery = gql`
  ${CLIENT_FIELDS_FRAGMENT}
  query SEARCH_CLIENTS($query: String) {
    clienteBusqueda(query: $query) {
      ...clientFields
    }
  }
`

export const searchClientsApi = async (query: string): Promise<ClientProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('Authorization', `Bearer ${token}`)
    const data: any = await client.request(clientSearchListQuery, { query })
    return data.clienteBusqueda
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
