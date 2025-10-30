/**
 * @description Tipo de articulo recursivo
 * @author isi-template
 */
export interface TipoArticuloOperacionProps {
  codigo: string // Código del tipo de articulo, debe ser unico
  descripcion: string // Descripcion o agrupador del tipo de articulo
}

/**
 * Interfaz principal de los tipos de articulo
 * @author isi-template
 */
export interface TipoArticuloProps {
  codigo: string
  descripcion: string
  grupoUnidadMedida: {
    codigoGrupo: number
    nombreGrupo: string
    unidadMedidaBase: {
      codigoUnidadMedida: string
      sinUnidadMedida: {
        codigoClasificador: number
        descripcion: string
      }
    }
  }
}
/**
 * @author isi-template
 */
export interface TipoArticuloInputProps {
  codigo: string
  descripcion: string
  grupoUnidadMedida: string
}
/**
 * @author isi-template
 */
export const TIPO_ARTICULO_INITIAL_VALUES: TipoArticuloInputProps = {
  codigo: '',
  descripcion: '',
  grupoUnidadMedida: '',
  /*grupoUnidadMedida: {
    codigoGrupo: null,
    nombreGrupo: '',
    unidadMedidaBase: {
      codigoUnidadMedida: '',
      sinUnidadMedida: {
        codigoClasificador: null,
        descripcion: '',
      },
    },
  },*/
}
