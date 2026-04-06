// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../models/paramsModel'
import { MyGraphQlError } from '../services/GraphqlError'

const QUERY_MIS_ROLES_PERMISO_DOMINIO = gql`
  query MIS_ROLES_PERMISO_DOMINIO($dominio: String!) {
    misRolesPermisoPorDominio(dominio: $dominio)
  }
`
export interface MisRolesPermisoDominioResponse {
  misRolesPermisoPorDominio: string[]
}

/**
 * Obtiene los roles permiso por dominio
 * @param dominio
 */
export const apiMisRolesPermisoPorDominio = async (
  dominio: string,
): Promise<string[]> => {
  try {
    const accessToken = localStorage.getItem(AccessToken)
    if (!accessToken) {
      return []
    }

    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    client.setHeader('authorization', `Bearer ${accessToken}`)

    const data: MisRolesPermisoDominioResponse = await client.request(
      QUERY_MIS_ROLES_PERMISO_DOMINIO,
      { dominio: dominio || '' },
    )
    return data.misRolesPermisoPorDominio || []
  } catch (error: any) {
    console.error('Error al obtener permisos por dominio:', error)
    throw new MyGraphQlError(error)
  }
}
