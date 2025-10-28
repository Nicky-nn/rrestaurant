// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmnt graphq para tipar los almacenes
 * @author isi-template
 */
export const almacenFragment = gql`
  fragment almacenFields on Almacen {
    codigoAlmacen
    createdAt
    nombre
    state
    sucursal {
      ...facturaSucursalFields
    }
    ubicacion
    updatedAt
    usucre
    usumod
  }
`
