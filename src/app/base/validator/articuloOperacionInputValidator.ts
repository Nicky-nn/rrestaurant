import { boolean, mixed, number, object, ObjectSchema, setLocale, string } from 'yup'
import { es } from 'yup-locales'

import { yupArticuloUnidadMedidaValidator } from './articuloUnidadMedidaValidator.ts'
import { yupMonedaValidator } from './inputs.ts'
import { yupAlmacenValidator } from './yupAlmacenValidator.ts'
import { yupLoteValidator } from './yupLoteValidator.ts'
import { yupMonedaPrecioOperacionValidator } from './yupMonedaPrecioOperacionValidator.ts'

setLocale(es)

/**
 * Validamos el articulo precio operacion
 * @author isi-template
 */
const yupArticuloPrecioOperacionValidator = object({
  articuloUnidadMedida: yupArticuloUnidadMedidaValidator.required(),
  cantidad: number().positive().required('La cantidad es requerida'),
  cantidadBase: number().required(),
  descuento: number().min(0).required(),
  factorAjuste: number().required(),
  impuesto: number().min(0).required(),
  monedaPrecio: yupMonedaPrecioOperacionValidator.required(),
})

/**
 * Validamos el articulo operacion input
 * @author isi-template
 */
export const yupArticuloOperacionInputValidator: ObjectSchema<any> = object({
  codigoArticulo: string().required('El código del articulo es requerido'),
  nombreArticulo: string().required('El nombre del articulo es requerido'),
  almacen: yupAlmacenValidator.required(),
  lote: yupLoteValidator.default(null).nullable(),
  articuloPrecioBase: mixed().required(),
  articuloPrecio: yupArticuloPrecioOperacionValidator.required(),
  detalleExtra: string().default(null).nullable(),
  nota: string().default(null).nullable(),
  verificarStock: boolean(),
})

/**
 * Mapa de validacion para articulo operacion
 * - Usado generalmente en definicion de formularios
 * @author isi-template
 */
export const articuloOperacionDefinitionValidator = {
  nroItem: number().integer().nullable().default(null),
  tipoArticulo: mixed().default(null).nullable(),
  claseArticulo: mixed().required(),
  grupoArticulo: mixed().default(null).nullable(),
  almacen: yupAlmacenValidator.required(),
  lote: yupLoteValidator.default(null).nullable(),
  codigoArticulo: string().required('El código del articulo es requerido'),
  nombreArticulo: string().required('El nombre del articulo es requerido'),
  sinProductoServicio: mixed().required(),
  articuloUnidadMedida: yupArticuloUnidadMedidaValidator.required(),
  cantidad: number().positive('Intro nro. positivo').required('Requerido'),
  descuento: number().min(0).required('Obligatorio'),
  descuentoP: number()
    .transform((value, originalValue) => (originalValue === '' || originalValue === null ? undefined : value))
    .min(0, 'El porcentaje no puede ser negativo')
    .max(100, 'El porcentaje no puede superar el 100%')
    .required('Obligatorio'),
  impuesto: number().min(0).required('Obligatorio'),
  precio: number().positive('Debe ser nro. positivo').required('Obligatorio'),
  moneda: yupMonedaValidator.required(),
  detalleExtra: string().nullable(),
  nota: string().nullable(),
  verificarStock: boolean(),
}

/**
 * Validador para articulo operacion
 * @author isi-template
 */
export const articuloOperacionInputValidator: ObjectSchema<any> = object({
  ...articuloOperacionDefinitionValidator,
})
