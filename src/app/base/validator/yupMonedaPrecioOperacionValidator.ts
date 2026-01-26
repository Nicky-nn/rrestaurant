import { number, object } from 'yup'

import { yupMonedaValidator } from './inputs.ts'

/**
 * Validamos moneda precio operacion
 * @author isi-template
 */
export const yupMonedaPrecioOperacionValidator = object({
  moneda: yupMonedaValidator.required(),
  precio: number().positive().required('Campo requerido'),
  precioBase: number(),
})
