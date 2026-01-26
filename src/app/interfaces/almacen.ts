import { SucursalProps } from './sucursal.ts'

/**
 * @description Propiedades de almacen
 * @author isi-template
 */
export interface AlmacenBaseProps {
  _id: string
  codigoAlmacen: string // Codigo almacen
  nombre: string // Nombre de compras Ej. Almacen Principal S10
  ubicacion: string // Ubicación fisica del almacen
  sucursal: SucursalProps // Sucursal al que pertenece el almacen
  state?: string
  usucre?: string
  createdAt?: Date
  usumod?: string
  updatedAt?: Date
}

/**
 * @author isi-template
 */
export interface AlmacenProps extends AlmacenBaseProps {}

/**
 * @author isi-template
 */
export interface AlmacenInputProps {
  codigoAlmacen: string
  nombre: string
  ubicacion: string
  sucursal: SucursalProps | null
  codigoSucursal: SucursalProps | null
  state?: string
}
/**
 * @author isi-template
 */
export interface AlmacenOutputProps {
  nombre: string
  ubicacion: string
  codigoSucursal: number
}
/**
 * @author isi-template
 */
export const ALMACEN_INITIAL_VALUES: AlmacenInputProps = {
  codigoAlmacen: '',
  nombre: '',
  ubicacion: '',
  sucursal: null,
  codigoSucursal: null,
}

/**
 * @description Propiedades de almacen para inventario
 * @author isi-template
 */
export interface AlmacenInventarioProps {
  _id: string
  codigoAlmacen: string // Codigo almacen
  nombre: string // Nombre de compras Ej. Almacen Principal S10
  ubicacion: string // Ubicación fisica del almacen
  stock: number
  comprometido: number
  solicitado: number
  disponible: number
}
