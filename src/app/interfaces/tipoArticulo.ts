/**
 * @description Tipo de articulo recursivo
 */
export interface TipoArticuloOperacionProps {
  codigo: string // Código del tipo de articulo, debe ser unico
  descripcion: string // Descripcion o agrupador del tipo de articulo
}

/**
 * Interfaz principal de los tipos de articulo
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

export interface TipoArticuloInputProps {
  codigo: string
  descripcion: string
  grupoUnidadMedida: string
}

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
