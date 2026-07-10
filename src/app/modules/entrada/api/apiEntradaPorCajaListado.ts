// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { pageInfoFragment } from '../../../base/fragments/pageInfo.ts'
import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { PageInfoProps, PageInputProps } from '../../../interfaces'
import { EntradaProps } from '../interfaces'
import { ENTRADA_FRAGMENT } from '../interfaces/fragments.ts'

const query = gql`
  ${pageInfoFragment}
  ${ENTRADA_FRAGMENT}
  query LISTADO($limit: Int! = 10, $page: Int = 1, $reverse: Boolean = false, $query: String) {
    entradaPorCajaListado(limit: $limit, page: $page, reverse: $reverse, query: $query) {
      docs {
        ...EntradaFieldsFragment
      }
      pageInfo {
        ...pageInfoFields
      }
    }
  }
`

/**
 * Respuesta de productos
 */
interface ApiEntradaResponse {
  docs: EntradaProps[]
  pageInfo: PageInfoProps
}

/**
 * Listado de articulos con paginacion
 * @param pageInfo
 */
export const apiEntradaPorCajaListado = async (pageInfo: PageInputProps): Promise<ApiEntradaResponse> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query, {
      ...pageInfo,
    })
    return data.entradaPorCajaListado
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
