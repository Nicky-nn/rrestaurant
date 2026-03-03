import dayjs, { Dayjs } from 'dayjs'

import { ArticuloProps } from './articulo.ts'

/**
 * @description Modelo de Lote
 * @author isi-template
 */
export interface LoteBaseProps {
  _id: string
  codigoLote: string
  codigoArticulo: string
  descripcion: string
  atributo1: string
  atributo2: string
  fechaAdmision: string
  fechaFabricacion: string
  fechaVencimiento: string
  state?: string
  usucre?: string
  createdAt?: Date
  usumod?: string
  updatedAt?: string
}
/**
 * @author isi-template
 */

export interface LoteProps extends LoteBaseProps {}
/**
 * @description Modelo de Lote para registro global, usado en carrito de articulos
 * @author isi-template
 */
export interface LoteGlobalInputProps {
  codigoLote: string
  codigoArticulo: string
  descripcion: string
  fechaAdmision: Date
  fechaFabricacion: Dayjs
  fechaVencimiento: Dayjs
  atributo1: string
  atributo2: string
}
/**
 * @author isi-template
 */
export interface LoteInputProps {
  codigoLote: string
  articulo: ArticuloProps | null
  descripcion: string
  fechaAdmision: Date
  fechaFabricacion: Dayjs
  fechaVencimiento: Dayjs
  atributo1: string
  atributo2: string
}

/**
 * @author isi-template 2025.3
 */
export interface LoteApiInputProps {
  descripcion: string
  atributo1: string
  atributo2: string
  fechaAdmision: string //  DateDMYHHMMSS
  fechaFabricacion: string // DateDMY
  fechaVencimiento: string //DateDMY
}

/**
 * @author isi-template
 * @deprecated reemplaza por LoteApiInputProps
 */
export interface LoteOutputProps {
  descripcion: string
  atributo1: string
  atributo2: string
  fechaAdmision: string
  fechaFabricacion: string
  fechaVencimiento: string
}
/**
 * @author isi-template
 */
interface Sucursal {
  codigo: number
  direccion: string
}
/**
 * @author isi-template
 */
export const LOTE_INITIAL_VALUES: LoteGlobalInputProps = {
  codigoLote: '',
  codigoArticulo: '',
  descripcion: '',
  atributo1: '',
  atributo2: '',
  fechaAdmision: new Date(),
  fechaFabricacion: dayjs(),
  fechaVencimiento: dayjs(),
}

/**
 * @author isi-template
 */
export interface LoteInventarioProps {
  _id: string
  codigoLote: string
  descripcion: string
  fechaAdmision: string
  fechaFabricacion: string
  fechaVencimiento: string
  atributo1: string
  atributo2: string
  stock: number
  comprometido: number
  solicitado: number
  disponible: number
}
