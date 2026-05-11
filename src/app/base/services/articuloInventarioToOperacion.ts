import { AlmacenInventarioProps } from '../../interfaces/almacen.ts'
import { ArticuloProps } from '../../interfaces/articulo.ts'
import { apiGestionArticulo } from '../../interfaces/gestionArticulo.ts'
import { ArticuloInventarioOperacionProps } from '../../interfaces/InventarioOperacion.ts'
import { LoteInventarioProps } from '../../interfaces/lote.ts'

/**
 * Redondeamos un numero a 7 decimales, en caso de no usar isi-formulas
 * @param value
 */
export const invRound = (value: number) => {
  // Usamos una tolerancia un poco más amplia que el EPSILON puro
  // para capturar errores de redondeo acumulados (como el -5.55e-17)
  if (Math.abs(value) < 1e-10) return 0

  return Number(value.toFixed(7))
}

/**
 * Decodificamos el inventario, segun los datos de operacion para entrada, salida.
 * Devuelve NULL si: articuloPrecio son nulos
 * @author isi-template
 * @param articulo
 * @param options
 */
export const articuloInventarioToOperacion = (
  articulo: ArticuloProps,
  options: {
    codigoAlmacen?: string | null
    codigoLote?: string | null
    codigoUnidadMedida: string | null
  },
): ArticuloInventarioOperacionProps | null => {
  if (!articulo) return null
  if (articulo.inventario.length === 0) {
    console.warn('Operación cancelada: El artículo no existe o requiere inventario[0]')
    return null
  }
  const { codigoAlmacen = null, codigoLote = null, codigoUnidadMedida } = options

  /** 1. En caso de no existir código UM, se asume UM base */
  const articuloPrecio = [articulo.articuloPrecioBase, ...articulo.articuloPrecio].find(
    (ap) =>
      ap.articuloUnidadMedida.codigoUnidadMedida ===
      (codigoUnidadMedida || articulo.articuloPrecioBase.articuloUnidadMedida.codigoUnidadMedida),
  )
  if (!articuloPrecio) {
    console.warn('Error: No se ha encontrado equivalencia de precio para la unidad solicitada')
    return null
  }

  // PREVENCIÓN: División por Cero
  if (articuloPrecio.cantidadBase <= 0) {
    console.error(
      `Error crítico: cantidadBase inválida (${articuloPrecio.cantidadBase}) para el artículo ${articulo.codigoArticulo}`,
    )
    return null
  }
  const cantidadBase = articuloPrecio.cantidadBase

  /** 2. Obtenemos almacén */
  let alm = null
  if (codigoAlmacen) {
    alm = articulo.inventario[0].detalle.find((i) => i.almacen.codigoAlmacen === codigoAlmacen)
    if (!alm) {
      console.warn(`Error: Almacén ${codigoAlmacen} no encontrado en el inventario del artículo`)
      return null
    }
  }

  const almacen: AlmacenInventarioProps | null = alm
    ? {
        ...alm.almacen,
        stock: invRound(alm.stock / cantidadBase),
        comprometido: invRound(alm.comprometido / cantidadBase),
        solicitado: invRound(alm.solicitado / cantidadBase),
        disponible: invRound(alm.disponible / cantidadBase),
      }
    : null

  /** 3. Obtención de Lote */
  let lote: LoteInventarioProps | null = null
  if (articulo.gestionArticulo === apiGestionArticulo.LOTE && codigoLote && alm) {
    const lot = alm.lotes.find((i) => i.lote.codigoLote === codigoLote)
    if (lot) {
      lote = {
        ...lot.lote,
        stock: invRound(lot.stock / cantidadBase),
        comprometido: invRound(lot.comprometido / cantidadBase),
        solicitado: invRound(lot.solicitado / cantidadBase),
        disponible: invRound(lot.disponible / cantidadBase),
      }
    }
  }

  return {
    _id: articulo.inventario[0]._id,
    articuloId: articulo._id,
    codigoArticulo: articulo.codigoArticulo,
    nombreArticulo: articulo.nombreArticulo,
    sucursal: articulo.inventario[0].sucursal,
    articuloPrecio,
    articuloPrecioBase: articulo.articuloPrecioBase,
    almacen,
    lote,
    totalStock: invRound(articulo.inventario[0].totalStock / cantidadBase),
    totalComprometido: invRound(articulo.inventario[0].totalComprometido / cantidadBase),
    totalSolicitado: invRound(articulo.inventario[0].totalSolicitado / cantidadBase),
    totalDisponible: invRound(articulo.inventario[0].totalDisponible / cantidadBase),
  }
}
