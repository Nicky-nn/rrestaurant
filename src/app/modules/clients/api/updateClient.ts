// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { ClientUpdateResp } from '../interfaces/client.resp'
import { ClientApiInputProps } from '../interfaces/client'
import { CLIENT_FIELDS_FRAGMENT } from '../graphql/clientsGql'

const updateClientMutation = gql`
  ${CLIENT_FIELDS_FRAGMENT}
  mutation CLIENTE_ACTUALIZACION($id: ID!, $input: ClienteUpdateInput!) {
    clienteUpdate(id: $id, input: $input) {
      ...clientFields
    }
  }
`

export const updateClient = async (id: string, input: ClientApiInputProps): Promise<ClientUpdateResp> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)

    const response: ClientUpdateResp = await client.request(updateClientMutation, {
      id,
      input,
    })
    return response
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
