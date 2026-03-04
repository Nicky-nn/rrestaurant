// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { ArticuloMonedaProps } from '../../interfaces/articuloMoneda.ts'
import { AccessToken } from '../models/paramsModel.ts'
import { MyGraphQlError } from '../services/GraphqlError.ts'

const query = gql`
  query LISTADO {
    articuloMoneda {
      monedaPrimaria {
        codigo
        descripcion
        sigla
        tipoCambio
        tipoCambioCompra
        activo
        usucre
        usumod
        createdAt
        updatedAt
      }
      monedaAdicional1 {
        codigo
        descripcion
        sigla
        tipoCambio
        tipoCambioCompra
        activo
        usucre
        usumod
        createdAt
        updatedAt
      }
      monedaAdicional2 {
        codigo
        descripcion
        sigla
        tipoCambio
        tipoCambioCompra
        activo
        usucre
        usumod
        createdAt
        updatedAt
      }
      monedaAdicional3 {
        codigo
        descripcion
        sigla
        tipoCambio
        tipoCambioCompra
        activo
        usucre
        usumod
        createdAt
        updatedAt
      }
    }
  }
`

/**
 * Listamos la configuración de articulo moneda
 */
export const apiArticuloMoneda = async (): Promise<ArticuloMonedaProps> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query)
    return data.articuloMoneda
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
