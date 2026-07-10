import { EntradaPorCajaApiInputProps, EntradaPorCajaInputProp } from '../interfaces'
import { genReplaceEmpty } from '../../../utils/helper.ts'
import { articuloOperacionInputToApiService } from '../../../base/services/articuloOperacionInputToApiService.ts'

/**
 * Composición de entrada por caja input a su equivalente consumo api
 * @param data
 */
export const entradaPorCajaToApiCompose = (data: EntradaPorCajaInputProp): EntradaPorCajaApiInputProps => {
  return {
    cajaInput: {
      aprobador: data.responsable!.key,
      tipo: 'REST',
    },
    entradaInput: {
      /** metodo pago efectivo = 1 */
      codigoMetodoPago: 1,
      codigoMoneda: data.moneda!.codigo,
      /** Proveedor interno, default 9999 */
      codigoProveedor: '9999',
      descripcionMovimiento: data.descripcionMovimiento,
      descripcionOtrosCostos: genReplaceEmpty(data.descripcionOtrosCostos, null),
      descuentoAdicional: data.descuentoAdicional,
      otrosCostos: data.otrosCostos,
      tipoCambio: data.tipoCambio,
      tipoDocumento: data.tipoDocumento!.key,
      montoTotal: 0,
    },
    detalle: data.detalle.map((dd) => articuloOperacionInputToApiService(dd)),
  }
}
