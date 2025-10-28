// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de lote
 * @author isi-template
 */
export const loteFragment = gql`
  fragment loteFields on Lote {
    _id
    atributo1
    atributo2
    atributo3
    codigoLote
    descripcion
    fechaAdmision
    fechaFabricacion
    fechaVencimiento
    sucursal {
      ...facturaSucursalFields
    }
    state
    createdAt
    updatedAt
    usucre
    usumod
  }
`
