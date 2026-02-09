import { FieldValues, Path } from 'react-hook-form'

/**
 * Configuración de estado visual de un campo
 * @author isi-template
 */
export interface FormModeFieldState {
  disabled?: boolean
  readOnly?: boolean
  hidden?: boolean
  required?: boolean
}

/**
 * Iteracion de los tipos input del formulario Eje. {codigo: string, nombre: string, ...}
 * a cada tipo de formulario se le puede asignado un fielModeState
 * TField = Las claves de tu formulario (ej: 'code' | 'name')
 * TMode = Tus modos (ej: 'create' | 'edit' | 'superAdminView')
 * @author isi-template
 */
export type FormModeConfig<T extends FieldValues, TMode extends string> = {
  // Usamos Path<T> para permitir claves como "moneda.codigo"
  [K in Path<T>]?: {
    [M in TMode]?: FormModeFieldState
  }
}

/**
 * Configuración de comportamientos por defecto (para no repetir en cada campo)
 * @author isi-template
 */
export type FormModeDefaults<TMode extends string> = {
  [mode in TMode]?: FormModeFieldState
}
