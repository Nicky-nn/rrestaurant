// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de articulo operacion
 * @author isi-template
 */
export const articuloOperacionFragment = gql`
  fragment articuloOperacionFields on ArticuloOperacion {
    almacen {
      ...almacenFields
    }
    articuloPrecio {
      ...articuloPrecioOperacionFields
    }
    articuloPrecioBase {
      ...articuloPrecioOperacionFields
    }
    claseArticulo
    codigoArticulo
    articuloId
    codigoGrupo
    complementos {
      ...articuloOperacionComplementoFields
    }
    detalleExtra
    gestionArticulo
    grupoArticulo {
      ...grupoArticuloFields
    }
    lote {
      ...loteFields
    }
    nombreArticulo
    nota
    notaRapida {
      ...notaRapidaFields
    }
    nroItem
    sinProductoServicio {
      codigoActividad
      codigoProducto
      descripcionProducto
    }
    tipoArticulo {
      ...tipoArticuloOperacionFields
    }
    verificarStock
  }
`
