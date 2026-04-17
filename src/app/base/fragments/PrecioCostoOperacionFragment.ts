// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de articulo precio operacion
 * @author isi-template
 */
export const precioCostoOperacionFragment = gql`
  fragment precioCostoOperacionFields on PrecioCostoOperacion {
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
    valor
    valorAnterior
    valorFinal
    valorNeto
    variacion
  }
`
