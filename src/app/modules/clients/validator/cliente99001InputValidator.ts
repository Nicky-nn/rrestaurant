import { object, setLocale, string } from 'yup'
import { es } from 'yup-locales'

setLocale(es)

export const cliente99001InputValidator = object({
  razonSocial: string().trim().required('Razón social es un campo requerido'),
  email: string().trim().email('Ingrese un email válido').required('Email es requerido'),
  codigoCliente: string().trim().required(),
})
