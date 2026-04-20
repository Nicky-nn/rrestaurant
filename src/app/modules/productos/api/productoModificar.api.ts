// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { ProductoInputApiProps, ProductoProps } from '../interfaces/producto.interface'

const gqlQuery = gql`
  mutation PRODUCTOS_REGISTRO($id: ID!, $input: FcvProductoInput!) {
    fcvProductoActualizar(id: $id, input: $input) {
      _id
    }
  }
`
export const apiProductoModificar = async (
  id: string,
  input: ProductoInputApiProps,
): Promise<ProductoProps> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)
    const data: any = await client.request(gqlQuery, { id, input })
    return data.fcvProductoActualizar
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
