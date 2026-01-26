// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { MonedaProps } from '../../interfaces/monedaPrecio.ts'
import { monedaFragment } from '../fragments/monedaPrecioOperacionFragment.ts'
import { AccessToken } from '../models/paramsModel.ts'
import { MyGraphQlError } from '../services/GraphqlError.ts'

const query = gql`
  ${monedaFragment}
  query MONEDAS {
    monedas {
      ...monedaFields
    }
  }
`

/**
 * Listado de monedas simple
 * @autor isi-template
 */
export const apiMonedaSimpleListado = async (): Promise<MonedaProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query)
    return data.monedas
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
