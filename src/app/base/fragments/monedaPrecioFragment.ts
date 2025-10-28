// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento distribucion de monedas para el articulo-precio
 * @author isi-template
 */
export const monedaPrecioFragment = gql`
  fragment monedaPrecioFields on MonedaPrecio {
    manual
    moneda {
      ...monedaFields
    }
    precio
    delivery
    precioBase
    precioComparacion
  }
`
