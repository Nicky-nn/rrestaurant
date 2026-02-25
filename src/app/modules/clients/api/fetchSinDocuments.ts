import { gql, GraphQLClient } from 'graphql-request'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { AccessToken } from '../../../base/models/paramsModel'
import { SinDocumentsTypeResp } from '../interfaces/sinDocumentsTypeResp'

export const sinDocumentTypeQuery = gql`
  query TIPOS_DOCUMENTO_IDENTIDAD {
    sinTipoDocumentoIdentidad {
      codigoClasificador
      descripcion
    }
  }
`

export const fetchSinDocuments = async (): Promise<SinDocumentsTypeResp> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('Authorization', `Bearer ${token}`)
    const response: SinDocumentsTypeResp = await client.request(sinDocumentTypeQuery)
    return response
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
