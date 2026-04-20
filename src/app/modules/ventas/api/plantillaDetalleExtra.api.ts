// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { PlantillaDetalleExtra } from '../../../interfaces'

const query = gql`
  query PLANTILLA_DETALLE_EXTRA {
    plantillasDetalleExtra {
      title
      description
      content
    }
  }
`

/**
 * @description Detalle de plantillas extra
 */
export const apiPlantillaDetalleExtra = async (): Promise<PlantillaDetalleExtra[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query)
    return data.plantillasDetalleExtra
  } catch (e: any) {
    return []
    // throw new MyGraphQlError(e)
  }
}
