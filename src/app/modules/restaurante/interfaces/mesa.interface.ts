import { RestPedido } from '../types'

/**
 * Tipos de pedido disponibles
 */
export const TIPO_PEDIDO = {
  DELIVERY: 'DELIVERY',
  LLEVAR: 'LLEVAR',
  SALON: 'SALON',
} as const

export type TipoPedido = (typeof TIPO_PEDIDO)[keyof typeof TIPO_PEDIDO]

/**
 * Estados de una mesa en la UI
 */
export const ESTADO_MESA = {
  LIBRE: 'libre',
  OCUPADO: 'ocupado',
  OCUPADO_OTRO: 'ocupadoOtro',
} as const

export type EstadoMesa = (typeof ESTADO_MESA)[keyof typeof ESTADO_MESA]

/**
 * Interface para una mesa en la UI (wrapper simple de RestPedido)
 */
export interface MesaUI {
  _id: string
  value: string // Número de mesa como string
  label: string // "Mesa X"
  estado: EstadoMesa
  // Datos completos del pedido (si existe) - usar el tipo generado
  pedido?: RestPedido
  // Usuario que ocupa la mesa (si es otro usuario)
  usuarioOcupante?: string
}

export interface OpcionesParaLlevar {
  cliente: any | null
  horaRecojo: string
  solicitarUtensilios: boolean
  // Delivery
  metodoDelivery?: 'PROPIO' | 'PEDIDOS_YA'
  codigoOrdenApp?: string
  nombreRepartidor?: string
}
