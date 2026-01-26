import { mixed, number, object, string } from 'yup'

/**
 * Validator para la unidad de medida de un articulo
 * @author isi-template
 */
export const yupArticuloUnidadMedidaValidator = object({
  codigoUnidadMedida: string().required(),
  nombreUnidadMedida: string().required(),
  sinUnidadMedida: mixed(),
  longitud: number().default(null).nullable(),
  ancho: number().default(null).nullable(),
  altura: number().default(null).nullable(),
  peso: number().default(null).nullable(),
  volumen: number().default(null).nullable(),
})
