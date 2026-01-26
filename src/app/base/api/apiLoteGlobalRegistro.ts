// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { EntidadInputProps } from '../../interfaces'
import { LoteApiInputProps, LoteProps } from '../../interfaces/lote.ts'
import { loteFragment } from '../fragments/loteFragment.ts'
import { facturaSucursalFragment } from '../fragments/sucursalFragment.ts'
import { AccessToken } from '../models/paramsModel.ts'
import { MyGraphQlError } from '../services/GraphqlError.ts'

const gqlQuery = gql`
  ${facturaSucursalFragment}
  ${loteFragment}
  mutation REGISTRO(
    $codigoLote: String!
    $codigoArticulo: String!
    $entidad: EntidadParamsInput!
    $input: LoteInput!
  ) {
    loteRegistro(
      codigoLote: $codigoLote
      codigoArticulo: $codigoArticulo
      entidad: $entidad
      input: $input
    ) {
      ...loteFields
    }
  }
`

/**
 * API REST para el upsert de un lote
 * @param codigoLote
 * @param codigoArticulo
 * @param input
 * @param entidad
 */
export const apiLoteGlobalRegistro = async (
  codigoLote: string,
  codigoArticulo: string,
  input: LoteApiInputProps,
  entidad: EntidadInputProps,
): Promise<LoteProps> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)
    const data: any = await client.request(gqlQuery, {
      codigoLote,
      codigoArticulo,
      entidad,
      input,
    })
    return data.loteRegistro
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
