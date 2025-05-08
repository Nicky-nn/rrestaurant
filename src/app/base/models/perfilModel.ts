// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { PerfilFragment } from '../interfaces/session'
import { MyGraphQlError } from '../services/GraphqlError'
import { PerfilProps } from './loginModel'
import { AccessToken } from './paramsModel'

const query = gql`
  ${PerfilFragment}
  query PERFIL {
    perfil {
      ...PerfilField
    }
  }
`

/**
 * @description Obtenemos los datos de perfil, la información generada es exactamente igual al del login
 */
export const perfilModel = async (): Promise<PerfilProps> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)
    const data: any = await client.request(query)
    return data.perfil
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
