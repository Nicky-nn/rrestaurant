import { gql } from 'graphql-request'
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
 * Realiza un arqueo de una caja que ya está abierta.
 * @param id - El ID del arqueo de caja actual (ArqueoCaja).
 * @param observacion - Una observación opcional para el arqueo.
 */
export const apiArqueoCaja = async (
  id: string,
  observacion: string,
): Promise<ArqueoCajaProps> => {
  const mutation = gql`
    ${ArqueoCajaFields}
    ${TurnoCajasFields}
    ${RetiroFields}
    ${IngresoFields}
    ${ObservacionesFields}
    ${ArqueoCajaCortesiaFields}

    mutation ARQUEO_CAJA($id: ID!, $input: AperturaCajaArquearInput!) {
      aperturaCajaArquear(id: $id, input: $input) {
        ...ArqueoCajaFields
      }
    }
  `
  try {
    const client = getClient()
    const input = {
      observacion,
    }
    const data: any = await client.request(mutation, { id, input })
    return data.aperturaCajaArquear
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
