import { gql } from 'graphql-request'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import {
  ArqueoCajaCortesiaFields,
  ArqueoCajaFields,
  IngresoFields,
  ObservacionesFields,
  RetiroFields,
  TurnoCajasFields,
} from '../fragments/cajasFragment'
import { getClient } from './client'
import { ArqueoCajaProps } from '../interfaces/arqueoCaja'
import { CierreInput } from '../interfaces/aperturaCaja'

/**
 * Realiza el cierre de una caja abierta.
 * @param id - El ID del arqueo de caja actual (ArqueoCaja).
 * @param montoReal - El monto final contado en caja.
 * @param observacion - Observación de cierre de caja.
 */
export const apiCerrarCaja = async (
  id: string,
  input: CierreInput,

): Promise<ArqueoCajaProps> => {
  const mutation = gql`
    ${ArqueoCajaFields}
    ${TurnoCajasFields}
    ${RetiroFields}
    ${IngresoFields}
    ${ObservacionesFields}
    ${ArqueoCajaCortesiaFields}

    mutation CERRAR_CAJA($id: ID!, $input: AperturaCajaCerrarInput!) {
      aperturaCajaCerrar(id: $id, input: $input) {
        ...ArqueoCajaFields
      }
    }
  `

  try {
    const client = getClient()
    const data: any = await client.request(mutation, { id, input })

    return data.aperturaCajaCerrar
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
