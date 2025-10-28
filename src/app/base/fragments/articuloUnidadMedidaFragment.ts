// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento para articulo Unidad medida fragment
 * @author isi-template
 */
export const articuloUnidadMedidaFragment = gql`
  fragment articuloUnidadMedidaFields on ArticuloUnidadMedida {
    _id
    altura
    ancho
    codigoUnidadMedida
    longitud
    volumen
    nombreUnidadMedida
    peso
    sinUnidadMedida {
      codigoClasificador
      descripcion
    }
    state
  }
`
