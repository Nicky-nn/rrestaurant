import { SinTipoMonedaProps } from './sin.interface.ts'

/**
 * Homologación de la moneda
 * Codigo debe ser igual al codigo del sin
 * @author isi-template
 */
export interface MonedaProps {
  _id: string
  codigo: number // codigo del sin
  descripcion: string
  sigla: string
  tipoCambio: number
  tipoCambioCompra?: number
  activo: 0 | 1
  usucre?: string
  usumod?: string
  createdAt?: string
  updatedAt?: string
  state?: string
}

/**
 * Entrada de datos de la moneda
 * @author isi-template
 */
export interface MonedaInputProps {
  sinMoneda: SinTipoMonedaProps | null // codigo del sin
  sigla: string
  descripcion: string
  tipoCambio: number
  tipoCambioCompra?: number
}

/**
 * Default de la moneda
 * @author isi-template
 */
export const MONEDA_DEFAULT = {
  sinMoneda: null,
  sigla: '',
  descripcion: '',
  tipoCambio: 0,
  tipoCambioCompra: 0,
}

/**
 * @author isi-template 2025.3
 */
export interface MonedaApiInputProps {
  codigoSinMoneda: number
  sigla: string
  descripcion: string
  tipoCambio: number
  tipoCambioCompra?: number | null
}

/**
 * en operacion no ingresa precio 1, precio 2
 * @author isi-template
 * @deprecated se elimina definitivamente
 */
export interface MonedaPrecioOperacionProps {
  moneda: MonedaProps
  precioBase: number // Precio base multiplicador por el factor de ajuste
  precio: number
  delivery: number
}

/**
 * Relacion entre moneda y precio
 * @author isi-template
 */
export interface MonedaPrecioProps {
  moneda: MonedaProps
  /** Costo báse */
  precioBase: number // Precio base multiplicador por el factor de ajuste
  precio: number
  delivery: number
  precioComparacion?: number | null
  manual: boolean // Si es false, no multiplica factorAjuste * precioBase
}
/**
 * @author isi-template
 */
export interface MonedaPrecioApiInputProps {
  precioBase: number
  precio: number
  delivery: number
  manual: boolean
}
