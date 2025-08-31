// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../../base/services/GraphqlError'
import { UsuarioCambiarPasswordInputProps } from '../interfaces/cuenta.interface'

const gqlQuery = gql`
  mutation CAMBIAR_PASSWORD($password: String!, $nuevoPassword: String!) {
    usuarioCambiarPassword(password: $password, nuevoPassword: $nuevoPassword)
  }
`

/**
 * @description Cambiamos el password del usuario
 * @author isi-template
 * @param input
 */
export const apiUsuarioCambiarPassword = async (
  input: UsuarioCambiarPasswordInputProps,
): Promise<Boolean> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(gqlQuery, {
      password: input.password,
      nuevoPassword: input.nuevoPassword,
    })
    return data.usuarioCambiarPassword
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
