import { SinTipoPuntoVentaProps } from '../../sin/interfaces/sin.interface'

export interface PuntoVentaProps {
  codigo: number
  descripcion: string
  nombre: string
  tipoPuntoVenta: SinTipoPuntoVentaProps
}
