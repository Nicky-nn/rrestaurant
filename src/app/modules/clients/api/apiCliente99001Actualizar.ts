// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { CLIENT_FIELDS_FRAGMENT } from '../graphql/clientsGql'
import { ClientRegisterResp } from '../interfaces/client.resp'

const queryGql = gql`
  ${CLIENT_FIELDS_FRAGMENT}
  mutation CLIENTE_ACTUALIZAR($id: ID!, $input: Cliente99001UpdateInput!) {
    cliente99001Update(id: $id, input: $input) {
      ...ClienteFields
    }
  }
`

/**
 * @description Actualización de un cliente 99001
 * @param id
 * @param input
 */
export const apiCliente99001Actualizar = async (id: string, input: any): Promise<ClientRegisterResp> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)
    const data: any = await client.request(queryGql, { id, input })
    return data.cliente99001Update
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
