import { number, object, string } from 'yup'

/**
 * Schema para validar moneda
 * @author isi-template
 */
export const yupMonedaValidator = object({
  codigo: number().required('El código es requerido'),
  descripcion: string().required('La descripción es requerida'),
  sigla: string().required(),
  tipoCambio: number().positive().required(),
})

/**
 * Schema para validar moneda
 * @author isi-template
 */
export const yupProveedorValidator = object({
  codigo: string().required(),
  nombre: string().required(),
  direccion: string().required(),
  ciudad: string().required(),
  contacto: string().required(),
  correo: string().email().required(),
  telefono: string().required(),
  notas: string().default(null).nullable(),
})
/**
 * Schema para validar moneda
 * @author isi-template
 */
export const yupProveedorOperacionValidator = object({
  codigo: string().required(),
  nombre: string().required(),
})

/**
 * Schema para validar moneda
 * @author isi-template
 */
export const yupMetodoPagoValidator = object({
  codigoClasificador: number().required('El código es requerido'),
  descripcion: string().required('La descripción es requerida'),
})

/**
 * Schema para validar moneda
 * @author isi-template
 */
export const yupSinTipoMonedaValidator = object({
  codigoClasificador: number().required('El código es requerido'),
  descripcion: string().required('La descripción es requerida'),
})
