import { merge } from 'lodash'
import React, { createContext, FC, ReactElement, useState } from 'react'

import {
  MatxLayoutSettings,
  MatxLayoutSettingsProps,
} from '../components/Template/MatxLayout/settings'

interface SettingContextProps {
  settings: MatxLayoutSettingsProps
  updateSettings: any
}

type SettingsProviderProps = {
  children: ReactElement | ReactElement[] | null
  settings?: MatxLayoutSettingsProps
}

export const SettingsContext = createContext({
  settings: MatxLayoutSettings,
  updateSettings: () => {},
})

export const SettingsProvider: FC<SettingsProviderProps> = ({
  settings,
  children,
}: SettingsProviderProps) => {
  const [currentSettings, setCurrentSettings] = useState<MatxLayoutSettingsProps>(
    settings || MatxLayoutSettings,
  )

  const handleUpdateSettings = (update = {}) => {
    const marged = merge({}, currentSettings, update)
    setCurrentSettings(marged)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings: currentSettings,
        updateSettings: handleUpdateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
