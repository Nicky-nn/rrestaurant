// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { LoteProps } from '../../interfaces/lote.ts'
import { loteFragment } from '../fragments/loteFragment.ts'
import { facturaSucursalFragment } from '../fragments/sucursalFragment.ts'
import { AccessToken } from '../models/paramsModel.ts'
import { MyGraphQlError } from '../services/GraphqlError.ts'

const query = gql`
  ${facturaSucursalFragment}
  ${loteFragment}
  query LOTES_POR_ARTICULO($codigoArticulo: String!) {
    lotePorArticuloListado(codigoArticulo: $codigoArticulo) {
      ...loteFields
    }
  }
`

/**
 * Listado global de todos los lotes
 * @param codigoArticulo
 * @author isi-template
 */
export const apiLotePorArticuloListado = async (codigoArticulo: string): Promise<LoteProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)

    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query, {
      codigoArticulo,
    })
    return data.lotePorArticuloListado
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
