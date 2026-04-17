import { SinActividadesDocumentoSectorProps } from '../../sin/interfaces/sin.interface'
import {
  ProductoInputApiProps,
  ProductoInputProps,
  ProductoProps,
  ProductoVarianteApiProps,
  ProductoVarianteInputProps,
} from '../interfaces/producto.interface'

/**
 * Componemos el producto para su posterior guardado
 * @param prod
 */
export const productoComposeService = (
  prod: ProductoInputProps,
): ProductoInputApiProps => {
  const variantes: ProductoVarianteApiProps[] = []
  if (prod.varianteUnica) {
    // VARIANTE UNICA
    const v = prod.variante
    variantes.push({
      id: v.id,
      codigoProducto: v.codigoProducto,
      codigoProductoSin: prod.sinProductoServicio?.codigoProducto!,
      titulo: prod.titulo,
      precio: v.precio,
      precioComparacion: v.precioComparacion!,
      costo: v.costo,
      codigoUnidadMedida: parseInt(v.unidadMedida?.codigoClasificador!),
      inventario: v.inventario.map((i) => ({
        codigoSucursal: i.sucursal.codigo,
        stock: i.stock,
      })),
      verificarStock: v.verificarStock,
      incluirCantidad: v.incluirCantidad,
    })
  } else {
    // MULTIPLES VARIANTES
    prod.variantes.forEach((item) => {
      variantes.push({
        id: item.id,
        codigoProducto: item.codigoProducto,
        codigoProductoSin: prod.sinProductoServicio?.codigoProducto!,
        titulo: item.titulo,
        precio: item.precio,
        precioComparacion: item.precioComparacion!,
        costo: item.costo,
        codigoUnidadMedida: parseInt(item.unidadMedida?.codigoClasificador!),
        inventario: item.inventario.map((i) => ({
          codigoSucursal: i.sucursal.codigo,
          stock: i.stock,
        })),
        verificarStock: item.verificarStock,
        incluirCantidad: item.incluirCantidad,
      })
    })
  }

  return {
    codigoActividad: prod.actividadEconomica?.codigoActividad!,
    titulo: prod.titulo,
    descripcion: prod.descripcion,
    descripcionHtml: `<p>${prod.descripcionHtml}</p>`,
    opcionesProducto: prod.opcionesProducto,
    tipoProductoId: prod.tipoProducto?._id || null,
    tipoProductoPersonalizado: prod.tipoProductoPersonalizado
      ? prod.tipoProductoPersonalizado.trim()
      : null,
    varianteUnica: prod.varianteUnica,
    codigoProveedor: prod.proveedor?.codigo || null,
    variantes,
  }
}

export const productoInputComposeService = (
  prod: ProductoProps,
  actividadEconomica: SinActividadesDocumentoSectorProps,
): ProductoInputProps => {
  let variantes: ProductoVarianteInputProps[] = []
  const inputVariante = prod.variantes[0]
  const variante: ProductoVarianteInputProps = {
    id: inputVariante.id,
    sinProductoServicio: inputVariante.sinProductoServicio.codigoProducto,
    titulo: inputVariante.titulo,
    nombre: inputVariante.nombre,
    codigoProducto: inputVariante.codigoProducto,
    disponibleParaVenta: true,
    codigoBarras: inputVariante.codigoBarras,
    precio: inputVariante.precio,
    precioComparacion: inputVariante.precioComparacion,
    costo: inputVariante.costo,
    inventario: inputVariante.inventario,
    peso: inputVariante.peso,
    unidadMedida: inputVariante.unidadMedida,
    incluirCantidad: inputVariante.incluirCantidad,
    verificarStock: inputVariante.verificarStock,
  }

  if (!prod.varianteUnica) {
    variantes = prod.variantes.map((value) => ({
      id: value.id,
      sinProductoServicio: inputVariante.sinProductoServicio.codigoProducto,
      titulo: value.titulo,
      nombre: value.nombre,
      codigoProducto: value.codigoProducto,
      disponibleParaVenta: true,
      codigoBarras: value.codigoBarras,
      precio: value.precio,
      precioComparacion: value.precioComparacion,
      costo: value.costo,
      incluirCantidadInventario: value.incluirCantidad,
      habilitarStock: value.incluirCantidad,
      inventario: value.inventario,
      peso: value.peso,
      unidadMedida: value.unidadMedida,
      incluirCantidad: value.incluirCantidad,
      verificarStock: value.verificarStock,
    }))
  }
  return {
    actividadEconomica,
    sinProductoServicio: inputVariante.sinProductoServicio,
    titulo: prod.titulo,
    descripcion: prod.descripcion,
    descripcionHtml: prod.descripcionHtml,
    varianteUnica: prod.varianteUnica,
    varianteUnicaTemp: prod.varianteUnica,
    variante,
    opcionesProducto: prod.varianteUnica ? [] : prod.opcionesProducto,
    tipoProducto: prod.tipoProducto,
    tipoProductoPersonalizado: null,
    variantes,
    variantesTemp: variantes,
    proveedor: prod.proveedor,
  }
}
