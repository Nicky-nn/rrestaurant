// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de lote
 * @author isi-template
 */
export const inventarioLoteFragment = gql`
  fragment inventarioLoteFields on InventarioLote {
    codigoLote
    lote {
      ...loteFields
    }
    stock
    comprometido
    disponible
    solicitado
  }
`

/**
 * Fragmento inventario detalle
 * @author isi-template
 */
export const inventarioDetalleFragment = gql`
  fragment inventarioDetalleFields on InventarioDetalle {
    almacen {
      ...almacenFields
    }
    lotes {
      ...inventarioLoteFields
    }
    orden
    stock
    comprometido
    disponible
    solicitado
  }
`
