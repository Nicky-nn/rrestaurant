// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { PageInfoProps, PageProps } from '../../../interfaces'
import { FacturaProps } from '../interfaces/factura'

/**
 * Respuesta de productos
 */
export interface ApiFacturaResponse {
  docs: Array<FacturaProps>
  pageInfo: PageInfoProps
}

export interface EntidadParamsInput {
  codigoSucursal: number
  codigoPuntoVenta: number
}

const query = gql`
  query LISTADO(
    $limit: Int!
    $entidad: EntidadParamsInput!
    $reverse: Boolean
    $page: Int!
    $query: String
  ) {
    restFacturaListado(
      limit: $limit
      entidad: $entidad
      reverse: $reverse
      page: $page
      query: $query
    ) {
      pageInfo {
        hasNextPage
        hasPrevPage
        limit
        page
        totalDocs
      }
      docs {
        nitEmisor
        razonSocialEmisor
        numeroFactura
        tipoFactura {
          codigoClasificador
          descripcion
        }
        tipoEmision {
          codigoClasificador
          descripcion
        }
        cuf
        cufd {
          codigo
          codigoControl
          direccion
          fechaVigencia
          fechaInicial
        }
        cuis {
          codigo
          fechaVigencia
        }
        sucursal {
          codigo
          direccion
          telefono
          departamento {
            codigo
            codigoPais
            sigla
            departamento
          }
          municipio
        }
        puntoVenta {
          codigo
          tipoPuntoVenta {
            codigoClasificador
            descripcion
          }
          nombre
          descripcion
        }
        fechaEmision
        cliente {
          razonSocial
          codigoCliente
          tipoDocumentoIdentidad {
            codigoClasificador
            descripcion
          }
          numeroDocumento
          complemento
          nombres
          apellidos
          email
          telefono
        }
        metodoPago {
          codigoClasificador
          descripcion
        }
        numeroTarjeta
        montoTotal
        montoGiftCard
        montoTotalLiteral
        montoTotalSujetoIva
        montoTotalMoneda
        moneda {
          codigoClasificador
          descripcion
        }
        tipoCambio
        montoGiftCard
        detalle {
          nroItem
          actividadEconomica {
            codigoCaeb
            descripcion
            tipoActividad
          }
          productoServicio {
            codigoActividad
            codigoProducto
            descripcionProducto
          }
          producto
          descripcion
          cantidad
          unidadMedida {
            codigoClasificador
            descripcion
          }
          precioUnitario
          montoDescuento
          subTotal
          numeroImei
          numeroSerie
          detalleExtra
        }
        representacionGrafica {
          pdf
          xml
          rollo
          rolloResumen
          rolloReducido
          sin
        }
        detalleExtra
        usuario
        state
        usucre
        createdAt
        usumod
        updatedAt
      }
    }
  }
`

export const fetchFacturaListado = async (
  pageInfo: PageProps,
  entidad: EntidadParamsInput,
): Promise<ApiFacturaResponse> => {
  const client = new GraphQLClient(import.meta.env.ISI_API_URL)
  const token = localStorage.getItem(AccessToken)
  // Set a single header
  client.setHeader('authorization', `Bearer ${token}`)

  const data: any = await client.request(query, { ...pageInfo, entidad })
  return data.restFacturaListado
}
