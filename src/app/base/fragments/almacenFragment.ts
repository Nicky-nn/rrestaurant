// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmnt graphq para tipar los almacenes
 * @author isi-template
 */
export const almacenFragment = gql`
  fragment almacenFields on Almacen {
    _id
    codigoAlmacen
    createdAt
    nombre
    state
    sucursal {
      ...facturaSucursalFields
    }
    ubicacion
    tipo
    prioridad
    ubicacion
    updatedAt
    usucre
    usumod
  }
`
