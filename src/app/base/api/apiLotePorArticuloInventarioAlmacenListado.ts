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
  query LOTE_POR_INVENTARIO_ALMACEN(
    $codigoArticulo: String!
    $inventarioId: ID
    $almacenId: ID
  ) {
    lotePorArticuloInventarioAlmacenListado(
      codigoArticulo: $codigoArticulo
      inventarioId: $inventarioId
      almacenId: $almacenId
    ) {
      ...loteFields
    }
  }
`

/**
 * Listado por articulo, almacen e inventario
 * @param codigoArticulo
 * @param inventarioId
 * @param almacenId
 * @author isi-template
 */
export const apiLotePorArticuloInventarioAlmacenListado = async (
  codigoArticulo: string,
  inventarioId: string,
  almacenId: string,
): Promise<LoteProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)

    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query, {
      codigoArticulo,
      inventarioId,
      almacenId,
    })
    return data.lotePorArticuloInventarioAlmacenListado
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
