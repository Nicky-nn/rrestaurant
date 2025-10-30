import { SinUnidadMedidaProps } from './sin.interface.ts'

/**
 * @description Relacion del articulo con la unidad de medida
 * @author isi-template
 */
export interface ArticuloUnidadMedidaProps {
  codigoUnidadMedida: string // Código que identifica a la unidad de medida, se replica con sin unidad medida
  nombreUnidadMedida: string // descripcion de la unidad de medida
  sinUnidadMedida: SinUnidadMedidaProps // datos de la unidad de medida según la entidad tributaria BOB
  longitud: number | null // longitud del articulo segun la unidad de medida
  ancho: number | null // ancho articulo según la unidad de medida
  altura: number | null // altura articulo según la unidad de medida
  peso: number | null // Peso del articulo segun la unidad de medida
  volumen: number | null // volumen del articulo segun la unidad de medida
  state?: string // estado del registro
  usucre?: string
  usumod?: string
}
/**
 * @author isi-template
 */
export interface UnidadMedidaProps {
  codigoUnidadMedida: string
  nombreUnidadMedida: string
  sinUnidadMedida: {
    codigoClasificador: number
    descripcion: string
  }
  state: string
}
/**
 * @author isi-template
 */
export interface UnidadMedidaInputProps {
  codigoSinUnidadMedida: string | null
  codigoUnidadMedida: string
  nombreUnidadMedida: string
  sinUnidadMedida: SinUnidadMedidaProps | null
  unidadMedida: SinUnidadMedidaProps | null
}
/**
 * @author isi-template
 */
export const UNIDAD_MEDIDA_INITIAL_VALUES: UnidadMedidaInputProps = {
  codigoSinUnidadMedida: null,
  codigoUnidadMedida: '',
  nombreUnidadMedida: '',
  sinUnidadMedida: null,
  unidadMedida: null,
}
