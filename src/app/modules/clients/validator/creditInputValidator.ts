import { number, object, setLocale, string } from 'yup'
import { es } from 'yup-locales'

setLocale(es)
export const creditInputValidator = object({
  nombres: string().trim().required('Nombre es un campo requerido'),
  apellidos: string().trim().required('Apellido es un campo requerido'),
  email: string().trim().email('Ingrese email válido').required('Email es requerido'),
  telefono: string().trim().required('Teléfono es un campo requerido'),
  direccion: string().trim().required('Dirección es un campo requerido'),
  entidadLaboral: string().trim().required('Entidad laboral es un campo requerido'),
  direccionLaboral: string().trim().required('Dirección laboral es un campo requerido'),
  creditoMaximo: number().required('Crédito máximo es un campo requerido'),
  creditoMinimo: number().required('Crédito mínimo es un campo requerido'),
  maximoPlazo: number()
    .integer()
    .min(1)
    .max(72)
    .required('Plazo máximo es un campo requerido')
    .typeError('Plazo máximo es un campo requerido'),
})
