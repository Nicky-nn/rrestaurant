import { array, number, object, setLocale, string } from 'yup'
import { es } from 'yup-locales'

setLocale(es)
export const ncdRegistroValidationSchema = object({
  facturaCuf: string().trim().required('Código Único de factura es requerido'),
  detalleFactura: array().of(
    object({
      nroItem: number().min(1).required(),
      cantidad: number().positive().required(),
    }),
  ),
})
