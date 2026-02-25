// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { ClientApiInputProps } from '../interfaces/client'

export interface Cliente99001ApiInputProp {
  apellidos: string
  codigoCliente: string
  email: string
  nombres: string
  razonSocial: string
}

const queryGql = gql`
  mutation CLIENTE_REGISTRO($input: Cliente99001Input!) {
    cliente99001Create(input: $input) {
      _id
      nombres
      apellidos
      codigoCliente
      complemento
      email
      numeroDocumento
      razonSocial
      codigoExcepcion
      tipoDocumentoIdentidad {
        codigoClasificador
        descripcion
      }
      telefono
      state
      usucre
      createdAt
      usumod
      UpdatedAt
    }
  }
`

/**
 * @description CotizacionRegistro de un cliente normal
 * @param input
 */
export const apiCliente99001Registro = async (
  input: Cliente99001ApiInputProp,
): Promise<ClientApiInputProps> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(queryGql, { input })
    return data.cliente99001Create
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
