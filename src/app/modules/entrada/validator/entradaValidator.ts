import { array, date, mixed, number, object, ObjectSchema, setLocale, string } from 'yup'
import { es } from 'yup-locales'

import { articuloOperacionInputValidator } from '../../../base/validator/articuloOperacionInputValidator.ts'
import { yupMetodoPagoValidator, yupMonedaValidator } from '../../../base/validator/inputs'

setLocale(es)
export const entradaPorCajaInputValidator: ObjectSchema<any> = object({
  moneda: yupMonedaValidator.default(null).nullable(),
  tipoCambio: number().positive().default(null).nullable(),
  metodoPago: yupMetodoPagoValidator.default(null).nullable(),
  descripcionMovimiento: string().required('Campo requerido'),
  descripcionOtrosCostos: string().default(null).nullable(),
  descuentoAdicional: number().min(0),
  detalle: array()
    .of(articuloOperacionInputValidator)
    .min(1, 'Detalle debe contener al menos 1 articulo')
    .required('Detalle es un campo requerido'),
  fechaDocumento: date().required(),
  otrosCostos: number().min(0),
  tipoDocumento: mixed().default(null).nullable().required(),
  responsable: mixed().required(),
})
