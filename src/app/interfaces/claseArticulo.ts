import { KeyValueProp } from '../base/interfaces/base.ts'

/**
 * @description Clase de articulos que se pueden registrar
 */
export type ClaseArticuloProps = 'PRODUCTO' | 'SERVICIO' | 'COMPRA' // Producto, Servicio, Compra
export const apiClaseArticulo: { [Key in ClaseArticuloProps]: ClaseArticuloProps } = {
  PRODUCTO: 'PRODUCTO',
  SERVICIO: 'SERVICIO',
  COMPRA: 'COMPRA',
}

export const CLASE_ARTICULO_DEFAULTS: KeyValueProp<ClaseArticuloProps>[] = [
  {
    key: 'PRODUCTO',
    value: 'PRODUCTO',
  },
  { key: 'SERVICIO', value: 'SERVICIO' },
]
