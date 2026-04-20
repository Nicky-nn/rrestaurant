// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../../base/services/GraphqlError'
import { MonedaProps } from '../interfaces/moneda'

const apiQuery = gql`
  query MONEDAS {
    monedas {
      codigo
      sigla
      descripcion
      tipoCambio
      activo
    }
  }
`

/**
 * @description Clasificador de moneda interna
 */
export const apiMonedas = async (): Promise<MonedaProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(apiQuery)
    return data.monedas
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
