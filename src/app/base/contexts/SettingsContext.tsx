import { merge } from 'lodash'
import { useEffect, useState } from 'react'

import { MatxLayoutSettings, MatxLayoutSettingsProps } from '../components/Template/MatxLayout/settings'
import SettingsContext, { SettingsProviderProps } from './settingsContext.ts'

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

  // Sincronizar data-theme en <html> al montar (leer localStorage)
  useEffect(() => {
    const isNight = localStorage.getItem('nightMode') === 'true'
    document.documentElement.setAttribute('data-theme', isNight ? 'dark' : 'light')
  }, [])

  const handleUpdateSettings = (update = {}) => {
    const merged = merge({}, currentSettings, update)
    setCurrentSettings(merged)
  }

  /**
   * Aplicamos la configuracion cuando sea dark o light
   * @param mode
   */
  const applyMode = (mode: 'light' | 'dark') => {
    const isDark = mode === 'dark'
    document.documentElement.setAttribute('data-theme', mode)
    const activeTheme = (import.meta.env.ISI_THEME as any) || 'default'
    handleUpdateSettings({
      mode,
      activeTheme: isDark ? `${activeTheme}Dark` : activeTheme,
      layout1Settings: {
        leftSidebar: {
          // theme: isDark ? `${activeTheme}Dark` : `${activeTheme}`,
          theme: `${activeTheme}Dark`,
        },
        topbar: {
          theme: isDark ? `${activeTheme}Dark` : `${activeTheme}`,
        },
      },
      footer: {
        theme: isDark ? `${activeTheme}Dark` : `${activeTheme}`,
        // theme: `${activeTheme}Dark`,
      },
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
