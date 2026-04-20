import { gql } from 'graphql-request'
import {
  ArqueoCajaCortesiaFields,
  ArqueoCajaFields,
  IngresoFields,
  ObservacionesFields,
  RetiroFields,
  TurnoCajasFields,
} from '../fragments/cajasFragment'
import { RetiroInput } from '../interfaces/aperturaCaja'
import { ArqueoCajaProps } from '../interfaces/arqueoCaja'
import { getClient } from './client'
import { MyGraphQlError } from '../../../base/services/GraphqlError'

/**
 * Registra un retiro de dinero de una caja abierta.
 * @param id - El ID del arqueo de caja actual (ArqueoCaja).
 * @param inputData - Un objeto con todos los datos requeridos para el retiro.
 */
export const apiRetiroCaja = async (
  id: string,
  inputData: RetiroInput,
): Promise<ArqueoCajaProps> => {
  const mutation = gql`
    ${ArqueoCajaFields}
    ${TurnoCajasFields}
    ${RetiroFields}
    ${IngresoFields}
    ${ObservacionesFields}
    ${ArqueoCajaCortesiaFields}

    mutation RETIRO_CAJA($id: ID!, $input: AperturaCajaRetirarInput!) {
      aperturaCajaRetirar(id: $id, input: $input) {
        ...ArqueoCajaFields
      }
    }
  `

  try {
    const client = getClient()
    const data: any = await client.request(mutation, { id, input: inputData })

    return data.aperturaCajaRetirar
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
