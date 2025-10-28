/**
 * Homologación de la moneda
 * Codigo debe ser igual al codigo del sin
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
}

/**
 * en operacion no ingresa precio 1, precio 2
 */
export interface MonedaPrecioOperacionProps {
  moneda: MonedaProps
  precioBase: number // Precio base multiplicador por el factor de ajuste
  precio: number
  delivery: number
}

/**
 * Relacion entre moneda y precio
 */
export interface MonedaPrecioProps {
  moneda: MonedaProps
  precioBase: number // Precio base multiplicador por el factor de ajuste
  precio: number
  delivery: number
  precioComparacion?: number | null
  manual: boolean // Si es false, no multiplica factorAjuste * precioBase
}

export interface MonedaPrecioApiInputProps {
  precioBase: number
  precio: number
  delivery: number
  manual: boolean
}
