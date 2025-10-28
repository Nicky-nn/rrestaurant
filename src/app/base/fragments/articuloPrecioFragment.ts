// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de articulo precio operacion
 * @author isi-template
 */
export const articuloPrecioFragment = gql`
  fragment articuloPrecioFields on ArticuloPrecio {
    articuloUnidadMedida {
      ...articuloUnidadMedidaFields
    }
    cantidadBase
    descuento {
      ...articuloDescuentoFields
    }
    factorAjuste
    imagen {
      ...imagenCloudFields
    }
    monedaAdicional1 {
      ...monedaPrecioFields
    }
    monedaAdicional2 {
      ...monedaPrecioFields
    }
    monedaAdicional3 {
      ...monedaPrecioFields
    }
    monedaPrimaria {
      ...monedaPrecioFields
    }
    umCompra
    umInventario
    umVenta
  }
`
