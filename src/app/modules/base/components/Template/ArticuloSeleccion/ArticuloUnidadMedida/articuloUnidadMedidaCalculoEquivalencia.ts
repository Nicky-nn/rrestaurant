import { ArticuloProps } from '../../../../../../interfaces/articulo.ts'
import { ArticuloUnidadMedidaProps } from '../../../../../../interfaces/articuloUnidadMedida.ts'

/**
 * Dado articuloUnidadMedida calcula la equivalencia de todos los articuloUnidadMedida del articulo
 * @param props
 * @author isi-template
 */
export const articuloUnidadMedidaCalculoEquivalencia = (props: {
  cantidad: number // Cantidad a convertir
  articuloUnidadMedida: ArticuloUnidadMedidaProps // Unidad de medida de la cantidad
  articulo: ArticuloProps // Articulo completo
}) => {
  const { cantidad, articulo, articuloUnidadMedida } = props
  if (
    articuloUnidadMedida.codigoUnidadMedida ===
    articulo.articuloPrecioBase.articuloUnidadMedida.codigoUnidadMedida
  ) {
    return {
      cantidad,
      articuloUnidadMedida,
    }
  }
  const ap = articulo.articuloPrecio.find(
    (ap) => ap.articuloUnidadMedida.codigoUnidadMedida === articuloUnidadMedida.codigoUnidadMedida,
  )
  if (!ap) {
    return null
  }

  return {
    cantidad: cantidad * ap.cantidadBase,
    articuloUnidadMedida: articulo.articuloPrecioBase.articuloUnidadMedida,
  }
}
