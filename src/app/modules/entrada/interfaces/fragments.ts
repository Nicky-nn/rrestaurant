// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

import {
  articuloOperacionFieldsFragment,
  articuloOperacionFullFragment,
} from '../../../base/fragments/articuloOperacionFragment.ts'
import { facturaPuntoVentaFragment, puntoVentaFrament } from '../../../base/fragments/puntoVentaFragment.ts'
import { sucursalFragment } from '../../../base/fragments/sucursalFragment.ts'
import { workflowFragment } from '../../../base/fragments/workflowFragment.ts'

export const TOTALES_FIELDS_FRAGMENT = gql`
  fragment totalesFields on TotalesGenerales {
    operacion {
      subtotalBruto
      subtotalLineaVisual
      totalDescuento
      totalDescuentoP
      totalDescuentoAdicional
      totalDescuentoGeneral
      totalDescuentoAdicionalP
      totalDescuentoGeneralP
      subtotalNeto
      totalImpuestos
      totalGasto
      totalFinal
    }
    sistema {
      subtotalBruto
      subtotalLineaVisual
      totalDescuento
      totalDescuentoP
      totalDescuentoAdicional
      totalDescuentoGeneral
      totalDescuentoAdicionalP
      totalDescuentoGeneralP
      subtotalNeto
      totalImpuestos
      totalGasto
      totalFinal
    }
  }
`

/**
 * Fragmento de campos de articulo
 */
export const ENTRADA_FIELDS_FRAGMENT = gql`
  fragment EntradaFieldsFragment on Entrada {
    _id
    codigo
    numeroEntrada
    sucursal {
      ...facturaSucursalFields
    }
    puntoVenta {
      ...facturaPuntoVentaFields
    }
    codigoCompra
    descripcionMovimiento
    detalle {
      ...articuloOperacionFields
    }
    recepcion {
      codigo
      nota
      montoTotal
      montoTotalBase
      fechaRecepcion
      detalle {
        ...articuloOperacionFields
      }
      workflow {
        ...workflowFields
      }
      state
    }
    pendiente {
      detalle {
        ...articuloOperacionFields
      }
      montoTotal
      montoTotalBase
    }
    moneda {
      _id
      codigo
      descripcion
      sigla
      tipoCambio
      tipoCambioCompra
      activo
      state
      usucre
      usumod
      createdAt
      updatedAt
    }
    tipoCambio
    otrosCostos
    descripcionOtrosCostos
    descuentoAdicional
    fechaDocumento
    fechaContable
    fechaEntrega
    proveedor {
      _id
      codigo
      nombre
      direccion
      ciudad
      contacto
      correo
      telefono
      notas
      state
      usucre
      usumod
      createdAt
      updatedAt
    }
    metodoPago {
      codigoClasificador
      descripcion
    }
    montoTotal
    montoTotalBase
    totalesDetalle {
      ...totalesFields
    }
    totalesPendiente {
      ...totalesFields
    }
    totalesRecepcion {
      ...totalesFields
    }
    detalleExtra
    tipoDocumento
    refNroDocumento
    refDocumento
    adjuntos
    nota
    terminos
    tipo
    state
    usucre
    createdAt
    usumod
    updatedAt
    workflow {
      ...workflowFields
    }
  }
`
export const ENTRADA_FRAGMENT = gql`
  ${articuloOperacionFieldsFragment}
  ${articuloOperacionFullFragment}
  ${facturaPuntoVentaFragment}
  ${sucursalFragment}
  ${puntoVentaFrament}
  ${TOTALES_FIELDS_FRAGMENT}
  ${workflowFragment}
  ${ENTRADA_FIELDS_FRAGMENT}
`
