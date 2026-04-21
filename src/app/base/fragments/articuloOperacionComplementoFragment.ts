// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmnt graphq para tipar los almacenes
 * @author isi-template
 * @deprecated
 */
export const articuloOperacionComplementoFragment = gql`
  fragment articuloOperacionComplementoFields on ArticuloOperacionComplemento {
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
    codigoGrupo
    detalleExtra
    grupoArticulo {
      ...grupoArticuloFields
    }
    lote {
      ...loteFields
    }
    nombreArticulo
    nota
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
