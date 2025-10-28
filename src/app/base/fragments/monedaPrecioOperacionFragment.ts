// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de moneda
 * @author isi-template
 */
export const monedaFragment = gql`
  fragment monedaFields on Moneda {
    _id
    activo
    codigo
    descripcion
    sigla
    tipoCambio
    tipoCambioCompra
    state
    createdAt
    updatedAt
    usucre
    usumod
  }
`

/**
 * Fragmento de campos de moneda operacion
 * @author isi-template
 */
export const monedaPrecioOperacionFragment = gql`
  fragment monedaPrecioOperacionFields on MonedaPrecioOperacion {
    moneda {
      ...monedaFields
    }
    precio
    precioBase
  }
`
