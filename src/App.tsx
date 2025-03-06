import './App.css'

import { CssBaseline } from '@mui/material'
import { ConfirmProvider } from 'material-ui-confirm'
import { useEffect } from 'react'
import { useRoutes } from 'react-router-dom'

import ReloadPrompt from './app/base/components/ReloadPrompt/ReloadPrompt'
import MatxTheme from './app/base/components/Template/MatxTheme/MatxTheme'
import { AuthProvider } from './app/base/contexts/JWTAuthContext'
import { SettingsProvider } from './app/base/contexts/SettingsContext'
import { appRoutes } from './app/routes/routes'

function App() {
  const content = useRoutes(appRoutes)
  const link = document.querySelector('link[rel="icon"]')

  useEffect(() => {
    if (link) {
      if (import.meta.env.ISI_FAVICON) {
        link.setAttribute('href', import.meta.env.ISI_FAVICON)
      }
    }
  }, [])

  return (
    <SettingsProvider>
      <AuthProvider>
        <MatxTheme>
          <ConfirmProvider
            defaultOptions={{
              title: 'Confirmación',
              content: '¿Confirma que desea realizar la acción?',
              allowClose: false,
              confirmationText: 'Confirmar',
              cancellationText: 'Cancelar',
              dialogProps: {
                fullWidth: true,
                maxWidth: 'xs',
              },
              confirmationButtonProps: {
                color: 'primary',
                variant: 'contained',
                size: 'small',
                sx: { mr: 1.5 },
                'aria-label': 'confirm',
              },
              cancellationButtonProps: {
                color: 'error',
                variant: 'text',
                size: 'small',
                'aria-label': 'close',
              },
              buttonOrder: ['cancel', 'confirm'],
            }}
          >
            <CssBaseline />
            {content}
            <ReloadPrompt />
          </ConfirmProvider>
        </MatxTheme>
      </AuthProvider>
    </SettingsProvider>
  )
}

export default App
