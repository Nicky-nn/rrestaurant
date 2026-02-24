import { createContext, FC, ReactNode, useContext, useMemo } from 'react'
import { FieldValues, Path } from 'react-hook-form' // Tu hook actual

import { useFormMode } from '../hooks/useFormMode'
import { FormModeConfig, FormModeDefaults } from '../interfaces/formModes.ts'

// Definimos qué va a compartir el contexto
interface FormModeContextType {
  isDisabled: (field: string) => boolean
  isReadOnly: (field: string) => boolean
  isHidden: (field: string) => boolean
  isRequired: (field: string) => boolean
  mode: string
}

const FormModeContext = createContext<FormModeContextType | null>(null)

// Props del Provider (Estrictas para la configuración)
interface FormModeProviderProps<TForm extends FieldValues, TMode extends string> {
  children: ReactNode
  mode: TMode
  config: FormModeConfig<TForm, TMode>
  defaults?: FormModeDefaults<TMode>
}

/**
 * El Provider instancia el hook UNA SOLA VEZ en el formulario principal y comparte el resultado
 * <FormModeProvider mode={mode} config={inventoryConfig} defaults={inventoryDefaults}>
 *    <form><Hijos></form>
 * </FormModeProvider>
 * @param children
 * @param mode
 * @param config
 * @param defaults
 * @constructor
 * @author isi-template
 */
export const FormModeProvider = <TForm extends FieldValues, TMode extends string>({
  children,
  mode,
  config,
  defaults,
}: FormModeProviderProps<TForm, TMode>) => {
  // 1. Instanciamos el hook con los tipos correctos
  const logic = useFormMode<TForm, TMode>(mode, config, defaults)

  // 2. Adaptador de Tipos (El truco para evitar el error)
  // Convertimos la función estricta (keyof TForm) a una genérica (string)
  // Esto es seguro porque el runtime JS no le importa el tipo, y TS ya validó la config arriba.
  const contextValue = useMemo(
    () => ({
      mode: logic.mode,
      isDisabled: logic.isDisabled as (field: string) => boolean,
      isReadOnly: logic.isReadOnly as (field: string) => boolean,
      isHidden: logic.isHidden as (field: string) => boolean,
      isRequired: logic.isRequired as (field: string) => boolean,
    }),
    [logic.mode, config, defaults],
  )

  return <FormModeContext.Provider value={contextValue}>{children}</FormModeContext.Provider>
}

/**
 * El Hijo consume la lógica directamente, sin props
 * const { isDisabled, isReadOnly } = useFormModeFieldState();
 * @author isi-template
 */
export const useFormModeFieldState = <T extends Record<string, any> = Record<string, any>>() => {
  const context = useContext(FormModeContext)
  if (!context) throw new Error('useFieldState requiere envoltorio FormModeProvider and react-hook-form')
  return {
    ...context,
    isDisabled: context.isDisabled as (field: Path<T>) => boolean,
    isReadOnly: context.isReadOnly as (field: Path<T>) => boolean,
    isHidden: context.isHidden as (field: Path<T>) => boolean,
    isRequired: context.isRequired as (field: Path<T>) => boolean,
  }
}

/**
 * wraper que envuelve el componente con el provider
 * @param Component
 * @param mode
 * @param config
 * @param defaults
 */
export const withFormMode = (Component: FC, mode: string, config: any, defaults?: any) => (
  <FormModeProvider mode={mode} config={config} defaults={defaults}>
    <Component />
  </FormModeProvider>
)
