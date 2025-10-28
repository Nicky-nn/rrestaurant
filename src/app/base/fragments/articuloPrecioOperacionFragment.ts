// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de articulo precio operacion
 * @author isi-template
 */
export const articuloPrecioOperacionFragment = gql`
  fragment articuloPrecioOperacionFields on ArticuloPrecioOperacion {
    articuloUnidadMedida {
      ...articuloUnidadMedidaFields
    }
    cantidad
    cantidadBase
    descuento
    descuentoAdicional
    factorAjuste
    impuesto
    monedaPrecio {
      ...monedaPrecioOperacionFields
    }
    otrosCostos
  }
`
