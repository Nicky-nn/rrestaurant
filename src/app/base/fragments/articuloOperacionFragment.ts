// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

import { almacenFragment } from './almacenFragment.ts'
import { articuloOperacionComplementoFragment } from './articuloOperacionComplementoFragment.ts'
import { articuloPrecioOperacionFragment } from './articuloPrecioOperacionFragment.ts'
import { articuloUnidadMedidaFragment } from './articuloUnidadMedidaFragment.ts'
import { grupoArticuloFragment } from './grupoArticuloFragment.ts'
import { loteFragment } from './loteFragment.ts'
import { monedaFragment, monedaPrecioOperacionFragment } from './monedaPrecioOperacionFragment.ts'
import { notaRapidaFragment } from './notaRapidaFragment.ts'
import { facturaSucursalFragment } from './sucursalFragment.ts'
import { tipoArticuloOperacionFragment } from './tipoArticuloFragment.ts'

/**
 * Conjunto de fragmentos para la creacion del articulo operacion
 * Es el importador para articuloOperacionFragment que engloba a todos los demas fragments desplegados en el listado
 * almacenFields
 * facturaSucursalFields
 * ...
 * @author isi-template
 */
export const articuloOperacionFieldsFragment = gql`
  ${almacenFragment}
  ${facturaSucursalFragment}
  ${articuloPrecioOperacionFragment}
  ${articuloUnidadMedidaFragment}
  ${monedaPrecioOperacionFragment}
  ${monedaFragment}
  ${articuloOperacionComplementoFragment}
  ${grupoArticuloFragment}
  ${loteFragment}
  ${tipoArticuloOperacionFragment}
  ${notaRapidaFragment}
`

/**
 * Fragmento de campos de articulo operacion
 * las dependencias se encuentran en articuloOperacionFieldsFragment
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
