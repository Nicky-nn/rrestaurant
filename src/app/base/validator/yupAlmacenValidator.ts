import { object, string } from 'yup'

/**
 * Validator para el almacen
 * @author isi-template
 */
export const yupAlmacenValidator = object({
  codigoAlmacen: string().required(),
  nombre: string().required(),
  ubicacion: string().required(),
})
