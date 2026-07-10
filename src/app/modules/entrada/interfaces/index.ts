import dayjs, { Dayjs } from 'dayjs'

import { KeyValueProp, KeyValuePropV2 } from '../../../base/interfaces/base'
import { ArticuloOperacionProps } from '../../../interfaces/articulo.ts'
import {
  ArticuloOperacionApiInputProps,
  ArticuloOperacionInputProps,
} from '../../../interfaces/articuloOperacion.ts'
import { KardexPeriodoProps } from '../../../interfaces/kardexPeriodo.ts'
import { MetodoPagoProps } from '../../../interfaces/metodoPago.ts'
import { MonedaProps } from '../../../interfaces/monedaPrecio.ts'
import { ProveedorProps } from '../../../interfaces/proveedorOperacion.ts'
import { PuntoVentaProps } from '../../../interfaces/puntoVenta'
import { SinTipoMetodoPagoProps } from '../../../interfaces/sin.interface'
import { SucursalProps } from '../../../interfaces/sucursal'
import { WorkflowProps } from '../../../interfaces/workflow.ts'
import { TipoDocumentoProp } from '../../../interfaces/tipoDocumento.ts'

/**
 * @description Tabla principal del articulo
 */
export interface EntradaProps {
  _id: string
  adjuntos: string[] // path de urls de archivos adjuntos
  codigo: string
  codigoCompra: string // Código de compra relacionado
  descripcionMovimiento: string // Descripcion del movimiento que se realiza en la entrada
  descripcionOtrosCostos: string
  numeroEntrada: number
  sucursal: SucursalProps
  puntoVenta: PuntoVentaProps
  kardexPeriodo: KardexPeriodoProps // Descripcion con tags html del producto
  detalle: ArticuloOperacionProps[] // Detalle de articulos que se ingresan al inventario Kardex
  recepcion: RecepcionProp[]
  pendiente: {
    detalle: ArticuloOperacionProps[]
    montoTotal: number
    montoTotalBase: number
  }[]
  moneda: MonedaProps
  tipoCambio: number
  otrosCostos: number
  descuentoAdicional: number
  fechaDocumento: string
  fechaContable: string
  fechaEntrega: string
  proveedor: ProveedorProps
  metodoPago: SinTipoMetodoPagoProps
  montoTotal: number
  montoTotalBase: number
  detalleExtra: string
  tipoDocumento: 'FACTURA' | 'NOTA_VENTA' | 'NOTA_COMPRA'
  refNroDocumento: string // referencia al nro de factura, nota, compra, etc
  refDocumento: string // referencia a una factura de venta, CUF, compra, etc
  nota: string // Nota de entrada, puede ser por transporte de:
  terminos: string // teminos de la entrega
  workflow: WorkflowProps[]
  state?: string
  usucre?: string
  createdAt?: string
  usumod?: string
  updatedAt?: string
}

/**
 * @description Datos de entrada para Entrada input
 */
export interface EntradaPorCajaInputProp {
  codigo: string
  moneda: MonedaProps | null
  tipoCambio: number
  metodoPago: MetodoPagoProps | null
  fechaDocumento: Dayjs
  descripcionMovimiento: string
  descripcionOtrosCostos: string | null
  descuentoAdicional: number
  detalle: ArticuloOperacionInputProps[]
  detalleExtra: string | null
  otrosCostos: number
  tipoDocumento: KeyValueProp<TipoDocumentoProp> | null
  responsable: KeyValuePropV2<string, string> | null
}

export interface EntradaRecepcionDetalleInputProp extends ArticuloOperacionInputProps {
  cantidadOriginal: number
}

// Datos de entrada para recepcion de articulos
export interface EntradaRecepcionInputProp {
  fechaRecepcion: Dayjs
  nota: string | null
  detalle: EntradaRecepcionDetalleInputProp[]
}

export const ENTRADA_RECEPCION_DEFAULT: EntradaRecepcionInputProp = {
  fechaRecepcion: dayjs(new Date()),
  nota: null,
  detalle: [],
}

export const ENTRADA_POR_CAJA_DEFAULT: EntradaPorCajaInputProp = {
  codigo: '',
  moneda: null,
  tipoCambio: 0,
  metodoPago: null,
  fechaDocumento: dayjs(),
  descripcionMovimiento: '',
  descripcionOtrosCostos: '',
  descuentoAdicional: 0,
  detalle: [],
  detalleExtra: '',
  otrosCostos: 0,
  tipoDocumento: null,
  responsable: null,
}

export interface RecepcionProp {
  codigo: string
  nota: string | null
  montoTotal: number
  state: string
  montoTotalBase: number
  fechaRecepcion: string
  detalle: ArticuloOperacionProps[]
  workflow: WorkflowProps[]
}

/** Transformacion de los datos de entrada de UX a consumo api */
export interface EntradaPorCajaApiInputProps {
  cajaInput: {
    aprobador: string
    /** "REST" | "POS" | "CREDITO" */
    tipo: string
  }
  entradaInput: {
    codigoMetodoPago: number | null
    codigoMoneda: number
    codigoProveedor: string | null
    descripcionMovimiento: string
    descripcionOtrosCostos: string | null
    descuentoAdicional: number
    otrosCostos: number
    tipoCambio: number
    /** 'FACTURA' | 'NOTA_VENTA' | 'NOTA_COMPRA' */
    tipoDocumento: string
    montoTotal: number
  }
  detalle: ArticuloOperacionApiInputProps[]
}
