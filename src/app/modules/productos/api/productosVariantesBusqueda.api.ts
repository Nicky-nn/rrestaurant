// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { ProductoVarianteProps } from '../interfaces/producto.interface'

const reqQuery = gql`
  query FCV_PRODUCTOS_VARIANTES_BUSQUEDA($query: String) {
    fcvProductosVariantesBusqueda(query: $query) {
      id
      sinProductoServicio {
        codigoActividad
        codigoProducto
        descripcionProducto
      }
      codigoProducto
      producto {
        titulo
        totalVariantes
        varianteUnica
        imagenDestacada {
          altText
          url
        }
      }
      titulo
      nombre
      codigoBarras
      precio
      precioComparacion
      costo
      imagen {
        altText
        url
      }
      incluirCantidad
      verificarStock
      unidadMedida {
        codigoClasificador
        descripcion
      }
      inventario {
        sucursal {
          codigo
          direccion
        }
        stock
      }
      peso
    }
  }
`

/**
 * @description Buscamos las variantes, actividad economica
 * @param query
 */
export const apiProductosVariantesBusqueda = async (
  query: string,
): Promise<ProductoVarianteProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(reqQuery, { query })
    return data?.fcvProductosVariantesBusqueda || []
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
