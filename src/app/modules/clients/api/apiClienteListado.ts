// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { PageInfoProps, PageInputProps } from '../../../interfaces'
import { CLIENT_FIELDS_FRAGMENT } from '../graphql/clientsGql'
import { ClientProps } from '../interfaces/client.ts'

const clientListQuery = gql`
  ${CLIENT_FIELDS_FRAGMENT}
  query CLIENTES_LISTADO($limit: Int!, $page: Int!, $reverse: Boolean, $query: String) {
    clientesAll(limit: $limit, page: $page, reverse: $reverse, query: $query) {
      pageInfo {
        hasNextPage
        hasPrevPage
        totalDocs
        limit
        page
        totalPages
      }
      docs {
        ...clientFields
      }
    }
  }
`

interface ClientListResp {
  pageInfo: PageInfoProps
  docs: ClientProps[]
}
/**
 * Listado de clientes
 * @param pagePros
 */
export const apiClienteListado = async (pagePros: PageInputProps): Promise<ClientListResp> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('Authorization', `Bearer ${token}`)
    const data = await client.request(clientListQuery, pagePros)
    return data.clientesAll
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
