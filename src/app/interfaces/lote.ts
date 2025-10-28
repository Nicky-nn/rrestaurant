import { EntidadInputProps } from './index.ts'

/**
 * @description Modelo de Lote
 */
export interface LoteBaseProps {
  codigoLote: string
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

export interface LoteProps extends LoteBaseProps {}

export interface LoteInputProps {
  codigoLote: string
  descripcion: string
  entidad: EntidadInputProps
  codigoSucursal: number
  codigoPuntoVenta: number
  sucursal: Sucursal
  atributo1: string
  atributo2: string
  fechaAdmision: Date
  fechaFabricacion: Date
  fechaVencimiento: Date
}
export interface LoteOutputProps {
  descripcion: string
  atributo1: string
  atributo2: string
  fechaAdmision: string
  fechaFabricacion: string
  fechaVencimiento: string
}
interface Sucursal {
  codigo: number
  direccion: string
}
export const LOTE_INITIAL_VALUES: LoteInputProps = {
  codigoLote: '',
  descripcion: '',
  entidad: {
    codigoSucursal: 0,
    codigoPuntoVenta: 0,
  },
  codigoSucursal: 0,
  codigoPuntoVenta: 0,
  sucursal: {
    codigo: 0,
    direccion: '',
  },
  // state: ActionFormProps
  atributo1: '',
  atributo2: '',
  fechaAdmision: new Date(),
  fechaFabricacion: new Date(),
  fechaVencimiento: new Date(),
}
