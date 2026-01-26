import './App.css'

import { CheckCircleTwoTone } from '@mui/icons-material'
import { CssBaseline } from '@mui/material'
import { ConfirmProvider } from 'material-ui-confirm'
import { useEffect } from 'react'
import { useRoutes } from 'react-router-dom'

import ReloadPrompt from './app/base/components/ReloadPrompt/ReloadPrompt'
import MatxTheme from './app/base/components/Template/MatxTheme/MatxTheme'
import UxModoGlobalApplier from './app/base/components/UxModoGlobalApplier'
import { AuthProvider } from './app/base/contexts/JWTAuthContext'
import { SettingsProvider } from './app/base/contexts/SettingsContext'
import { appRoutes } from './app/routes/routes'

/**
 * @author isi-template
 * @constructor
 */
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
        <UxModoGlobalApplier />
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
              dialogActionsProps: {
                sx: { justifyContent: 'center' },
              },
              confirmationButtonProps: {
                color: 'primary',
                variant: 'contained',
                size: 'medium',
                startIcon: <CheckCircleTwoTone />,
                'aria-label': 'confirm',
                autoFocus: false,
              },
              cancellationButtonProps: {
                color: 'error',
                variant: 'text',
                size: 'medium',
                'aria-label': 'close',
                autoFocus: false,
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
