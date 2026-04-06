import {
  apiTipoArtPrecioOperacion,
  ArticuloPrecioProps,
  PrecioCostoOperacionProps,
  TipoArtPrecioOperacion,
} from '../../interfaces/articuloPrecio.ts'
import { MonedaProps } from '../../interfaces/monedaPrecio.ts'
import { getMonedaPrecioPorArticuloPrecioService } from './getMonedaService.ts'

/**
 * Generamos la estructura base para el valor de un artículo
 * @param moneda
 * @param tipoOperacion
 * @param articuloPrecio
 * @author isi-template
 */
export const estructuraValorDefault = (
  moneda: MonedaProps,
  tipoOperacion: TipoArtPrecioOperacion,
  articuloPrecio: ArticuloPrecioProps,
): PrecioCostoOperacionProps => {
  const monedaPrecio = getMonedaPrecioPorArticuloPrecioService(moneda, articuloPrecio)
  if (!monedaPrecio) {
    console.warn('Moneda could not be found.')
    throw new Error('Moneda could not be found.')
  }
  const valor =
    tipoOperacion === apiTipoArtPrecioOperacion.precio ? monedaPrecio.precio : monedaPrecio.precioBase

  return {
    tipoOperacion,
    valor,
    valorAnterior: monedaPrecio.precioBase,
    descuento: 0,
    descuentoAdicional: 0,
    descuentoTotal: 0,
    descuentoP: 0,
    descuentoAdicionalP: 0,
    descuentoTotalP: 0,
    valorNeto: 0,
    impuestoUnitario: 0,
    gastoAdicional: 0,
    variacion: 0,
    valorFinal: 0,
    totales: {
      subtotalBruto: 0,
      totalDescuento: 0,
      totalDescuentoAdicional: 0,
      totalDescuentoGeneral: 0,
      totalDescuentoP: 0,
      totalDescuentoAdicionalP: 0,
      totalDescuentoGeneralP: 0,
      subtotalNeto: 0,
      totalImpuestos: 0,
      totalGasto: 0,
      totalFinal: 0,
    },
  }
}
