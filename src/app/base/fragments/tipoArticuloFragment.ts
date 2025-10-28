// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos para tipo de articulo operacion
 * @author isi-template
 */
export const tipoArticuloOperacionFragment = gql`
  fragment tipoArticuloOperacionFields on TipoArticuloOperacion {
    codigo
    descripcion
  }
`

/**
 * Fragmento de campos para tipo de articulo operacion
 * @author isi-template
 */
export const tipoArticuloFragment = gql`
  fragment tipoArticuloFields on TipoArticulo {
    _id
    codigo
    descripcion
    notas
    state
  }
`
