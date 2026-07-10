// noinspection PointlessBooleanExpressionJS

import { ArticuloProps } from '../../interfaces/articulo.ts'
import { ArticuloOperacionInputProps } from '../../interfaces/articuloOperacion.ts'
import { ArticuloUnidadMedidaProps } from '../../interfaces/articuloUnidadMedida.ts'
import { genRandomString, genReplaceEmpty } from '../../utils/helper.ts'
import { MonedaParamsProps, TipoMontoProps } from '../interfaces/base.ts'
import { procesarLoteYAlmacen } from './loteAlmacenHelper.ts'
import { transformarArticuloPrecioService } from './transformarArticuloPrecioService.ts'

/**
 * Estrategias de selección de lote
 */
export enum MetodoSeleccionLote {
  FEFO = 'fefo', // First Expired First Out - Por fecha de vencimiento (más próximo a vencer)
  FIFO = 'fifo', // First In First Out - Por fecha de fabricación (más antiguo)
  MANUAL = 'manual', // Manual - Se requiere codigoLote
}

interface OpcionesArticuloOperacion {
  // Asocia automaticamente el almacen mas proximo, default true
  autoAlmacen?: boolean
  // En caso se requiera asociar un almacen especifico, default null
  codigoAlmacen?: string
  // Asocia Automaticamente un lote, default false
  autoLote?: boolean
  // En caso se requiera asociar un lote especifico, default null
  codigoLote?: string
  // Metodo de selección de lote, default FEFO, (más próximo a vencer)
  metodoSeleccionLote?: MetodoSeleccionLote
  // Solo considera almacenes con stock > 0, default false
  mostrarAlmacenConStock?: boolean
  // Solo considera lotes con stock > 0, default false
  mostrarLoteConStock?: boolean
  // Cantidad de items por defecto, default 1
  cantidad?: number
  // Cantidad auxiliar que no cambia, default 1
  cantidadOriginal?: number
  // En caso se requiera sustituir el articuloUnidadMedida, default null
  articuloUnidadMedida?: ArticuloUnidadMedidaProps
  // En caso se requiera sustituir el detalleExtra, default ''
  detalleExtra?: string
  // En caso se requiera sustituir la nota, default ''
  nota?: string
  // En caso se requiera sustituir el nroItem, default null
  nroItem?: number
  // En caso se requiera agregar un descuento inicial
  descuento?: number
  // En caso se requiera agregar el descuento porcentual
  descuentoP?: number
  // En caso se requiera agregar un impuesto inicial
  impuesto?: number
  // Marca que se concatena con el id random generado
  marca?: string
  // Asocia el tipo de monto solicitado en el campo precio, costo, precio, delivery, etc... default precio
  tipoMonto?: TipoMontoProps
  /**
   * Porcentaje de asignación financiera (0-100).
   * Uso exclusivo en Producción (DESPIECE / CONJUNTA) para prorratear el costo base.
   * En otras operaciones (Ventas/Compras) su valor es 0.
   */
  porcentajeCosto?: number
}

/**
 * Función para transformar un articulo en un input de operacion
 * Si el articulo esta gestionado por lotes, se obtiene el lote según el metodo especificado.
 *
 * @param articulo - Artículo a transformar
 * @param monedaVenta - Moneda de venta
 * @param options - Opciones de configuración
 * @author isi-template (mejorado)
 */
export const articuloToArticuloOperacionInputService = (
  articulo: ArticuloProps,
  monedaVenta: MonedaParamsProps,
  options?: OpcionesArticuloOperacion,
): ArticuloOperacionInputProps => {
  // Valores por defecto
  const {
    cantidad = 1,
    cantidadOriginal = 1,
    autoAlmacen = true,
    codigoAlmacen = null,
    autoLote = false,
    codigoLote = null,
    metodoSeleccionLote = MetodoSeleccionLote.FEFO,
    mostrarAlmacenConStock = false,
    mostrarLoteConStock = false,
    detalleExtra = '',
    nota = '',
    nroItem = null,
    descuento = 0,
    descuentoP = 0,
    impuesto = 0,
    marca = 'AOI',
    tipoMonto = 'precio',
    porcentajeCosto = 0,
  } = options || {}

  // Determinar unidad de medida
  const articuloUnidadMedida =
    options?.articuloUnidadMedida ?? articulo.articuloPrecioBase.articuloUnidadMedida

  // Buscamos el precio por unidad de medida
  const articuloPrecio = [articulo.articuloPrecioBase, ...articulo.articuloPrecio].find(
    (p) => p.articuloUnidadMedida.codigoUnidadMedida === articuloUnidadMedida.codigoUnidadMedida,
  )

  // Determinar precio según tipo de monto
  const { precio, moneda, precioBase, delivery } = transformarArticuloPrecioService(
    articuloPrecio || articulo.articuloPrecioBase,
    monedaVenta,
  )

  const cantidadFactor = articuloPrecio?.cantidadBase || 1

  let precioFinal = precio
  if (tipoMonto === 'delivery') precioFinal = delivery
  if (tipoMonto === 'costo') precioFinal = precioBase

  // Procesar lote y almacén
  const { lote, almacen } =
    articulo.inventario.length > 0
      ? procesarLoteYAlmacen(articulo.inventario[0].detalle, {
          autoLote,
          codigoLote,
          metodoSeleccionLote,
          autoAlmacen,
          codigoAlmacen,
          mostrarAlmacenConStock,
          mostrarLoteConStock,
        })
      : { lote: null, almacen: null }

  // Construir el resultado
  return {
    id: `${marca}${genRandomString(10).toUpperCase()}`,
    nroItem,
    nombreArticulo: articulo.nombreArticulo,
    codigoArticulo: articulo.codigoArticulo,
    articuloId: articulo._id,
    tipoArticulo: articulo.tipoArticulo,
    claseArticulo: articulo.claseArticulo,
    gestionArticulo: genReplaceEmpty(articulo.gestionArticulo, null),
    almacen,
    lote,
    sinProductoServicio: articulo.sinProductoServicio,
    articuloUnidadMedida,
    cantidadOriginal,
    cantidadFactor,
    cantidad,
    descuento,
    descuentoP,
    impuesto,
    costo: precioBase,
    precio: precioFinal,
    /** Inicialmente nacen con el mismo valor de costoBase [historial]*/
    costoAnterior: precioBase,
    /** Inicialmente nacen con el mismo valor de precioBase [historial] */
    precioAnterior: precioFinal,
    moneda,
    detalleExtra,
    nota,
    verificarStock: articulo.verificarStock,
    porcentajeCosto,
  }
}
