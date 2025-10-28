// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento para impresoras
 * @author isi-template
 */
export const impresoraFragment = gql`
  fragment impresoraFields on Impresora {
    _id
    nombre
    descripcion
    atributo1
    sucursal {
      ...sucursalFields
    }
    puntoVenta {
      ...puntoVentaFragment
    }
    atributo2
    state
  }
`
