// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { KardexPeriodoProps } from '../../interfaces/kardexPeriodo.ts'
import { kardexPeriodoFragment } from '../fragments/kardexPeriodoFragment.ts'
import { AccessToken } from '../models/paramsModel'
import { MyGraphQlError } from '../services/GraphqlError'

const query = gql`
  ${kardexPeriodoFragment}
  query LISTADO {
    kardexPeriodoListado(limit: 5, query: "state=ACTIVO") {
      pageInfo {
        totalDocs
      }
      docs {
        ...kardexPeriodoFields
      }
    }
  }
`

/**
 * kardex periodo activo
 */
export const apiKardexPeriodoActivo = async (): Promise<KardexPeriodoProps | null> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query)
    return data.kardexPeriodoListado.docs.length === 0 ? null : data.kardexPeriodoListado.docs[0]
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
