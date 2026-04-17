// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { PageInfoProps, PageProps } from '../../../interfaces'
import { FacturaProps } from '../../ventas/interfaces/factura'
import { ProductoVarianteProps } from '../interfaces/producto.interface'

const reqQuery = gql`
  query FCV_PRODUCTOS_VARIANTES(
    $limit: Int!
    $reverse: Boolean
    $page: Int!
    $query: String
  ) {
    fcvProductosVariantes(limit: $limit, reverse: $reverse, page: $page, query: $query) {
      pageInfo {
        hasNextPage
        hasPrevPage
        limit
        page
        totalDocs
      }
      docs {
        _id
        id
        sinProductoServicio {
          codigoActividad
          codigoProducto
          descripcionProducto
        }
        codigoProducto
        producto {
          _id
          titulo
          descripcion
          descripcionHtml
          opcionesProducto {
            id
            nombre
            valores
          }
          tipoProducto {
            _id
            codigoParent
            descripcion
          }
          totalVariantes
          imagenDestacada {
            altText
            url
          }
          proveedor {
            codigo
            nombre
            direccion
            ciudad
            contacto
            correo
            telefono
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
            telefono
            municipio
          }
          stock
        }
        peso
        state
        usucre
        createdAt
        usumod
        createdAt
      }
    }
  }
`
/**
 * Respuesta de productos
 */
export interface ApiProductoVarianteResponse {
  docs: Array<ProductoVarianteProps>
  pageInfo: PageInfoProps
}

export const apiProductosVariantes = async (
  pageInfo: PageProps,
): Promise<ApiProductoVarianteResponse> => {
  const client = new GraphQLClient(import.meta.env.ISI_API_URL)
  const token = localStorage.getItem(AccessToken)
  // Set a single header
  client.setHeader('authorization', `Bearer ${token}`)

  const data: any = await client.request(reqQuery, { ...pageInfo })
  return data?.fcvProductosVariantes || []
}
