import { getUnixTime } from 'date-fns'

import { AlmacenProps, apiAlmacenPrioridad } from '../../interfaces/almacen.ts'
import { InventarioDetalleProps } from '../../interfaces/inventario.ts'
import { LoteProps } from '../../interfaces/lote.ts'
import { dateDMYToDate } from '../../utils/dayjsHelper.ts'
import { MetodoSeleccionLote } from './articuloToArticuloOperacionInputService.ts'

interface LoteConAlmacen {
  lote: LoteProps
  almacen: AlmacenProps
  fechaVencimiento: Date
  fechaFabricacion?: Date
  stock: number // Stock o disponible del lote
}

/**
 * Filtra los detalles de inventario excluyendo almacenes inactivos
 * Solo retorna detalles donde almacen.activo !== false
 */
const filtrarAlmacenesActivos = (detalles: InventarioDetalleProps[]): InventarioDetalleProps[] => {
  return detalles.filter((detalle) => detalle.almacen.activo !== false)
}

/**
 * Filtra los detalles de inventario por stock disponible
 * Solo retorna detalles donde stock > 0
 */
const filtrarAlmacenesConStock = (detalles: InventarioDetalleProps[]): InventarioDetalleProps[] => {
  return detalles.filter((detalle) => detalle.disponible > 0)
}

/**
 * Ordena los detalles de inventario por prioridad de almacén
 * Prioriza: despacho (1) -> otros (2-998) -> virtual (999)
 * IMPORTANTE: Solo debe recibir detalles de almacenes activos
 */
const ordenarDetallesPorPrioridad = (detalles: InventarioDetalleProps[]): InventarioDetalleProps[] => {
  return [...detalles].sort((a, b) => {
    const prioridadA = a.almacen.prioridad ?? 999
    const prioridadB = b.almacen.prioridad ?? 999

    // Primero por prioridad de almacén
    if (prioridadA !== prioridadB) {
      return prioridadA - prioridadB
    }

    // Si tienen la misma prioridad, ordenar por orden
    return a.orden - b.orden
  })
}

/**
 * Filtra y recolecta todos los lotes disponibles (no vencidos) con su almacén asociado
 * @param detalles - Detalles de inventario
 * @param filtrarPorStock - Si es true, solo incluye lotes con stock > 0
 */
const recolectarLotesDisponibles = (
  detalles: InventarioDetalleProps[],
  filtrarPorStock: boolean = false,
): LoteConAlmacen[] => {
  const ahora = getUnixTime(new Date())
  const lotesDisponibles: LoteConAlmacen[] = []

  for (const detalle of detalles) {
    for (const inventarioLote of detalle.lotes) {
      const fechaVencimiento = dateDMYToDate(inventarioLote.lote.fechaVencimiento)
      if (!fechaVencimiento) continue

      // Añadir un día a la fecha de vencimiento para incluir el día completo
      const fechaVencimientoFinal = fechaVencimiento.add(1, 'day')
      const unixVencimiento = getUnixTime(fechaVencimientoFinal.toDate())

      // Solo incluir lotes que no han vencido
      if (unixVencimiento >= ahora) {
        // Filtrar por stock si se requiere
        if (filtrarPorStock && inventarioLote.disponible <= 0) {
          continue
        }

        const fechaFabricacion = inventarioLote.lote.fechaFabricacion
          ? dateDMYToDate(inventarioLote.lote.fechaFabricacion)?.toDate()
          : undefined

        lotesDisponibles.push({
          lote: inventarioLote.lote,
          almacen: detalle.almacen,
          fechaVencimiento: fechaVencimientoFinal.toDate(),
          fechaFabricacion,
          stock: inventarioLote.disponible,
        })
      }
    }
  }

  return lotesDisponibles
}

/**
 * Busca un lote específico por código
 */
const buscarLotePorCodigo = (
  detalles: InventarioDetalleProps[],
  codigoLote: string,
): { lote: LoteProps; almacen: AlmacenProps } | null => {
  for (const detalle of detalles) {
    const loteEncontrado = detalle.lotes.find((l) => l.lote.codigoLote === codigoLote)
    if (loteEncontrado) {
      return {
        lote: loteEncontrado.lote,
        almacen: detalle.almacen,
      }
    }
  }
  return null
}

/**
 * Selecciona el lote óptimo según el metodo especificado
 */
