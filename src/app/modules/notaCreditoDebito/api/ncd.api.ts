import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { PageInfoProps, PageInputProps } from '../../../interfaces'
import { NcdProps } from '../interfaces/ncdInterface'

/**
 * Respuesta de productos
 */
export interface ApiNotaCreditoDebitoResponse {
  docs: Array<NcdProps>
  pageInfo: PageInfoProps
}

const query = gql`
  query LISTADO(
    $limit: Int!
    $entidad: EntidadParamsInput
    $reverse: Boolean
    $query: String
  ) {
    restNotaCreditoDebitoListado(
      limit: $limit
      entidad: $entidad
      reverse: $reverse
      query: $query
    ) {
      pageInfo {
        hasNextPage
        hasPrevPage
        limit
        page
        totalDocs
        totalPages
      }
      docs {
        nitEmisor
        razonSocialEmisor
        numeroNotaCreditoDebito
        numeroFactura
        cuf
        cufd {
          codigo
          codigoControl
        }
        cuis {
          codigo
        }
        sucursal {
          codigo
        }
        puntoVenta {
          codigo
        }
        fechaEmision

        cliente {
          razonSocial
          codigoCliente
          numeroDocumento
          tipoDocumentoIdentidad {
            codigoClasificador
            descripcion
          }
          complemento
        }
        numeroAutorizacionCuf
        fechaEmisionFactura
        montoTotalOriginal
        montoTotalDevuelto
        montoDescuentoCreditoDebito
        montoEfectivoCreditoDebito
        usuario
        detalle {
          nroItem
          nroItemFactura
          productoServicio {
            codigoActividad
            codigoProducto
            descripcionProducto
          }
          producto
          descripcion
          cantidad
          unidadMedida {
            descripcion
          }
          precioUnitario
        }
        codigoRecepcion
        motivoAnulacion {
          descripcion
        }
        representacionGrafica {
          pdf
          rollo
          xml
          sin
        }
        usucre
        createdAt
        updatedAt
        state
      }
    }
  }
`

export const apiNotasCreditoDebito = async (
  pageInfo: PageInputProps,
  codigoSucursal: number,
  codigoPuntoVenta: number,
): Promise<ApiNotaCreditoDebitoResponse> => {
  const client = new GraphQLClient(import.meta.env.ISI_API_URL)
  const token = localStorage.getItem(AccessToken)
  // Set a single header
  client.setHeader('authorization', `Bearer ${token}`)

  const entidad = {
    codigoSucursal,
    codigoPuntoVenta,
  }

  const data: any = await client.request(query, { ...pageInfo, entidad })
  return data.restNotaCreditoDebitoListado
}
