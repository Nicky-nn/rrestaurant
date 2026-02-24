import { merge } from 'lodash'
import React, { useState } from 'react'

import { MatxLayoutSettings, MatxLayoutSettingsProps } from '../components/Template/MatxLayout/settings'
import SettingsContext, { SettingsProviderProps } from './settingsContext.ts'

const SettingsProvider = ({ settings, children }: SettingsProviderProps) => {
  const [currentSettings, setCurrentSettings] = useState<MatxLayoutSettingsProps>(
    settings || MatxLayoutSettings,
  )

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
  }

  return (
    <SettingsContext.Provider
      value={{
        settings: currentSettings,
        updateSettings: handleUpdateSettings,
        applyMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsProvider
