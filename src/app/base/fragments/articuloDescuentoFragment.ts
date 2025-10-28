// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de gestion de descuentos al articulo precdio
 * @author isi-template
 */
export const articuloDescuentoFragment = gql`
  fragment articuloDescuentoFields on ArticuloDescuento {
    cantidad {
      nro
      porcentaje
    }
    fechaFinal
    fechaInicial
    porcentaje
  }
`
