// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de articulo precio operacion
 * @author isi-template
 */
export const articuloPrecioOperacionFragment = gql`
  fragment articuloPrecioOperacionFields on ArticuloPrecioOperacion {
    articuloUnidadMedida {
      ...articuloUnidadMedidaFields
    }
    cantidad
    cantidadBase
    cantidadFactor
    descuento
    descuentoAdicional
    esDescuentoTotal
    estructuraValor {
      descuento
      descuentoAdicional
      gastoAdicional
      impuestoUnitario
      tipoOperacion
      totales {
        subtotalBruto
        subtotalNeto
        totalDescuento
        totalFinal
        totalGasto
        totalImpuestos
      }
      valorBase
      valorBaseAnterior
      valorFinal
      valorNeto
      variacion
    }
    factorAjuste
    impuesto
    incluyeImpuesto
    monedaPrecio {
      ...monedaPrecioOperacionFields
    }
    otrosCostos
    tipoCambio
    tipoOperacion
    valor
  }
`
