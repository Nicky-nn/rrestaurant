// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { PageInfoProps, PageInputProps } from '../../interfaces'
import { LoteProps } from '../../interfaces/lote.ts'
import { genReplaceEmpty } from '../../utils/helper.ts'
import { loteFragment } from '../fragments/loteFragment.ts'
import { facturaSucursalFragment } from '../fragments/sucursalFragment.ts'
import { AccessToken } from '../models/paramsModel.ts'
import { MyGraphQlError } from '../services/GraphqlError.ts'

const gqlQuery = (fragment: string | null) => {
  return gql`
    ${facturaSucursalFragment}
    ${loteFragment}
    ${fragment ? fragment : loteFragment}
    query LOTE_LISTADO_GLOBAL(
      $limit: Int! = 10
      $page: Int = 1
      $reverse: Boolean = false
      $query: String = null
    ) {
      loteListado(limit: $limit, page: $page, reverse: $reverse, query: $query) {
        pageInfo {
          hasNextPage
          hasPrevPage
          totalDocs
          limit
          page
          totalPages
        }
        docs {
          ...loteFields
        }
      }
    }
  `
}

interface LoteResponse {
  pageInfo: PageInfoProps
  docs: LoteProps[]
}

/**
 * Listado de lotes para selección
 * @author isi-template
 * @param pageInfo
 * @param input
 */
export const apiLoteGlobalListado = async (
  pageInfo: PageInputProps,
  input?: {
    fragment?: string | null // En caso de reemplazar el fragmento de ejecución, el nombre debe llamarse articuloFields
  },
): Promise<LoteResponse> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    const { limit, page, reverse, query } = pageInfo
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)
    // const cds = parseInt(import.meta.env.ISI_DOCUMENTO_SECTOR.toString()!, 10)

    const data: any = await client.request(
      gqlQuery(genReplaceEmpty(input?.fragment, null)),
      {
        limit,
        page,
        reverse,
        query,
      },
    )
    return data.loteListado
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
