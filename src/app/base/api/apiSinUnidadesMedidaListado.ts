// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { SinUnidadMedidaProps } from '../../interfaces/sin.interface.ts'
import { AccessToken } from '../models/paramsModel.ts'
import { MyGraphQlError } from '../services/GraphqlError.ts'

const gqlQuery = gql`
  query SIN_UNIDAD_MEDIDA_LISTADO {
    sinUnidadMedida {
      codigoClasificador
      descripcion
    }
  }
`

/**
 * Listado de lotes para selección
 * @author isi-template
 */
export const apiSinUnidadMedidaListado = async (): Promise<SinUnidadMedidaProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(gqlQuery)
    return data.sinUnidadMedida
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
