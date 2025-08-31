import { object, ref, setLocale, string } from 'yup'
import { es } from 'yup-locales'

setLocale(es)

/**
 * @description reglas de validacion para cambio de password
 * @author isi-template
 */
export const cambiarPasswordValidationSchema = object({
  password: string().required(),
  nuevoPassword: string().min(7).required(),
  nuevoPassword2: string()
    .min(7)
    .oneOf([ref('nuevoPassword')], 'Las nuevas contraseñas deben coincidir')
    .required(),
})
