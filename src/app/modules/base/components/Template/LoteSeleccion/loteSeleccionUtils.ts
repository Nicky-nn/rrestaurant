import dayjs from 'dayjs'

import { MetodoSeleccionLote } from '../../../../../base/services/articuloToArticuloOperacionInputService.ts'
import { LoteProps } from '../../../../../interfaces/lote.ts'
import { parseStringToDate } from '../../../../../utils/dayjsHelper.ts'

/**
 * Valida si un lote está vencido
 */
export const validarLoteVencido = (fechaVencimiento: string | null): boolean => {
  if (!fechaVencimiento) return false
  const fven = parseStringToDate(fechaVencimiento)
  if (!fven) {
    console.error('fecha vencimiento es invalid date')
    return false
  }
  return dayjs(fven).endOf('day').unix() > dayjs(new Date()).endOf('day').unix()
}

/**
 * Procesa y filtra la lista de lotes desde API según la configuración
 */
export const procesarLotesDesdeAPI = (
  lotes: LoteProps[],
  metodoSeleccion?: MetodoSeleccionLote,
  excluirVencidos?: boolean,
): LoteProps[] => {
  if (!lotes || lotes.length === 0) return []

  let resultado = [...lotes]

  // Excluir lotes vencidos
  if (excluirVencidos) {
    const hoy = new Date()
    resultado = resultado.filter((lote) => {
      if (!lote.fechaVencimiento) return true
      const fven = parseStringToDate(lote.fechaVencimiento)
      if (!fven) {
        console.error('fecha vencimiento es invalid date')
        return true
      }
      return dayjs(fven).endOf('day').unix() > dayjs(hoy).endOf('day').unix()
    })
  }

  // Ordenar según el metodo de selección
  const metodo = metodoSeleccion || MetodoSeleccionLote.MANUAL

  switch (metodo) {
    case MetodoSeleccionLote.FEFO:
      // Ordenar por fecha de vencimiento (FEFO - First Expired, First Out)
      resultado = resultado.sort((a, b) => {
        const fechaA = a.fechaVencimiento
        const fechaB = b.fechaVencimiento

        // Lotes sin fecha de vencimiento van al final
        if (!fechaA && !fechaB) return 0
        if (!fechaA) return 1
        if (!fechaB) return -1

        return new Date(fechaA).getTime() - new Date(fechaB).getTime()
      })
      break

    case MetodoSeleccionLote.FIFO:
      // Ordenar por fecha de fabricación/registro (FIFO - First In, First Out)
      resultado = resultado.sort((a, b) => {
        const fechaA = a.fechaFabricacion || a.fechaAdmision || a.createdAt
        const fechaB = b.fechaFabricacion || b.fechaAdmision || b.createdAt

        if (!fechaA && !fechaB) return 0
        if (!fechaA) return 1
        if (!fechaB) return -1

        return new Date(fechaA).getTime() - new Date(fechaB).getTime()
      })
      break

    case MetodoSeleccionLote.MANUAL:
    default:
      // Sin ordenamiento, mantener orden original
      break
  }
  return resultado
}

/**
 * Obtiene el estado de vencimiento de un lote
 */
export const obtenerEstadoVencimiento = (
  fechaVencimiento: string | null,
  diasAlerta: number = 30,
): 'expired' | 'warning' | 'healthy' => {
  if (!fechaVencimiento) return 'healthy'

  const hoy = new Date()
  const fechaVenc = new Date(fechaVencimiento)
  const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

  if (diasRestantes <= 0) return 'expired'
  if (diasRestantes <= diasAlerta) return 'warning'
  return 'healthy'
}
