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
    ## deprecado
    cantidadBase
    cantidadFactor
    descuento
    descuentoAdicional
    esDescuentoTotal
    estructuraValor {
      tipoOperacion
      valor
      valorAnterior
      descuento
      descuentoAdicional
      descuentoTotal
      descuentoP
      descuentoAdicionalP
      descuentoTotalP
      valorNeto
      impuestoUnitario
      gastoAdicional
      variacion
      valorFinal
      totales {
        subtotalBruto
        totalDescuento
        totalDescuentoAdicional
        totalDescuentoGeneral
        totalDescuentoP
        totalDescuentoAdicionalP
        totalDescuentoGeneralP
        subtotalNeto
        totalImpuestos
        totalGasto
        totalFinal
      }
    }
    factorAjuste
    impuesto
    incluyeImpuesto
    moneda {
      ...monedaFields
    }
    ## deprecado
    monedaPrecio {
      ...monedaPrecioOperacionFields
    }
    otrosCostos
    tipoCambio
    tipoOperacion
    valor
  }
`
