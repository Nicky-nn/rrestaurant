import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { CLIENT_FIELDS_FRAGMENT } from '../graphql/clientsGql'
import { ClientApiInputProps } from '../interfaces/client'
import { ClientRegisterResp } from '../interfaces/client.resp'

const createClientMutation = gql`
  ${CLIENT_FIELDS_FRAGMENT}
  mutation CLIENTE_REGISTRO($input: ClienteInput!) {
    clienteCreate(input: $input) {
      ...clientFields
    }
  }
`
export const registerClient = async (input: ClientApiInputProps): Promise<ClientRegisterResp> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)
    const response: ClientRegisterResp = await client.request(createClientMutation, {
      input,
    })
    return response
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
