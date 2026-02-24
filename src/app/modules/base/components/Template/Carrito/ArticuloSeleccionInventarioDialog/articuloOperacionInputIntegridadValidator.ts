import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'

/**
 * Validamos integridad de datos de entrada para detalle de operaciones
 * Cada uno de los items debe contener al menos cantidad > 0
 * @param articulos
 * @param props
 */
export const articuloOperacionInputIntegridadValidator = (
  articulos: ArticuloOperacionInputProps[],
  props?: {
    validarLote?: boolean
  },
) => {
  const { validarLote = true } = props ?? {}
  // Validamos que los articulos contenga al menos el almacen
  const errors: string[] = []
  for (const item of articulos) {
    if (item.cantidad > 0) {
      if (!item.almacen)
        errors.push(`Articulo ${item.codigoArticulo} - ${item.nombreArticulo} debe tener asignado un almacen`)
      if (validarLote) {
        if (item.gestionArticulo === 'LOTE') {
          if (!item.lote)
            errors.push(
              `Articulo ${item.codigoArticulo} - ${item.nombreArticulo} esta gestionado por LOTES, debe asignar un lote`,
            )
        }
        if (item.lote && item.gestionArticulo !== 'LOTE') {
          errors.push(
            `Articulo ${item.codigoArticulo} - ${item.nombreArticulo} no esta gestionado por LOTES, debe quitar la asignación del LOTE`,
          )
        }
      }
    }
  }
  return errors
}
