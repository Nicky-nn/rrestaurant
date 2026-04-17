import { gql, GraphQLClient } from 'graphql-request'
import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { ArqueoCajaCorreoApiInput } from '../interfaces/envioArqueoCaja'

const query = gql`
  mutation ENVIAR_ARQUEO_CAJA_CORREO($input: EmailEnviarMensajeInput) {
    emailEnviarMensaje(input: $input)
  }
`

export const apiArqueoCajaCorreo = async (
  input: ArqueoCajaCorreoApiInput,
): Promise<boolean> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)
    const data: any = await client.request(query, { input })
    return data.emailEnviarMensaje
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
