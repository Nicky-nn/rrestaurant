import { useContext } from 'react'

import { SettingsContext } from '../contexts/SettingsContext'

export default function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('el uso de useSettings requiere SettingsProvider')
  }
  return context
}
