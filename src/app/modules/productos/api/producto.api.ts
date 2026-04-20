// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { PageInfoProps, PageInputProps } from '../../../interfaces'
import { ProductoProps } from '../interfaces/producto.interface'

/**
 * Respuesta de productos
 */
export interface ApiProductoResponse {
  docs: Array<ProductoProps>
  pageInfo: PageInfoProps
}

const query = gql`
  query FCV_PRODUCTOS($limit: Int!, $reverse: Boolean, $page: Int!, $query: String) {
    fcvProductos(limit: $limit, reverse: $reverse, page: $page, query: $query) {
      pageInfo {
        hasNextPage
        hasPrevPage
        limit
        page
        totalDocs
      }
      docs {
        _id
        state
        titulo
        descripcion
        actividadEconomica {
          codigoCaeb
          descripcion
          tipoActividad
        }
        descripcionHtml
        opcionesProducto {
          nombre
          valores
          id
        }
        tipoProducto {
          _id
          descripcion
          codigoParent
        }
        totalVariantes
        imagenDestacada {
          altText
          url
        }
        varianteUnica
        proveedor {
          codigo
          nombre
        }
        variantes {
          _id
          sinProductoServicio {
            codigoActividad
            codigoProducto
            descripcionProducto
          }
          codigoProducto
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
              municipio
            }
            stock
          }
          peso
        }
        state
        usucre
        createdAt
        usumod
        updatedAt
      }
    }
  }
`

/**
 * @description consumo api para listado de productos y sus variantes
 * @param pageInfo
 */
export const apiProductos = async (
  pageInfo: PageInputProps,
): Promise<ApiProductoResponse> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query, { ...pageInfo })
    return data.fcvProductos
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
