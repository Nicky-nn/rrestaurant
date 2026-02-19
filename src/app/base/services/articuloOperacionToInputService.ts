import { ArticuloOperacionProps } from '../../interfaces/articulo.ts'
import { ArticuloOperacionInputProps } from '../../interfaces/articuloOperacion.ts'
import { genRandomString } from '../../utils/helper.ts'

/**
 * Decodificamos un objecto articuloOperacion a su equivalente articuloOperacionInputProp
 * @param ao
 * @author isi-template
 */
export const articuloOperacionToInputService = (ao: ArticuloOperacionProps): ArticuloOperacionInputProps => {
  return {
    id: genRandomString(10).toUpperCase(),
    nroItem: ao.nroItem,
    articuloId: ao.articuloId,
    codigoArticulo: ao.codigoArticulo,
    nombreArticulo: ao.nombreArticulo,
    tipoArticulo: ao.tipoArticulo,
    claseArticulo: ao.claseArticulo,
    grupoArticulo: ao.grupoArticulo,
    gestionArticulo: ao.gestionArticulo,
    almacen: ao.almacen,
    lote: ao.lote,
    sinProductoServicio: ao.sinProductoServicio,
    articuloUnidadMedida: ao.articuloPrecio.articuloUnidadMedida,
    cantidadOriginal: ao.articuloPrecio.cantidad,
    cantidad: ao.articuloPrecio.cantidad,
    descuento: ao.articuloPrecio.descuento,
    descuentoP: 0,
    impuesto: ao.articuloPrecio.impuesto,
    precio: ao.articuloPrecio.valor,
    moneda: ao.articuloPrecio.moneda,
    detalleExtra: ao.detalleExtra,
    nota: ao.nota,
    verificarStock: ao.verificarStock,
  }
}
