import { KeyValueProp } from '../base/interfaces/base.ts'

/**
 * @description Clase de articulos que se pueden registrar
 * @author isi-template
 */
// export type ClaseArticuloProps = 'PRODUCTO' | 'SERVICIO' | 'COMPRA' // Producto, Servicio, Compra
export const apiClaseArticulo = {
  producto: 'PRODUCTO',
  servicio: 'SERVICIO',
  produccion: 'PRODUCCION',
} as const

export type ClaseArticuloProps = (typeof apiClaseArticulo)[keyof typeof apiClaseArticulo]
/**
 * @author isi-template
 */
export const CLASE_ARTICULO_DEFAULTS: KeyValueProp<ClaseArticuloProps>[] = [
  {
    key: 'PRODUCTO',
    value: 'PRODUCTO',
  },
  { key: 'SERVICIO', value: 'SERVICIO' },
  { key: 'PRODUCCION', value: 'PRODUCCION' },
]

export const claseArticuloEnum: ClaseArticuloProps[] = Object.values(apiClaseArticulo)
