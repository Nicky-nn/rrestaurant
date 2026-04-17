import { gql } from 'graphql-request'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { CajaFields } from '../fragments/cajasFragment'
import { getClient } from './client'
import { CajaProps } from '../interfaces/aperturaCaja'

/**
 * Obtiene un listado general de todas las cajas.
 */
export const apiCajaListado = async (queryStr?: string): Promise<CajaProps[]> => {
  const query = gql`
    ${CajaFields}
    query CAJA_LISTADO($query: String) {
      cajaListado(query: $query) {
        docs {
          ...CajaFields
        }
      }
    }
  `
  try {
    const client = getClient()
    const variables = { query: queryStr || '' } // <-- pasar la variable
    const data: any = await client.request(query, variables) // <-- aplicar variables
    return data.cajaListado.docs
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
