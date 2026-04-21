import { number, object, setLocale, string } from 'yup'
import { es } from 'yup-locales'

setLocale(es)
export const clienteInputValidator = object({
  sinTipoDocumento: object({
    codigoClasificador: number().integer().required(),
  })
    .required()
    .nullable(),
  razonSocial: string().trim().required('Razon social es un campo requerido'),
  numeroDocumento: string().trim().required('Número de documento es un campo obligatorio'),
  complemento: string(),
  email: string().trim().email('Ingrese email válido').required('Email es requerido'),
  telefono: string().nullable().optional(),
  direccion: object({
    calle: string().default(''),
    numero: string().default(''),
    apartamento: string().default(''),
    barrio: string().default(''),
    referenciasAdicionales: string().default(''),
  }).optional(),
})
