// hooks/useFormMode.ts

import { FieldValues, Path } from 'react-hook-form'

import {
  FormModeConfig,
  FormModeDefaults,
  FormModeFieldState,
} from '../interfaces/formModes.ts'

/**
 * Hook para el manejo de estados en los formularios
 * @param currentMode
 * @param config
 * @param defaults
 * @author isi-template
 */
export const useFormMode = <TForm extends FieldValues, TMode extends string>(
  currentMode: TMode,
  config: FormModeConfig<TForm, TMode>,
  defaults: FormModeDefaults<TMode> = {},
) => {
  const getStatus = (fieldName: keyof TForm & string): FormModeFieldState => {
    // 1. Estrategia Base: ¿Qué implica este modo por defecto?
    // Ej: Si el modo es 'consult', quizás el default es { readOnly: true }
    const modeDefault = defaults[currentMode] || {}

    // 2. Estrategia Específica: Configuración del campo
    const fieldConfig = config[fieldName]?.[currentMode] || {}

    // 3. Fusión: La específica sobreescribe a la base
    return {
      disabled: fieldConfig.disabled ?? modeDefault.disabled ?? false,
      readOnly: fieldConfig.readOnly ?? modeDefault.readOnly ?? false,
      hidden: fieldConfig.hidden ?? modeDefault.hidden ?? false,
      required: fieldConfig.required ?? modeDefault.required ?? false,
    }
  }

  return {
    // Helpers individuales para usarlos en tu JSX
    isDisabled: (field: Path<TForm>) => getStatus(field).disabled,
    isReadOnly: (field: Path<TForm>) => getStatus(field).readOnly,
    isHidden: (field: Path<TForm>) => getStatus(field).hidden,
    isRequired: (field: Path<TForm>) => getStatus(field).required,
    mode: currentMode,
  }
}
