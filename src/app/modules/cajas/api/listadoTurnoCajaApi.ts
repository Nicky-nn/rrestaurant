import { gql } from 'graphql-request'
import { TurnoCajaProps } from '../interfaces/arqueoCaja'
import { TurnoCajasFields } from '../fragments/cajasFragment'
import { getClient } from './client'
import { MyGraphQlError } from '../../../base/services/GraphqlError'

/**
 * Obtiene la lista de todos los turnos de caja disponibles.
 */
export const apiTurnoCajaListado = async (): Promise<TurnoCajaProps[]> => {
  const query = gql`
    ${TurnoCajasFields}
    query TURNO_CAJA_LISTADO {
      turnoCajaListado {
        ...TurnoCajasFields
      }
    }
  `
  try {
    const client = getClient()
    const data: any = await client.request(query)
    return data.turnoCajaListado
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
