import { gql } from 'graphql-request'
import { IngresoInput } from '../interfaces/aperturaCaja'
import { ArqueoCajaProps } from '../interfaces/arqueoCaja'
import {
  ArqueoCajaCortesiaFields,
  ArqueoCajaFields,
  IngresoFields,
  ObservacionesFields,
  RetiroFields,
  TurnoCajasFields,
} from '../fragments/cajasFragment'
import { getClient } from './client'
import { MyGraphQlError } from '../../../base/services/GraphqlError'

/**
 * Realiza un ingreso de dinero de una caja abierta.
 * @param id - El ID del arqueo de caja actual (ArqueoCaja).
 * @param inputData - Un objeto con todos los datos requeridos para el ingreso.
 */
export const apiIngresoCaja = async (
  id: string,
  inputData: IngresoInput,
): Promise<ArqueoCajaProps> => {
  const mutation = gql`
    ${ArqueoCajaFields}
    ${TurnoCajasFields}
    ${RetiroFields}
    ${IngresoFields}
    ${ObservacionesFields}
    ${ArqueoCajaCortesiaFields}

    mutation INGRESO_CAJA($id: ID!, $input: AperturaCajaIngresarInput!) {
      aperturaCajaIngresar(id: $id, input: $input) {
        ...ArqueoCajaFields
      }
    }
  `

  try {
    const client = getClient()
    const data: any = await client.request(mutation, { id, input: inputData })

    return data.aperturaCajaIngresar
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
