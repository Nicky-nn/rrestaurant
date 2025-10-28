import { SucursalProps } from './sucursal.ts'

/**
 * @description Propiedades de almacen
 */
export interface AlmacenBaseProps {
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

export interface AlmacenProps extends AlmacenBaseProps {}

export interface AlmacenInputProps {
  codigoAlmacen: string
  nombre: string
  ubicacion: string
  sucursal: SucursalProps | null
  codigoSucursal: SucursalProps | null
  state?: string
}

export interface AlmacenOutputProps {
  nombre: string
  ubicacion: string
  codigoSucursal: number
}

export const ALMACEN_INITIAL_VALUES: AlmacenInputProps = {
  codigoAlmacen: '',
  nombre: '',
  ubicacion: '',
  sucursal: null,
  codigoSucursal: null,
}
