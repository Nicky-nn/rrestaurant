// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { EntidadInputProps, PageInfoProps, PageInputProps } from '../../interfaces'
import { ArticuloProps } from '../../interfaces/articulo.ts'
import { genReplaceEmpty } from '../../utils/helper.ts'
import { articuloFragment } from '../fragments/articuloFragment.ts'
import { AccessToken } from '../models/paramsModel.ts'
import { MyGraphQlError } from '../services/GraphqlError.ts'

const gqlQuery = (fragment: string | null) => {
  return gql`
    ${fragment ? fragment : articuloFragment}
    query LISTADO_GENERAL(
      $cds: Int!
      $entidad: EntidadParamsInput!
      $verificarPrecio: Boolean = false
      $verificarInventario: Boolean = false
      $limit: Int! = 10
      $page: Int = 1
      $reverse: Boolean = false
      $query: String = null
      $queryExtra: String = null
    ) {
      articuloInventarioV2Listado(
        cds: $cds
        entidad: $entidad
        verificarPrecio: $verificarPrecio
        verificarInventario: $verificarInventario
        limit: $limit
        page: $page
        reverse: $reverse
        query: $query
        queryExtra: $queryExtra
      ) {
        pageInfo {
          hasNextPage
          hasPrevPage
          totalDocs
          limit
          page
          totalPages
        }
        docs {
          ...ArticuloFields
        }
      }
    }
  `
}

interface ArticuloInventarioResponse {
  pageInfo: PageInfoProps
  docs: ArticuloProps[]
}

/**
 * Listado de articulos mas inventarios, no se restringe precios e inventarios
 * @author isi-template
 * @param entidad
 * @param pageInfo
 * @param input
 */
export const apiArticuloInventarioListado = async (
  entidad: EntidadInputProps,
  pageInfo: PageInputProps,
  input: {
    verificarPrecio?: boolean
    verificarInventario?: boolean
    queryExtra?: string
    fragment?: string | null // En caso de reemplazar el fragmento de ejecución, el nombre debe llamarse articuloFields
  },
): Promise<ArticuloInventarioResponse> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    const { limit, page, reverse, query } = pageInfo
    const { verificarPrecio, verificarInventario, queryExtra } = input
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)
    const cds = parseInt(import.meta.env.ISI_DOCUMENTO_SECTOR.toString()!, 10)

    const data: any = await client.request(
      gqlQuery(genReplaceEmpty(input.fragment, null)),
      {
        cds,
        entidad,
        verificarPrecio,
        verificarInventario,
        limit,
        page,
        reverse,
        query,
        queryExtra,
      },
    )
    return data.articuloInventarioV2Listado
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
