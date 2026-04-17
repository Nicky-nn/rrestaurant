// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { ProductoInputApiProps, ProductoProps } from '../interfaces/producto.interface'

const gqlQuery = gql`
  mutation PRODUCTOS_REGISTRO($input: FcvProductoInput!) {
    fcvProductoRegistro(input: $input) {
      _id
    }
  }
`

/**
 * @description Api para registro de un producto
 * @param input
 */
export const apiProductoRegistro = async (
  input: ProductoInputApiProps,
): Promise<ProductoProps> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)
    const data: any = await client.request(gqlQuery, { input })
    return data.fcvProductoRegistro
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
