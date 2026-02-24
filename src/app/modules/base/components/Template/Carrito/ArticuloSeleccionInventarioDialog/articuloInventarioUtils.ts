import { MetodoSeleccionLote } from '../../../../../../base/services/articuloToArticuloOperacionInputService.ts'
import { AlmacenProps } from '../../../../../../interfaces/almacen.ts'
import {
  InventarioDetalleLoteProps,
  InventarioDetalleProps,
} from '../../../../../../interfaces/inventario.ts'
import { LoteSeleccionProps } from '../../LoteSeleccion/LoteSeleccionTypes.ts'
import { AlmacenSeleccionProps } from './ArticuloSeleccionInventarioTypes.ts'

/**
 * Procesa y filtra la lista de almacenes desde la tabla general según la configuración
 * @author isi-template
 */
export const procesarAlmacenesDesdeTabla = (
  almacenes: AlmacenProps[],
  config?: AlmacenSeleccionProps,
): AlmacenProps[] => {
  if (!almacenes || almacenes.length === 0) return []

  let resultado = [...almacenes]

  // Filtrar solo activos
  const soloActivos = config?.soloActivos !== undefined ? config.soloActivos : true
  if (soloActivos) {
    resultado = resultado.filter((alm) => alm.activo)
  }

  // Filtrar por tipos específicos
  if (config?.filtrarPorTipos && config.filtrarPorTipos.length > 0) {
    resultado = resultado.filter((alm) => config.filtrarPorTipos!.includes(alm.tipo))
  }

  // Ordenar por prioridad
  const ordenarPorPrioridad = config?.ordenarPorPrioridad !== undefined ? config.ordenarPorPrioridad : true
  if (ordenarPorPrioridad) {
    resultado = resultado.sort((a, b) => a.prioridad - b.prioridad)
  }

  // Remover el almacen virtual
  const ocultarAlmacenVirtual =
    config?.ocultarAlmacenVirtual !== undefined ? config.ocultarAlmacenVirtual : true
  if (ocultarAlmacenVirtual) {
    resultado = resultado.filter((alm) => alm.prioridad !== 999)
  }

  return resultado
}

/**
 * Procesa y filtra la lista de almacenes desde el inventario del artículo según la configuración
 */
export const procesarAlmacenesDesdeInventario = (
  inventarioDetalle: InventarioDetalleProps[],
  config?: AlmacenSeleccionProps,
): AlmacenProps[] => {
  if (!inventarioDetalle || inventarioDetalle.length === 0) return []

  let resultado = [...inventarioDetalle]

  // Filtrar solo con stock disponible
  if (config?.mostrarSoloConStock) {
    resultado = resultado.filter((inv) => inv.disponible > 0)
  }

  // Filtrar solo activos
  if (config?.soloActivos) {
    resultado = resultado.filter((inv) => inv.almacen.activo)
  }

  // Filtrar por tipos específicos
  if (config?.filtrarPorTipos && config.filtrarPorTipos.length > 0) {
    resultado = resultado.filter((inv) => config.filtrarPorTipos!.includes(inv.almacen.tipo))
  }

  // Ordenar por prioridad del almacén
  if (config?.ordenarPorPrioridad) {
    resultado = resultado.sort((a, b) => a.almacen.prioridad - b.almacen.prioridad)
  } else {
    // Si no se ordena por prioridad, usar el orden definido en inventario
    resultado = resultado.sort((a, b) => a.orden - b.orden)
  }

  // Remover el almacen virtual
  const ocultarAlmacenVirtual =
    config?.ocultarAlmacenVirtual !== undefined ? config.ocultarAlmacenVirtual : true
  if (ocultarAlmacenVirtual) {
    resultado = resultado.filter((alm) => alm.almacen.prioridad !== 999)
  }

  return resultado.map((inv) => inv.almacen)
}

/**
 * Procesa y filtra la lista de lotes desde el inventario según la configuración
 */
export const procesarLotesDesdeInventario = (
  lotes: InventarioDetalleLoteProps[],
  config?: LoteSeleccionProps,
): InventarioDetalleLoteProps[] => {
  if (!lotes || lotes.length === 0) return []

  let resultado = [...lotes]

  // Filtrar solo con stock disponible
  if (config?.mostrarSoloConStock) {
    resultado = resultado.filter((lote) => lote.disponible > 0)
  }

  // Excluir lotes vencidos
  if (config?.excluirVencidos) {
    const hoy = new Date()
    resultado = resultado.filter((lote) => {
      if (!lote.lote.fechaVencimiento) return true
      return new Date(lote.lote.fechaVencimiento) > hoy
    })
  }

  // Ordenar según el metodo de selección
  const metodo = config?.metodoSeleccion || MetodoSeleccionLote.FEFO

  switch (metodo) {
    case MetodoSeleccionLote.FEFO:
      // Ordenar por fecha de vencimiento (FEFO - First Expired, First Out)
      resultado = resultado.sort((a, b) => {
        const fechaA = a.lote.fechaVencimiento
        const fechaB = b.lote.fechaVencimiento

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
        const fechaA = a.lote.fechaFabricacion || a.lote.fechaAdmision || a.lote.createdAt
        const fechaB = b.lote.fechaFabricacion || b.lote.fechaAdmision || b.lote.createdAt

        if (!fechaA && !fechaB) return 0
        if (!fechaA) return 1
        if (!fechaB) return -1

        return new Date(fechaA).getTime() - new Date(fechaB).getTime()
      })
      break

    case MetodoSeleccionLote.MANUAL:
    default:
      // Sin ordenamiento, mantener orden original del inventario
      break
  }

  return resultado
}

/**
 * Obtiene el detalle de inventario para un almacén específico
 */
export const obtenerDetalleInventarioPorAlmacen = (
  inventarioDetalle: InventarioDetalleProps[],
  codigoAlmacen: string | null,
): InventarioDetalleProps | null => {
  if (!codigoAlmacen || !inventarioDetalle || inventarioDetalle.length === 0) {
    return null
  }

  return inventarioDetalle.find((detalle) => detalle.almacen.codigoAlmacen === codigoAlmacen) || null
}

/**
 * Selecciona automáticamente el primer almacén según la configuración
 */
export const seleccionarAlmacenAutomatico = (almacenes: AlmacenProps[]): AlmacenProps | null => {
  if (!almacenes || almacenes.length === 0) return null
  return almacenes[0]
}

/**
 * Selecciona automáticamente el primer lote según la configuración
 */
export const seleccionarLoteAutomatico = (
  lotes: InventarioDetalleLoteProps[],
): InventarioDetalleLoteProps | null => {
  if (!lotes || lotes.length === 0) return null
  return lotes[0]
}

/**
 * Valida si un almacén tiene stock disponible en el inventario
 */
export const almacenTieneStock = (
  inventarioDetalle: InventarioDetalleProps[],
  codigoAlmacen: string,
): boolean => {
  const detalle = obtenerDetalleInventarioPorAlmacen(inventarioDetalle, codigoAlmacen)
  return detalle ? detalle.disponible > 0 : false
}

/**
 * Valida si un lote tiene stock disponible
 */
export const loteTieneStock = (lote: InventarioDetalleLoteProps): boolean => {
  return lote.disponible > 0
}
