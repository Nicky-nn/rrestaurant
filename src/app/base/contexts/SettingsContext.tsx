import { isEqual, merge } from 'lodash'
import { createContext, ReactNode, useCallback, useMemo, useState } from 'react'

import { MatxLayoutSettings, MatxLayoutSettingsProps } from '../components/Template/MatxLayout/settings'

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

export const SettingsContext = createContext<SettingContextProps>({
  settings: MatxLayoutSettings,
  updateSettings: () => {},
  applyMode: (_mode: 'light' | 'dark') => {},
})

/**
 * Exportamos el provider a app.tsx
 * @param settings
 * @param children
 * @constructor
 */
export const SettingsProvider = ({ settings, children }: SettingsProviderProps) => {
  const [currentSettings, setCurrentSettings] = useState<MatxLayoutSettingsProps>(
    settings || MatxLayoutSettings,
  )

  // Memorizar la función de actualización
  const handleUpdateSettings = useCallback((update = {}) => {
    setCurrentSettings((prevSettings) => {
      const nextSettings = merge({}, prevSettings, update)
      return isEqual(prevSettings, nextSettings) ? prevSettings : nextSettings
    })
  }, [])

  // Memorizar applyMode
  const applyMode = useCallback(
    (mode: 'light' | 'dark') => {
      const isDark = mode === 'dark'
      const activeTheme = (import.meta.env.ISI_THEME as any) || 'default'

      handleUpdateSettings({
        mode,
        activeTheme: isDark ? `${activeTheme}Dark` : activeTheme,
        layout1Settings: {
          leftSidebar: { theme: `${activeTheme}Dark` },
          topbar: { theme: isDark ? `${activeTheme}Dark` : `${activeTheme}` },
        },
        footer: { theme: isDark ? `${activeTheme}Dark` : `${activeTheme}` },
      })
    },
    [handleUpdateSettings],
  )

  // Memorizar el objeto del VALUE
  const value = useMemo(
    () => ({
      settings: currentSettings,
      updateSettings: handleUpdateSettings,
      applyMode,
    }),
    [currentSettings, handleUpdateSettings, applyMode],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
