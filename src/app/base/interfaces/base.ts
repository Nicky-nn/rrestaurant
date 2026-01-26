/**
 * @author isi-template
 */
export interface ImagenProps {
  altText: string
  url: string
}

/**
 * @author isi-template
 */
export interface MonedaParamsProps {
  codigo: number
  descripcion: string
  sigla: string
  tipoCambio?: number
}

/**
 * @author isi-template
 */
export type TipoRepresentacionGrafica = 'pdf' | 'rollo' | 'rolloResumen' | 'rolloReducido'

/**
 * Interface para key value con unico tipado
 * @author isi-template
 */
export type KeyValueProp<T> = {
  key: T
  value: T
}

/**
 * Interface para key value con doble tipado
 * @author isi-template
 */
export type KeyValuePropV2<T, U> = {
  key: T
  value: U
}

/**
 * Tipos de montos que se obtienen para extracción de precio en formulario de tablas
 * costo = precio base
 * precio = normal
 * delivery = precio por delivery
 * @author isi-template 2025.3
 */
export type TipoMontoProps = 'precio' | 'costo' | 'delivery'
