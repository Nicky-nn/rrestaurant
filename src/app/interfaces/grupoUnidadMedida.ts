import { ArticuloUnidadMedidaProps } from './articuloUnidadMedida.ts'
import { AuditoriaProps } from './index.ts'

/**
 * @description Definición de unidades de medida por cantidad
 * Las operaciones se basan segun la unidad de medida minima cuya cantidad base = 1
 * @author isi-template
 */
export interface GrupoUnidadMedidaDefinicionProp {
  unidadMedida: ArticuloUnidadMedidaProps // Código que identifica a la unidad de medida, se replica con sin unidad medida
  cantidadBase: number
}

/**
 * @description Propiedades que debe tener un grupo de unidad de medida
 * Si realiza una operación de articulo, ya no podrá modificar su grupo de UM.
 * @author isi-template
 */
export interface GrupoUnidadMedidaProps extends AuditoriaProps {
  _id: string
  codigoGrupo: string // Código que identifica al grupo de unidad de medida
  nombreGrupo: string // descripcion del grupo de unidad de medida
  unidadMedidaBase: ArticuloUnidadMedidaProps // unidad de medida base del grupo
  definicion: GrupoUnidadMedidaDefinicionProp[]
  state?: string // estado del registro
}

/**
 * @author isi-template
 */
export interface GrupoUnidadMedidaDefinicionInputProps {
  unidadMedida: ArticuloUnidadMedidaProps // Código que identifica a la unidad de medida, se replica con sin unidad medida
  cantidadBase: number | null
}

/**
 * @author isi-template
 */
export interface GrupoUnidadMedidaInputProps {
  codigoGrupo: string
  nombreGrupo: string
  unidadMedidaBase: ArticuloUnidadMedidaProps | null
  definicion: GrupoUnidadMedidaDefinicionInputProps[]
}

/**
 * @author isi-template 2025.3
 */
export interface GrupoUnidadMedidaInputApiProps {
  nombreGrupo: string
  codigoUnidadMedidaBase: string
  definicion: {
    codigoUnidadMedida: string
    cantidadBase: number
  }[]
}

/**
 * @author isi-template 2025.3
 */
export const GRUPO_UNIDAD_MEDIDA_INITIAL_VALUES: GrupoUnidadMedidaInputProps = {
  codigoGrupo: 'Autogenerado',
  nombreGrupo: '',
  unidadMedidaBase: null,
  definicion: [],
}
