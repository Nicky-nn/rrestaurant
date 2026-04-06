// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de cálculos operaciones para el item.
 * @author isi-template
 */
export const totalesOperacionFragment = gql`
  fragment totalesPrecioCostoOperacionFields on TotalesPrecioCostoOperacion {
    subtotalBruto
    subtotalNeto
    totalDescuento
    totalDescuentoAdicional
    totalDescuentoAdicionalP
    totalDescuentoGeneral
    totalDescuentoGeneralP
    totalDescuentoP
    totalFinal
    totalGasto
    totalImpuestos
  }
`

/**
 *  Resultados finales calculados para los detalles
 *  - Operacion es según la transacción entre cliente sistema.
 *  - Sistema = conversion de datos de operacion segpun moneda principal
 * @author isi-template
 */
export const totalesGeneralesFragment = gql`
  fragment totalesGeneralesFields on TotalesGenerales {
    operacion {
      ...totalesPrecioCostoOperacionFields
    }
    sistema {
      ...totalesPrecioCostoOperacionFields
    }
  }
`
