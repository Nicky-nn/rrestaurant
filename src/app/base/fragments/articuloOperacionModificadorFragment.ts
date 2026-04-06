// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento para operacion modificadores
 * @author isi-template
 */
export const articuloOperacionModificadorFragment = gql`
  fragment articuloOperacionModificadorFields on ArticuloOperacionModificador {
    almacen {
      _id
      codigoAlmacen
      nombre
      ubicacion
      tipo
      prioridad
    }
    articuloId
    articuloModificadorId
    articuloPrecio {
      ...articuloPrecioOperacionFields
    }
    cantidadIncluida
    codigoArticulo
    elegibleParaGratis
    esOpcionGratuita
    lote {
      ...loteFields
    }
    nombreArticulo
    nota
    notaRapida {
      ...notaRapidaFields
    }
    nroItem
    state
  }
`
