import { numberWithCommasPlaces } from '../../../../../../base/components/MyInputs/NumberInput.tsx'
import { ArticuloProps } from '../../../../../../interfaces/articulo.ts'
import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'
import { apiGestionArticulo } from '../../../../../../interfaces/gestionArticulo.ts'
import { InventarioOperacionProps } from '../../../../../../interfaces/InventarioOperacion.ts'
import { UnidadMedidaSeleccionProps } from '../../ArticuloUnidadMedidaSeleccion/ArticuloUnidadMedidaSeleccion.tsx'
import { LoteSeleccionProps } from '../../LoteSeleccion/LoteSeleccionTypes.ts'
import { validarLoteVencido } from '../../LoteSeleccion/loteSeleccionUtils.ts'
import { SeleccionArticuloReglasProps } from './ArticuloSeleccionInventarioTypes.ts'

/**
 * Implementamos las reglas de negocio para la seleccion de articulos de inventario
 */
export const seleccionArticuloInventarioReglas = (
  articulo: ArticuloProps | null | undefined,
  item: ArticuloOperacionInputProps, // datos de formulario
  inventario: InventarioOperacionProps | null,
  options: {
    loteProps: LoteSeleccionProps
    unidadMedidaProps: UnidadMedidaSeleccionProps
    reglas?: SeleccionArticuloReglasProps
  },
) => {
  const { loteProps, reglas = {} } = options
  const { validarTotal = true } = reglas
  if (!articulo)
    return ['No se ha podido construir los datos de articulo, cierre el dialogo e intente de nuevo']

  if (reglas.validarExistenciaInventario) {
    if (!inventario) {
      if (articulo.gestionArticulo === apiGestionArticulo.LOTE) {
        return ['Debe seleccionar un almacen y lote con datos de inventario']
      } else {
        return ['Debe seleccionar un almacen con datos de inventario']
      }
    }
  }

  // Validando lote siempre y cuando este gestionado por lotes
  if ((loteProps.validarLote || reglas.validaLote) && !loteProps.disabled) {
    if (articulo.gestionArticulo === apiGestionArticulo.LOTE) {
      if (!item.lote) {
        return [`Articulo gestionado por ${apiGestionArticulo.LOTE}. Debe seleccionar o registra un LOTE`]
      }
    }
  }

  // Validando fecha vencimiento del lote
  if ((loteProps.validarFechaVencimiento || reglas.validaLoteFechaVencimiento) && !loteProps.disabled) {
    if (item.lote && item.lote.fechaVencimiento && articulo.gestionArticulo === apiGestionArticulo.LOTE) {
      if (!validarLoteVencido(item.lote.fechaVencimiento)) {
        return [
          `Lote ${item.lote.codigoLote} vencio el ${item.lote.fechaVencimiento}. Seleccione o registre un nuevo Lote`,
        ]
      }
    }
  }

  if (reglas.validarCantidad) {
    if (item.cantidad <= 0) {
      return ['Debe ingresar un valor en cantidad']
    }
  }

  // Verificando cantidad a enviar, solo aplica si verificarStock es true
  if (reglas.validarCantidadStock) {
    // Validamos cantidad siempre y cuando verificarStock sea true
    if (articulo.verificarStock) {
      if (!inventario) {
        return ['Para verificar la cantidad por disponibilidad, deben existir datos de INVENTARIO ']
      }
      // Si esta gestionado por lotes
      if (articulo.gestionArticulo === apiGestionArticulo.LOTE) {
        if (!item.lote || !inventario.lote) {
          return ['Error en stock disponible, debe seleccionar un LOTE que cuente con inventario > 0']
        }
        // Verificamos la cantidad disponible
        if (item.cantidad > inventario.lote.disponible) {
          return [
            `Cantidad ${item.cantidad} no debe exceder las ${inventario.lote?.disponible}  ${item.articuloUnidadMedida?.nombreUnidadMedida ?? ''} disponibles en Lote ${item.lote.codigoLote}`,
          ]
        }
      } else {
        // Validamos por almacen
        if (!item.almacen || !inventario.almacen) {
          return ['Para verificar la cantidad, debe seleccionar ALMACEN']
        }
        if (item.cantidad > inventario.almacen.disponible) {
          return [
            `Cantidad ${item.cantidad} no debe exceder las ${inventario.almacen?.disponible} ${item.articuloUnidadMedida?.nombreUnidadMedida ?? ''} disponibles en Almacen ${item.almacen.codigoAlmacen}`,
          ]
        }
      }
    }
  }

  // Verificamos integridad de precios
  if (validarTotal) {
    const subtotal = item.cantidad * item.precio
    if (subtotal <= item.descuento) {
      return [
        `Monto subtotal ${numberWithCommasPlaces(subtotal)} no puede superar el descuento ${item.descuento}`,
      ]
    }
  }
  return []
}
