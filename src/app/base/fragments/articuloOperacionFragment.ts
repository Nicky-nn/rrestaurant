// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

import { almacenFragment } from './almacenFragment.ts'
import { articuloOperacionModificadorFragment } from './articuloOperacionModificadorFragment.ts'
import { articuloOperacionRecetaFragment } from './articuloOperacionRecetaFragment.ts'
import { articuloPrecioOperacionFragment } from './articuloPrecioOperacionFragment.ts'
import { articuloUnidadMedidaFragment } from './articuloUnidadMedidaFragment.ts'
import { grupoArticuloFragment } from './grupoArticuloFragment.ts'
import { impresoraFragment } from './impresoraFragment.ts'
import { loteFragment } from './loteFragment.ts'
import { monedaFragment } from './monedaPrecioOperacionFragment.ts'
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
  ${monedaFragment}
  ${grupoArticuloFragment}
  ${loteFragment}
  ${tipoArticuloOperacionFragment}
  ${notaRapidaFragment}
  ${impresoraFragment}
  ${articuloOperacionModificadorFragment}
  ${articuloOperacionRecetaFragment}
`

/**
 * Fragmento de campos de articulo operacion
 * las dependencias se encuentran en articuloOperacionFieldsFragment
 * se quita articuloPrecioBase, sinProductoServicio
 * @author isi-template
 */
export const articuloOperacionFragment = gql`
  fragment articuloOperacionFields on ArticuloOperacion {
    almacen {
      ...almacenFields
    }
    articuloId
    articuloPrecio {
      ...articuloPrecioOperacionFields
    }
    claseArticulo
    codigoArticulo
    codigoGrupo
    cortesia
    detalleExtra
    gestionArticulo
    grupoArticulo {
      ...grupoArticuloFields
    }
    impresoras {
      ...impresoraFields
    }
    lote {
      ...loteFields
    }
    modificadores {
      ...articuloOperacionModificadorFields
    }
    nombreArticulo
    nota
    notaRapida {
      ...notaRapidaFields
    }
    nroItem
    state
    tipoArticulo {
      ...tipoArticuloOperacionFields
    }
    variacionReceta {
      ...articuloOperacionRecetaFields
    }
    verificarStock
  }
`
/**
 * Fragmento de campos de articulo operacion
 * las dependencias se encuentran en articuloOperacionFieldsFragment
 * Se obtienen los datos completos del servicio
 * @author isi-template
 */
export const articuloOperacionFullFragment = gql`
  fragment articuloOperacionFields on ArticuloOperacion {
    almacen {
      ...almacenFields
    }
    articuloId
    articuloPrecio {
      ...articuloPrecioOperacionFields
    }
    articuloPrecioBase {
      ...articuloPrecioOperacionFields
    }
    claseArticulo
    codigoArticulo
    codigoGrupo
    cortesia
    detalleExtra
    gestionArticulo
    grupoArticulo {
      ...grupoArticuloFields
    }
    impresoras {
      ...impresoraFields
    }
    lote {
      ...loteFields
    }
    modificadores {
      ...articuloOperacionModificadorFields
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
    state
    tipoArticulo {
      ...tipoArticuloOperacionFields
    }
    variacionReceta {
      ...articuloOperacionRecetaFields
    }
    verificarStock
  }
`
