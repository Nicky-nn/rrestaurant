// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { SinMotivoAnulacionProps } from '../interfaces/sin.interface'

const query = gql`
  query MOTIVO_ANULACION {
    sinMotivoAnulacion {
      codigoClasificador
      descripcion
    }
  }
`

export const fetchSinMotivoAnulacion = async (): Promise<SinMotivoAnulacionProps[]> => {
  const client = new GraphQLClient(import.meta.env.ISI_API_URL)
  const token = localStorage.getItem(AccessToken)
  // Set a single header
  client.setHeader('authorization', `Bearer ${token}`)

  const data: any = await client.request(query)
  return data.sinMotivoAnulacion
}
