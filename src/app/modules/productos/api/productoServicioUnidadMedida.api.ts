// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import {
  SinProductoServicioProps,
  SinUnidadMedidaProps,
} from '../../sin/interfaces/sin.interface'

interface ApiProductoServicioUnidadMedidaResponse {
  sinProductoServicioPorActividad: SinProductoServicioProps[]
  sinUnidadMedida: SinUnidadMedidaProps[]
}

const gqlQuery = gql`
  query PRODUCTO_SERVICIO_POR_ACTIVIDAD_UNIDAD_MEDIDA($codigoActividad: String!) {
    sinProductoServicioPorActividad(codigoActividad: $codigoActividad) {
      codigoActividad
      codigoProducto
      descripcionProducto
    }
    sinUnidadMedida {
      codigoClasificador
      descripcion
    }
  }
`

export const apiProductoServicioUnidadMedida = async (
  codigoActividad: string,
): Promise<ApiProductoServicioUnidadMedidaResponse> => {
  const client = new GraphQLClient(import.meta.env.ISI_API_URL)
  const token = localStorage.getItem(AccessToken)
  // Set a single header
  client.setHeader('authorization', `Bearer ${token}`)
  const data: any = await client.request(gqlQuery, { codigoActividad })
  return data
}
