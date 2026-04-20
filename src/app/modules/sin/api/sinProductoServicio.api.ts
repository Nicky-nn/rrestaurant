// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import {
  SinMotivoAnulacionProps,
  SinProductoServicioProps,
} from '../interfaces/sin.interface'

const query = gql`
  query PRODUCTO_SERVICIO {
    sinProductoServicio {
      codigoActividad
      codigoProducto
      descripcionProducto
    }
  }
`

const queryProductoServicioPorActividad = gql`
  query PRODUCTO_SERVICIO_POR_ACTIVIDAD($codigoActividad: String!) {
    sinProductoServicioPorActividad(codigoActividad: $codigoActividad) {
      codigoActividad
      codigoProducto
      descripcionProducto
    }
  }
`
/**
 * Listamos ltodos los producto servicios
 */
export const fetchSinProductoServicio = async (): Promise<SinProductoServicioProps[]> => {
  const client = new GraphQLClient(import.meta.env.ISI_API_URL)
  const token = localStorage.getItem(AccessToken)
  // Set a single header
  client.setHeader('authorization', `Bearer ${token}`)

  const data: any = await client.request(query)
  return data.sinProductoServicio
}

/**
 * Filtro de productos por tipo de actividad
 * @param codigoActividad
 */
export const fetchSinProductoServicioPorActividad = async (
  codigoActividad: string,
): Promise<SinProductoServicioProps[]> => {
  const client = new GraphQLClient(import.meta.env.ISI_API_URL)
  const token = localStorage.getItem(AccessToken)
  // Set a single header
  client.setHeader('authorization', `Bearer ${token}`)

  const data: any = await client.request(queryProductoServicioPorActividad, {
    codigoActividad: codigoActividad || '',
  })
  return data.sinProductoServicioPorActividad
}
