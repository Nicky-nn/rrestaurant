import { ActionFormProps } from './index'
import { SinCufdProps, SinCuisProps, SinTipoPuntoVentaProps } from './sin.interface'
import { SucursalProps } from './sucursal'

/**
 * @author isi-template
 */
export interface PuntoVentaProps {
  _id: string
  codigo: number
  cufd: SinCufdProps
  cuis: SinCuisProps
  descripcion: string
  nombre: string
  oldCufd: SinCufdProps
  sucursal: SucursalProps
  timeOut: number
  tipoPuntoVenta: SinTipoPuntoVentaProps
  state: string
  usucre: string
  usumod: string
  createdAt: string
  updatedAt: string
}

/**
 * @author isi-template
 */
export interface PuntoVentaInputProps {
  codigo?: number
  sucursal: SucursalProps | null
  tipoPuntoVenta: SinTipoPuntoVentaProps | null
  descripcion: string
  nombrePuntoVenta: string
  action: ActionFormProps
}

/**
 * @author isi-template
 */
export interface PuntoVentaInputApiProps {
  codigoSucursal?: number
  codigoTipoPuntoVenta: number
  descripcion: string
  nombrePuntoVenta: string
}
