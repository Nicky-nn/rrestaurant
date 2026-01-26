import { ArticuloProps } from '../../interfaces/articulo.ts'

/**
 * Componemos articuloUnidadMedida en funcion al articuloPrecioBase y articuloPrecio
 * Usado generalmente en selects
 * @param articulo
 * @author isi-template
 */
export const articuloUnidadMedidaComposicion = (articulo?: ArticuloProps | null) => {
  if (!articulo) return []
  if (articulo.articuloPrecio.length > 0) {
    return [
      articulo.articuloPrecioBase.articuloUnidadMedida,
      ...articulo.articuloPrecio.map((ap) => ap.articuloUnidadMedida),
    ]
  }
  return [articulo.articuloPrecioBase.articuloUnidadMedida]
}
