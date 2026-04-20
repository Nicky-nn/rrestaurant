// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

// Asumo que estas rutas son correctas según tu estructura de proyecto
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import {
  ArqueoCajaCortesiaFields,
  ArqueoCajaFields,
  CajaFields,
  IngresoFields,
  ObservacionesFields,
  RetiroFields,
  TurnoCajasFields,
} from '../fragments/cajasFragment'
import {
  AperturaInput,
  CajaProps,
  EntidadInput,
  IngresoInput,
  Modulo,
  RetiroInput,
} from '../interfaces/aperturaCaja'
import { getClient } from './client'
import { ArqueoCajaProps, TurnoCajaProps } from '../interfaces/arqueoCaja'

/**
 * Registra la apertura de una caja para los módulos POS o REST.
 * @param cajaId - ID de la ubicación de la caja.
 * @param entidad - Objeto con los códigos de sucursal y punto de venta.
 * @param input - Objeto con los datos de la apertura (monto, turno, etc.).
 * @param modulo - Módulo de operaciones ('POS' o 'REST').
 */
export const apiAperturaCaja = async (
  cajaId: string,
  entidad: EntidadInput,
  input: AperturaInput,
  modulo: Modulo,
): Promise<ArqueoCajaProps> => {
  const mutation = gql`
    ${ArqueoCajaFields}
    ${TurnoCajasFields}
    ${RetiroFields}
    ${IngresoFields}
    ${ObservacionesFields}
    ${ArqueoCajaCortesiaFields}

    mutation APERTURA_CAJA(
      $cajaId: ID!
      $entidad: EntidadParamsInput
      $input: AperturaCajaRegistroInput!
      $modulo: String!
    ) {
      aperturaCajaRegistro(
        cajaId: $cajaId
        entidad: $entidad
        input: $input
        modulo: $modulo
      ) {
        ...ArqueoCajaFields
      }
    }
  `

  try {
    const client = getClient()
    const variables = { cajaId, entidad, input, modulo }
    const data: any = await client.request(mutation, variables)
    return data.aperturaCajaRegistro
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
