import { SucursalProps } from './sucursal.ts'

export type AlmacenTipoListadoProps = {
  tipo: string
  prioridad: number
}
/**
 * // 1:DESPACHO, 2:REPOSICION, 3:PRODUCCION, 50:NO_VENTA, 90:BLOQUEADO, 99:EXPIRADO, 999:VIRTUAL
 * para crear selects
 * @author isi-template
 */
export const ALMACEN_TIPO_LISTADO: AlmacenTipoListadoProps[] = [
  { tipo: 'DESPACHO', prioridad: 1 },
  { tipo: 'REPOSICION', prioridad: 2 },
  { tipo: 'PRODUCCION', prioridad: 3 },
  { tipo: 'NO_VENTA', prioridad: 50 },
  { tipo: 'BLOQUEADO', prioridad: 90 },
  { tipo: 'EXPIRADO', prioridad: 99 },
]
// { tipo: 'VIRTUAL', prioridad: 999 }, // No se puede usar en inventario

/**
 * para busqueda rapida por prioridad
 * @author isi-template
 */
export const apiAlmacenPrioridad = {
  despacho: 1,
  reposicion: 2,
  produccion: 3,
  noVenta: 50,
  bloqueado: 90,
  expirado: 99,
  virtual: 999,
} as const

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
  tipo: string // - 1:DESPACHO, 2:REPOSICION, 3:PRODUCCION, 50:NO_VENTA, 90:BLOQUEADO, 99:EXPIRADO, 999:VIRTUAL
  prioridad: number // - 1:DESPACHO, 2:REPOSICION, 3:PRODUCCION, 50:NO_VENTA, 90:BLOQUEADO, 99:EXPIRADO, 999:VIRTUAL
  activo: boolean // SI ESTA ACTIVO
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
  tipo: AlmacenTipoListadoProps
  activo: boolean
}

/**
 * @author isi-template
 */
export interface AlmacenApiInputProps {
  nombre: string
  ubicacion: string
  codigoSucursal: number
  tipo: string
  prioridad: number
  activo: boolean
}
/**
 * @author isi-template
 */
export const ALMACEN_INITIAL_VALUES: AlmacenInputProps = {
  codigoAlmacen: '',
  nombre: '',
  ubicacion: '',
  sucursal: null,
  tipo: ALMACEN_TIPO_LISTADO[0],
  activo: true,
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
