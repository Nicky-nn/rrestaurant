// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { almacenFragment } from '../../../../../base/fragments/almacenFragment.ts'
import { facturaSucursalFragment } from '../../../../../base/fragments/sucursalFragment.ts'
import { AccessToken } from '../../../../../base/models/paramsModel.ts'
import { MyGraphQlError } from '../../../../../base/services/GraphqlError.ts'
import { AlmacenProps } from '../../../../../interfaces/almacen.ts'

const gqlQuery = gql`
  ${almacenFragment}
  ${facturaSucursalFragment}
  query LISTADO($limit: Int! = 10, $page: Int = 1, $reverse: Boolean = false, $query: String) {
    almacenListado(limit: $limit, page: $page, reverse: $reverse, query: $query) {
      pageInfo {
        totalPages
        totalDocs
      }
      docs {
        ...almacenFields
      }
    }
  }
`

/**
 * Listado simple de almacenes, lista los primeros 1000 registros fecha desc
 * @param query
 * @author isi-template
 */
export const apiAlmacenSimpleListado = async (query: string): Promise<AlmacenProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(gqlQuery, {
      limit: 1000,
      page: 1,
      revers: true,
      query,
    })
    return data.almacenListado?.docs || []
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
