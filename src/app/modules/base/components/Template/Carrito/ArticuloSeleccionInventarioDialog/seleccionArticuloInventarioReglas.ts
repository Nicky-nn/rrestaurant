import { numberWithCommasPlaces } from '../../../../../../base/components/MyInputs/NumberInput.tsx'
import { ArticuloProps } from '../../../../../../interfaces/articulo.ts'
import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'
import { apiGestionArticulo } from '../../../../../../interfaces/gestionArticulo.ts'
import { InventarioOperacionProps } from '../../../../../../interfaces/InventarioOperacion.ts'
import { parseStringToDate } from '../../../../../../utils/dayjsHelper.ts'
import { UnidadMedidaSeleccionProps } from '../../ArticuloUnidadMedidaSeleccion/ArticuloUnidadMedidaSeleccion.tsx'
import { LoteSeleccionProps } from '../../LoteSeleccion/LoteSeleccion.tsx'
import { SeleccionArticuloReglasProps } from './SeleccionArticuloInventarioDialog.tsx'

/**
 * Implementamos las reglas de negocio para la seleccion de articulos de inventario
 */
export const seleccionArticuloInventarioReglas = (
  articulo: ArticuloProps | null | undefined,
  item: ArticuloOperacionInputProps,
  inventario: InventarioOperacionProps | null,
  options: {
    loteProps: LoteSeleccionProps
    unidadMedidaProps: UnidadMedidaSeleccionProps
    reglas: SeleccionArticuloReglasProps
  },
) => {
  const { loteProps, unidadMedidaProps, reglas } = options
  const { validarTotal = true } = reglas
  if (!articulo)
    return [
      'No se ha podido construir los datos de articulo, cierre el dialogo e intente de nuevo',
    ]

  if (reglas.validarInventario) {
    if (!inventario) {
      return ['Debe contar con datos de INVENTARIO ']
    }
  }

  // Validando lote siempre y cuando este gestionado por lotes
  if (loteProps.validarLote) {
    if (articulo.gestionArticulo === apiGestionArticulo.LOTE) {
      if (!item.lote) {
        return [
          `Articulo gestionado por ${apiGestionArticulo.LOTE}. Debe seleccionar o registra un LOTE`,
        ]
      }
    }
  }

  // Validando fecha vencimiento del lote
  if (loteProps.validarFechaVencimiento) {
    if (
      item.lote &&
      item.lote.fechaVencimiento &&
      articulo.gestionArticulo === apiGestionArticulo.LOTE
    ) {
      if (parseStringToDate(item.lote.fechaVencimiento)! <= new Date()) {
        return [
          `Lote ${item.lote.codigoLote} vencio el ${item.lote.fechaVencimiento}. Seleccione o registre nuevo Lote`,
        ]
      }
    }
  }

  // Verificando cantidad a enviar, solo aplica si verificarStock es true
  if (reglas.validarCantidad) {
    // Validamos cantidad siempre y cuando verificarStock sea true
    if (articulo.verificarStock) {
      if (!inventario) {
        return ['Para verificar la cantidad, deben existir datos de INVENTARIO ']
      }
      // Si esta gestionado por lotes
      if (articulo.gestionArticulo === apiGestionArticulo.LOTE) {
        if (!item.lote || !inventario.lote) {
          return ['Para verificar la cantidad, debe seleccionar LOTE']
        }
        // Verificamos la cantidad disponible
        if (item.cantidad > inventario.lote.disponible) {
          return [
            `Cantidad ${item.cantidad} no debe exceder las ${inventario.lote?.disponible}  ${item.articuloUnidadMedida?.nombreUnidadMedida ?? ''} disponible en Lote ${item.lote.codigoLote}`,
          ]
        }
      } else {
        // Validamos por almacen
        if (!item.almacen || !inventario.almacen) {
          return ['Para verificar la cantidad, debe seleccionar ALMACEN']
        }
        if (item.cantidad > inventario.almacen.disponible) {
          return [
            `Cantidad ${item.cantidad} no debe exceder las ${inventario.almacen?.disponible} ${item.articuloUnidadMedida?.nombreUnidadMedida ?? ''} disponible en Almacen ${item.almacen.codigoAlmacen}`,
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
