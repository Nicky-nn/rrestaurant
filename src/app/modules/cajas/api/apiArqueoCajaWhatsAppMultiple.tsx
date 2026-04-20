import { gql, GraphQLClient } from 'graphql-request'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { EntidadInputProps } from '../../../interfaces'
import { AccessToken } from '../../../base/models/paramsModel'
import { ArqueoCajaWhatsAppApiInput, WaapiProps } from '../interfaces/envioArqueoCaja'

const query = gql`
  mutation ENVIAR_ARQUEO_CAJA_WHATSAPP(
    $entidad: EntidadParamsInput!
    $input: WaapiEnviarUrlInput!
  ) {
    waapiEnviarUrl(entidad: $entidad, input: $input) {
      _id
      mensaje
      mediaName
      mediaUrl
    }
  }
`
type WaapiEnviarUrlResponse = { waapiEnviarUrl: WaapiProps }

export const apiArqueoCajaWhatsAppMultiple = async (
  entidad: EntidadInputProps,
  inputs: ArqueoCajaWhatsAppApiInput[], // ahora recibe un array
): Promise<WaapiProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)

    // Ejecutar mutaciones en paralelo con Promise.all
    const responses = await Promise.all(
      inputs.map((input) =>
        client.request<WaapiEnviarUrlResponse>(query, { entidad, input }),
      ),
    )

    // Retornar como array
    return responses.map((r) => r.waapiEnviarUrl)
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
