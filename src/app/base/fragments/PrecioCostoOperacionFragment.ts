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
    descuentoAdicionalP
    descuentoP
    descuentoTotal
    descuentoTotalP
    gastoAdicional
    impuestoUnitario
    tipoOperacion
    totales
    valor
    valorAnterior
    valorFinal
    valorNeto
    variacion
  }
`
