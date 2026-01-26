import { AlmacenInventarioProps } from '../../interfaces/almacen.ts'
import { ArticuloProps } from '../../interfaces/articulo.ts'
import { InventarioOperacionProps } from '../../interfaces/InventarioOperacion.ts'
import { LoteInventarioProps } from '../../interfaces/lote.ts'
import { genRound } from '../../utils/utils.ts'

/**
 * Decodificamos el inventario, segun los datos de operacion para entrada, salida.
 * Devuelve NULL si: articulo, almacen, articuloPrecio son nulos
 * @param articulo
 * @param options
 */
export const articuloToInventarioOperacion = (
  articulo: ArticuloProps,
  options: {
    codigoAlmacen: string | null
    codigoLote: string | null
    codigoUnidadMedida: string | null
  },
): InventarioOperacionProps | null => {
  if (!articulo) return null
  if (articulo.inventario.length === 0) return null
  const { codigoAlmacen, codigoLote, codigoUnidadMedida } = options

  if (!codigoUnidadMedida || !codigoAlmacen) return null

  const articuloPrecioBase = articulo.articuloPrecioBase
  let articuloPrecio = null
  if (articuloPrecioBase.articuloUnidadMedida.codigoUnidadMedida === codigoUnidadMedida) {
    articuloPrecio = articuloPrecioBase
  } else {
    const ap = articulo.articuloPrecio.find(
      (aa) => aa.articuloUnidadMedida.codigoUnidadMedida === codigoUnidadMedida,
    )
    if (ap) {
      articuloPrecio = ap
    }
  }

  if (!articuloPrecio) return null

  const alm = articulo.inventario[0].detalle.find(
    (i) => i.almacen.codigoAlmacen === codigoAlmacen,
  )
  if (!alm) return null

  const almacen: AlmacenInventarioProps = {
    _id: alm.almacen._id,
    codigoAlmacen: alm.almacen.codigoAlmacen,
    nombre: alm.almacen.nombre,
    ubicacion: alm.almacen.ubicacion,
    stock: genRound(alm.stock / articuloPrecio.cantidadBase),
    comprometido: genRound(alm.comprometido / articuloPrecio.cantidadBase),
    solicitado: genRound(alm.solicitado / articuloPrecio.cantidadBase),
    disponible: genRound(alm.disponible / articuloPrecio.cantidadBase),
  }

  let lote: LoteInventarioProps | null = null
  if (articulo.gestionArticulo === 'LOTE') {
    if (codigoLote) {
      // Priorizamos la busca de lote dentro del almacen
      const lot = alm.lotes.find((i) => i.lote.codigoLote === codigoLote)
      if (lot) {
        lote = {
          _id: lot.lote._id,
          codigoLote: lot.lote.codigoLote,
          descripcion: lot.lote.descripcion,
          fechaAdmision: lot.lote.fechaAdmision,
          fechaFabricacion: lot.lote.fechaFabricacion,
          fechaVencimiento: lot.lote.fechaVencimiento,
          atributo1: lot.lote.atributo1,
          atributo2: lot.lote.atributo2,
          stock: genRound(lot.stock / articuloPrecio.cantidadBase),
          comprometido: genRound(lot.comprometido / articuloPrecio.cantidadBase),
          solicitado: genRound(lot.solicitado / articuloPrecio.cantidadBase),
          disponible: genRound(lot.disponible / articuloPrecio.cantidadBase),
        }
      }
    }
  }

  let stock = almacen.stock
  let comprometido = almacen.comprometido
  let solicitado = almacen.solicitado
  let disponible = almacen.disponible
  if (codigoLote) {
    stock = 0
    comprometido = 0
    solicitado = 0
    disponible = 0
    if (lote) {
      stock = lote.stock
      comprometido = lote.comprometido
      solicitado = lote.solicitado
      disponible = lote.disponible
    }
  }

  return {
    _id: articulo.inventario[0]._id,
    codigoArticulo: articulo.codigoArticulo,
    nombreArticulo: articulo.nombreArticulo,
    sucursal: articulo.inventario[0].sucursal,
    articuloPrecio,
    articuloPrecioBase,
    almacen,
    lote,
    totalStock: genRound(articulo.inventario[0].totalStock / articuloPrecio.cantidadBase),
    totalComprometido: genRound(
      articulo.inventario[0].totalComprometido / articuloPrecio.cantidadBase,
    ),
    totalSolicitado: genRound(
      articulo.inventario[0].totalSolicitado / articuloPrecio.cantidadBase,
    ),
    totalDisponible: genRound(
      articulo.inventario[0].totalDisponible / articuloPrecio.cantidadBase,
    ),
    stock,
    comprometido,
    solicitado,
    disponible,
  }
}
