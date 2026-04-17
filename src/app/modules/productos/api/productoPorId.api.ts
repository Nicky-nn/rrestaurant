// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { ProductoProps } from '../interfaces/producto.interface'

const query = gql`
  query FCV_PRODUCTO($id: ID!) {
    fcvProducto(id: $id) {
      _id
      state
      titulo
      descripcion
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
      tipoProducto {
        _id
        descripcion
        parientes
      }
      variantes {
        _id
        id
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
`

export const apiProductoPorId = async (id: string): Promise<ProductoProps> => {
  const client = new GraphQLClient(import.meta.env.ISI_API_URL)
  const token = localStorage.getItem(AccessToken)
  // Set a single header
  client.setHeader('authorization', `Bearer ${token}`)

  const data: any = await client.request(query, { id })
  return data.fcvProducto
}
