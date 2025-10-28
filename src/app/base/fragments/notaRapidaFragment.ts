// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos para notas rapidas
 * @author isi-template
 */
export const notaRapidaFragment = gql`
  fragment notaRapidaFields on NotaRapida {
    atributo1
    atributo2
    cantidad
    valor
  }
`
