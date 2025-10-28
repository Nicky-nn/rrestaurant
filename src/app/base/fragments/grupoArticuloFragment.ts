// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos para los grupos de articulos
 * @author isi-template
 */
export const grupoArticuloFragment = gql`
  fragment grupoArticuloFields on GrupoArticulo {
    codigoGrupoArticulo
    nombreGrupoArticulo
  }
`
