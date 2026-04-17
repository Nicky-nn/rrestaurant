import { array, boolean, number, object, setLocale, string } from 'yup'
import { es } from 'yup-locales'

import { ProductoInputProps } from '../interfaces/producto.interface'
setLocale(es)
export const productoRegistroVarianteValidatorioSchema = {
  id: string().required('Identificador unico de la variante del producto es requerido'),
  codigoProducto: string().trim().required('Código del producto es requerido'),
  codigoBarras: string().trim().nullable(),
  precio: number().positive().required('Precio es un campo obligatorio mayor a 0'),
  precioComparacion: number().min(0).required(),
  costo: number().min(0),
  inventario: array().of(
    object({
      sucursal: object()
        .shape({
          codigo: number().integer().required(),
        })
        .required(),
      stock: number().min(0).nullable(),
    }),
  ),
  unidadMedida: object()
    .nullable()
    .default({})
    .shape({
      codigoClasificador: string().required(),
      descripcion: string().required(),
    })
    .required(),
}

export const productoRegistroValidationSchema = object({
  actividadEconomica: object({
    codigoActividad: string().required('Debe seleccionar la actividad económica'),
  }).required(),
  sinProductoServicio: object()
    .nullable()
    .default({})
    .shape({
      codigoProducto: string().required(
        'Codigo Producto Homologado es un campo obligatorio',
      ),
    })
    .required('Producto Homologado es un campo obligatorio'),
  titulo: string().trim().required('Nombre del producto es un campo obligatorio'),
  descripcion: string(),
  descripcionHtml: string(),
  varianteUnica: boolean().required(),
  tipoProducto: object({
    _id: string(),
  }).nullable(),
  tipoProductoPersonalizado: string().nullable(),
  proveedor: object({
    _id: string(),
  }).nullable(),
  variante: object(productoRegistroVarianteValidatorioSchema),
})

/**
 * Validamos los datos de formulario del producto
 * @param prod
 */
export const productoRegistroValidator = async (
  prod: ProductoInputProps,
): Promise<Array<string>> => {
  try {
    setLocale(es)
    const schema = productoRegistroValidationSchema
    await schema.validate(prod)

    // Verificamos si es variante unica
    if (prod.varianteUnica) {
      const schemaVariante = object({
        id: string().required(
          'Identificador único de la variante del producto es requerido',
        ),
        codigoProducto: string().trim().required('Código del producto es requerido'),
        codigoBarras: string().trim().nullable(),
        precio: number().positive().required('Precio es un campo obligatorio'),
        precioComparacion: number().min(0),
        costo: number().min(0),
        inventario: array().of(
          object({
            sucursal: object()
              .shape({
                codigo: number().integer().required(),
              })
              .required(),
            stock: number().min(0).nullable(),
          }),
        ),
      })
      await schemaVariante.validate(prod.variante)
      // Validando unidad de medida
      if (!prod.variante.unidadMedida) {
        throw new Error(`Debe seleccionar la Unidad de medida`)
      }
      if (prod.variante.precioComparacion || 0 > 0) {
        if (prod.variante.precio > prod.variante.precioComparacion!) {
          throw new Error('El precio de comparación debe ser mayor al precio Original')
        }
      }
      if (prod.variante.costo > 0) {
        if (prod.variante.costo > prod.variante.precio) {
          throw new Error('El precio debe ser mayor al costo')
        }
      }
    } else {
      if (prod.opcionesProducto.length === 0) {
        throw new Error('Debe adicionar al menos una opción de producto')
      }
      if (prod.variantes.length === 0) {
        throw new Error('Debe adicionar al menos una Variante de producto')
      }
      for (const variante of prod.variantes) {
        const schemaVariante = object({
          id: string().required('Identificador unico del producto es requerido'),
          codigoProducto: string().trim().required('Código del producto es requerido'),
          titulo: string().trim().required('Nombre del producto es un campo requerido'),
          codigoBarras: string().trim().nullable(),
          precio: number().positive().required('Precio es un campo obligatorio'),
          precioComparacion: number().min(0),
          costo: number().min(0),
          inventario: array().of(
            object({
              sucursal: object()
                .shape({
                  codigo: number().integer().required(),
                })
                .required(),
              stock: number().min(0).nullable(),
            }),
          ),
        })
        await schemaVariante.validate(variante)
        // Validando unidad de medida
        if (!variante.unidadMedida) {
          throw new Error(
            `Variante ${variante.codigoProducto}: Debe seleccionar la Unidad de medida`,
          )
        }
        if (variante.precioComparacion || 0 > 0) {
          if (variante.precio > variante.precioComparacion!) {
            throw new Error(
              `Variante ${variante.codigoProducto}: El precio de comparación debe ser mayor al precio Original`,
            )
          }
        }
        if (variante.costo > 0) {
          if (variante.costo > variante.precio) {
            throw new Error(
              `Variante ${variante.codigoProducto} El precio debe ser mayor al costo`,
            )
          }
        }
      }
    }
    return []
  } catch (e: any) {
    return [e.message]
  }
}