const seleccionarLoteOptimo = (
  lotes: LoteConAlmacen[],
  metodo: MetodoSeleccionLote,
): LoteConAlmacen | null => {
  if (lotes.length === 0) return null

  switch (metodo) {
    case MetodoSeleccionLote.FEFO: {
      // Ordenar por fecha de vencimiento ascendente (más próximo a vencer primero)
      const lotesOrdenados = [...lotes].sort((a, b) => {
        return getUnixTime(a.fechaVencimiento) - getUnixTime(b.fechaVencimiento)
      })
      return lotesOrdenados[0]
    }

    case MetodoSeleccionLote.FIFO: {
      // Ordenar por fecha de fabricación ascendente (más antiguo primero)
      const lotesConFabricacion = lotes.filter((l) => l.fechaFabricacion)
      if (lotesConFabricacion.length === 0) {
        // Si no hay fechas de fabricación, usar FEFO como fallback
        return seleccionarLoteOptimo(lotes, MetodoSeleccionLote.FEFO)
      }

      const lotesOrdenados = [...lotesConFabricacion].sort((a, b) => {
        return getUnixTime(a.fechaFabricacion!) - getUnixTime(b.fechaFabricacion!)
      })
      return lotesOrdenados[0]
    }

    default:
      return null
  }
}

/**
 * Selecciona el almacén apropiado basado en las opciones
 */
const seleccionarAlmacen = (
  detalles: InventarioDetalleProps[],
  options: {
    autoAlmacen: boolean
    codigoAlmacen?: string | null
  },
): AlmacenProps | null => {
  if (!options.autoAlmacen) return null
  if (detalles.length === 0) return null

  const detallesOrdenados = ordenarDetallesPorPrioridad(detalles)

  // Si se especificó un almacén, buscarlo
  if (options.codigoAlmacen) {
    const detalleEspecifico = detallesOrdenados.find((d) => d.codigoAlmacen === options.codigoAlmacen)
    if (detalleEspecifico) {
      return detalleEspecifico.almacen
    }
  }

  // Buscar el primer almacén que no sea virtual
  const almacenNoVirtual = detallesOrdenados.find((d) => d.almacen.prioridad !== apiAlmacenPrioridad.virtual)

  return almacenNoVirtual?.almacen ?? null
}

/**
 * Procesa la selección de lote y almacén
 */
export const procesarLoteYAlmacen = (
  detalles: InventarioDetalleProps[],
  options: {
    autoLote: boolean
    codigoLote?: string | null
    metodoSeleccionLote: MetodoSeleccionLote
    autoAlmacen: boolean
    codigoAlmacen?: string | null
    mostrarAlmacenConStock: boolean
    mostrarLoteConStock: boolean
  },
): { lote: LoteProps | null; almacen: AlmacenProps | null } => {
  let lote: LoteProps | null = null
  let almacen: AlmacenProps | null = null

  if (detalles.length === 0) {
    return { lote: null, almacen: null }
  }

  // PASO 1: Filtrar almacenes activos (siempre)
  let detallesFiltrados = filtrarAlmacenesActivos(detalles)
  if (detallesFiltrados.length === 0) {
    return { lote: null, almacen: null }
  }

  // PASO 2: Filtrar almacenes con stock si se requiere
  if (options.mostrarAlmacenConStock) {
    detallesFiltrados = filtrarAlmacenesConStock(detallesFiltrados)
    if (detallesFiltrados.length === 0) {
      return { lote: null, almacen: null }
    }
  }

  // PASO 3: Ordenar por prioridad
  const detallesOrdenados = ordenarDetallesPorPrioridad(detallesFiltrados)

  // Procesar lote si es necesario
  if (options.autoLote) {
    if (options.codigoLote) {
      // Búsqueda de lote específico
      const resultado = buscarLotePorCodigo(detallesOrdenados, options.codigoLote)
      if (resultado) {
        // Verificar stock del lote si se requiere
        if (options.mostrarLoteConStock) {
          const loteEnDetalle = resultado.almacen
          const detalleAlmacen = detallesOrdenados.find((d) => d.almacen._id === loteEnDetalle._id)
          const loteConStock = detalleAlmacen?.lotes.find(
            (l) => l.lote.codigoLote === options.codigoLote && l.disponible > 0,
          )
          if (loteConStock) {
            lote = resultado.lote
            almacen = resultado.almacen
          }
        } else {
          lote = resultado.lote
          almacen = resultado.almacen
        }
      }
    } else {
      // Selección automática de lote
      const lotesDisponibles = recolectarLotesDisponibles(detallesOrdenados, options.mostrarLoteConStock)
      const loteOptimo = seleccionarLoteOptimo(lotesDisponibles, options.metodoSeleccionLote)

      if (loteOptimo) {
        lote = loteOptimo.lote
        almacen = loteOptimo.almacen
      }
    }
  }

  // Si no se asignó almacén mediante lote, seleccionar uno
  if (!almacen) {
    almacen = seleccionarAlmacen(detallesOrdenados, {
      autoAlmacen: options.autoAlmacen,
      codigoAlmacen: options.codigoAlmacen,
    })
  }

  return { lote, almacen }
}
