import { getUnixTime } from 'date-fns'

import { AlmacenProps } from '../../interfaces/almacen.ts'
import { ArticuloProps } from '../../interfaces/articulo.ts'
import { ArticuloOperacionInputProps } from '../../interfaces/articuloOperacion.ts'
import { LoteProps } from '../../interfaces/lote.ts'
import { dateDMYToDate } from '../../utils/dayjsHelper.ts'
import { genRandomString, genReplaceEmpty } from '../../utils/helper.ts'
import { MonedaParamsProps } from '../interfaces/base.ts'
import { transformarArticuloPrecioService } from './transformarArticuloPrecioService.ts'

/**
 * Función para transformar un articulo en un input de operacion
 * Si el articulo esta gestionado por lotes, se obtiene el lote mas cercano a vencer, siempre y cuando options.autoLote sea true.
 * Si se envia codigoLote, se busca el lote con ese codigo.
 * @param articulo
 * @param monedaVenta
 * @param options solo cuando existe el inventario asociado
 */
export const articuloToArticuloOperacionInputService = (
  articulo: ArticuloProps,
  monedaVenta: MonedaParamsProps,
  options?: {
    // Asocia automaticamente el almacen mas proximo, default true
    autoAlmacen?: boolean
    // En caso se requiera asociar un almacen especifico, default null
    codigoAlmacen?: string
    // Asocia Automaticamente un lote, default false
    autoLote?: boolean // Solo cuando esta gestionado por lotes.
    // En caso se requiera asociar un lote especifico, default null
    codigoLote?: string // Solo cuando esta gestionado por lotes.
    // Cantidad de items por defecto, default 1
    cantidad?: number // Cantidad de items por defecto
  },
): ArticuloOperacionInputProps => {
  const {
    cantidad = 1,
    autoAlmacen = true,
    codigoAlmacen = null,
    autoLote = false,
    codigoLote = null,
  } = options || {}

  const { precio, moneda } = transformarArticuloPrecioService(
    articulo.articuloPrecioBase,
    monedaVenta,
  )
  // Buscamos el almacen, en caso que no contenga precio se obtiene el primer almacen del articulo
  let lote: LoteProps | null = null
  let almacen: AlmacenProps | null = null
  if (articulo.inventario.length > 0) {
    if (autoLote) {
      if (codigoLote) {
        let cl = null
        for (const item of articulo.inventario[0].detalle) {
          cl = item.lotes.find((l) => l.lote.codigoLote === codigoLote)
          if (cl) {
            almacen = item.almacen
            break
          }
        }
        if (cl) {
          lote = cl.lote
        }
      } else {
        // Generamos la lista de lotes.
        let lt: LoteProps[] = []

        // Buscamos todos los lotes que aun no han vencido
        for (const item of articulo.inventario[0].detalle) {
          const ll = item.lotes
            .map((l) => l.lote)
            .filter((lo) => {
              const fv = dateDMYToDate(lo.fechaVencimiento)?.add(1, 'day')
              if (!fv) return false
              return getUnixTime(fv.toDate()) >= getUnixTime(new Date())
            })
          lt = lt.concat(ll)
        }

        if (lt.length > 0) {
          // Busca y obtiene el lote mas proximo a vencer
          let loteMax = lt[0]
          for (const item of lt) {
            const itemFv = dateDMYToDate(item.fechaVencimiento)!.add(1, 'day')
            const loteMaxFv = dateDMYToDate(loteMax.fechaVencimiento)!.add(1, 'day')
            if (getUnixTime(itemFv.toDate()) <= getUnixTime(loteMaxFv.toDate())) {
              loteMax = item
            }
          }
          lote = loteMax
          // Obtenemos el almacen asociado al lote
          for (const item of articulo.inventario[0].detalle) {
            const cl = item.lotes.find((l) => l.codigoLote === loteMax.codigoLote)
            if (cl) {
              almacen = item.almacen
              break
            }
          }
        }
      }
    }
    if (!almacen) {
      if (autoAlmacen) {
        if (codigoAlmacen) {
          const verificarAlmacen = articulo.inventario[0].detalle.find(
            (d) => d.codigoAlmacen === codigoAlmacen,
          )
          if (verificarAlmacen) {
            almacen = verificarAlmacen.almacen
          } else {
            almacen = articulo.inventario[0].detalle[0].almacen
          }
        } else {
          almacen = articulo.inventario[0].detalle[0].almacen
        }
      }
    }
  }

  // Buscamos el lote
  return {
    id: genRandomString(10).toUpperCase(),
    nroItem: null,
    nombreArticulo: articulo.nombreArticulo,
    codigoArticulo: articulo.codigoArticulo,
    articuloId: articulo._id,
    tipoArticulo: articulo.tipoArticulo,
    claseArticulo: articulo.claseArticulo,
    gestionArticulo: genReplaceEmpty(articulo.gestionArticulo, null),
    almacen,
    lote,
    sinProductoServicio: articulo.sinProductoServicio,
    articuloUnidadMedida: articulo.articuloPrecioBase.articuloUnidadMedida,
    cantidadOriginal: cantidad, // replica cantidad, no es valor procesable
    cantidad,
    descuento: 0,
    descuentoP: 0,
    impuesto: 0,
    precio,
    moneda,
    detalleExtra: '',
    nota: '',
    verificarStock: articulo.verificarStock,
  }
}
