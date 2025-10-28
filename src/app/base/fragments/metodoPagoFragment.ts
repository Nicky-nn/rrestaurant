// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de metodo de pago
 * @author isi-template
 */
export const metodoPagoFragment = gql`
  fragment metodoPagoFields on MetodoPago {
    codigoClasificador
    descripcion
  }
`
