// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos para los grupos de articulos
 * @author isi-template
 */
export const grupoUnidadMedidaFragment = gql`
  fragment grupoUnidadMedidaFields on GrupoUnidadMedida {
    _id
    codigoGrupo
    definicion {
      cantidadBase
      unidadMedida {
        ...articuloUnidadMedidaFields
      }
    }
    unidadMedidaBase {
      ...articuloUnidadMedidaFields
    }
    nombreGrupo
    state
  }
`
