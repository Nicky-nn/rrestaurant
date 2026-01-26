import { object, string } from 'yup'

/**
 * Validamos el lote
 * @author isi-template
 */
export const yupLoteValidator = object({
  codigoLote: string().required(),
  descripcion: string().required(),
  atributo1: string().nullable(),
  atributo2: string().nullable(),
})
