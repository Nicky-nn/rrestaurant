// =======================================
// Interfaces

import { PageInfoProps } from '../../../interfaces'
import { PuntoVentaProps } from '../../../interfaces/puntoVenta'
import { SucursalProps } from '../../../interfaces/sucursal'

// =======================================
export interface AperturaCajaObservacionesProps {
  fecha: string
  accion: string
  usuario: string
  observacion: string
}

export interface MetodoPagoVenta {
  metodoPago: {
    codigoClasificador: number
    descripcion: string
  }
  monto: number
  montoUsuario: number
}

// Fragmento: TurnoCajasFields
export interface TurnoCajaProps {
  _id: string
  createdAt?: string
  horaCierre: string
  horaInicio: string
  nombre: string
  state?: string
  updatedAt?: string
  usucre?: string
  usemod?: string
}

// Fragmento: RetiroFields
export interface RetiroProps {
  motivo: string
  monto: number
  beneficiario: string
  usuario: string
  aprobador: string
  comprobante: {
    tipo: string
    numero: string
  }
  fecha: string
  representacionGrafica: ArqueoCajaRepresentacionGraficaProps
}

// Fragmento: RetiroFields
export interface IngresoProps {
  motivo: string
  monto: number
  beneficiario: string
  usuario: string
  aprobador: string
  fecha: string
}

export interface ArqueoCajaProps {
  _id: string
  cajaId: string
  cajaCodigo: string
  fecha: string
  montoInicial: number
  montoFinal: number
  nroVentas: number
  totalVentas: number
  totalVentasEfectivo: number
  totalRetiros: number
  totalIngresos: number
  montoTeorico: number
  montoReal: number
  diferencia: number
  state: string
  modulo: string
  supervisor: string
  sucursal: SucursalProps
  puntoVenta: PuntoVentaProps
  moneda: { codigo: number; descripcion: string; sigla: string }
  usuario: [string]
  responsables: string[]
  usuariosCaja?: [string]
  usuarioApertura: string
  usuarioCierre: string
  createdAt: string
  updatedAt: string
  fechaApertura: string
  fechaCierre: string
  metodoPagoVenta: MetodoPagoVenta[]
  retiros: RetiroProps[]
  ingresos: IngresoProps[]
  turnoCaja?: TurnoCajaProps
  observaciones: AperturaCajaObservacionesProps[]
  representacionGrafica: ArqueoCajaRepresentacionGraficaProps
}
export interface ArqueoCajaRepresentacionGraficaProps {
  pdf: string
  rollo: string
}

export interface ApiArqueoCajaResponse {
  docs: Array<ArqueoCajaProps>
  pageInfo?: PageInfoProps
}

export interface AperturaCajaActivo {
  _id: string
  cajaId: string
  cajaCodigo: string
  modulo: string
  representacionGrafica?: { rollo?: string }
  state: string
  supervisor: [string]
  responsables: string[]
  moneda?: { codigo: number; descripcion: string; sigla: string }
  turnoCaja?: { _id: string; nombre: string; horaInicio: string; horaCierre: string }
  usuario: [string]
  usuariosCaja: [string]
  usuarioApertura: string
}
