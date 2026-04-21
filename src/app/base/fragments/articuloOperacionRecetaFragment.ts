// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento para operacion recetas
 * @author isi-template
 */
export const articuloOperacionRecetaFragment = gql`
  fragment articuloOperacionRecetaFields on ArticuloOperacionReceta {
    almacen {
      _id
      codigoAlmacen
      nombre
      ubicacion
      tipo
      prioridad
    }
    articuloId
    articuloPrecio {
      ...articuloPrecioOperacionFields
    }
    codigoArticulo
    esExtra
    lote {
      ...loteFields
    }
    nombreArticulo
    nota
    notaRapida {
      ...notaRapidaFields
    }
    nroItem
    removido
    state
  }
`
