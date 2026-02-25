// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'
import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'

const deleteClientMutation = gql`
  mutation CLIENTES_ELIMINAR($codigosCliente: [String]!) {
    clientesEliminar(codigosCliente: $codigosCliente)
  }
`

export const deleteClients = async (codigosCliente: string[]): Promise<boolean> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(deleteClientMutation, { codigosCliente })
    return data.clientesEliminar
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
