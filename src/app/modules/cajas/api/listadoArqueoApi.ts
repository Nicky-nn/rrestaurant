import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { PageInputProps } from '../../../interfaces'
import {
  ArqueoCajaCortesiaFields,
  ArqueoCajaFields,
  IngresoFields,
  ObservacionesFields,
  RetiroFields,
  TurnoCajasFields,
} from '../fragments/cajasFragment'
import { ApiArqueoCajaResponse, ArqueoCajaProps } from '../interfaces/arqueoCaja'

// =======================================
// Query GraphQL con fragments
// =======================================

const LISTADO_ARQUEO_CAJA_QUERY = gql`
  ${ArqueoCajaFields}
  ${RetiroFields}
  ${IngresoFields}
  ${ObservacionesFields}
  ${TurnoCajasFields}
  ${ArqueoCajaCortesiaFields}

  query LISTADO_ARQUEO_CAJA($limit: Int, $page: Int, $reverse: Boolean, $query: String) {
    arqueoCajaListado(limit: $limit, page: $page, reverse: $reverse, query: $query) {
      pageInfo {
        hasNextPage
        hasPrevPage
        limit
        page
        totalDocs
        totalPages
      }
      docs {
        ...ArqueoCajaFields
      }
    }
  }
`

// -------------------------------------
// Obtener arqueo de caja por ID
// -------------------------------------
export const ARQUEO_CAJA_POR_ID = gql`
  ${ArqueoCajaFields}
  ${RetiroFields}
  ${IngresoFields}
  ${ObservacionesFields}
  ${TurnoCajasFields}
  ${ArqueoCajaCortesiaFields}

  query ARQUEO_CAJA_POR_ID($id: ID!) {
    arqueoCajaPorId(id: $id) {
      ...ArqueoCajaFields
    }
  }
`

// =======================================
// Service
// =======================================

/**
 * @description Obtiene el listado de arqueos de caja desde la API GraphQL.
 * @param {PageInputProps} pageInfo Información de paginación y búsqueda.
 * @returns {Promise<ApiArqueoCajaResponse>} Lista de arqueos de caja.
 */
export const obtenerListadoArqueoCaja = async (
  pageInfo?: PageInputProps,
  query?: string,
): Promise<ApiArqueoCajaResponse> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)

    client.setHeader('authorization', `Bearer ${token}`)

    // Valores por defecto si no se proporciona pageInfo
    const variables = {
      limit: pageInfo?.limit || 10,
      page: pageInfo?.page || 1,
      reverse: pageInfo?.reverse,
      query,
    }

    const data: any = await client.request(LISTADO_ARQUEO_CAJA_QUERY, variables)
    return data.arqueoCajaListado
  } catch (error: any) {
    console.error('Error al obtener el listado de arqueos de caja:', error)
    throw new MyGraphQlError(error)
  }
}
/**
 * @description Obtiene el listado de arqueos de caja desde la API GraphQL.
 * @param {PageInputProps} pageInfo Información de paginación y búsqueda.
 * @returns {Promise<ApiArqueoCajaResponse>} Lista de arqueos de caja.
 */
export const obtenerArqueoCajaPorId = async (
  id: string,
): Promise<ArqueoCajaProps | null> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)

    const variables = { id }
    const data: any = await client.request(ARQUEO_CAJA_POR_ID, variables)

    return data.arqueoCajaPorId ?? null
  } catch (error: any) {
    console.error('Error al obtener el arqueo de caja por ID:', error)
    throw new MyGraphQlError(error)
  }
}
