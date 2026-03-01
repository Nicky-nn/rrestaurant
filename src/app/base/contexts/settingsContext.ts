import { createContext, ReactNode } from 'react'

import { MatxLayoutSettings, MatxLayoutSettingsProps } from '../components/Template/MatxLayout/settings.ts'

// Aplicamos el partial a los hijos de 2do nivel
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P]
}

export interface SettingContextProps {
  settings: MatxLayoutSettingsProps
  updateSettings: (settings: DeepPartial<MatxLayoutSettingsProps>) => void
  applyMode: (mode: 'light' | 'dark') => void
}

export interface SettingsProviderProps {
  children: ReactNode | null
  settings?: MatxLayoutSettingsProps
  applyMode?: (mode: 'light' | 'dark') => void
}

const SettingsContext = createContext<SettingContextProps>({
  settings: MatxLayoutSettings,
  updateSettings: () => {},
  applyMode: (_mode: 'light' | 'dark') => {},
})

export default SettingsContext
