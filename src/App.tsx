import './App.css'

import { CheckCircleTwoTone } from '@mui/icons-material'
import { Box, CssBaseline, Typography } from '@mui/material'
import { ConfirmProvider } from 'material-ui-confirm'
import { useEffect } from 'react'
import { useRoutes } from 'react-router-dom'

import ReloadPrompt from './app/base/components/ReloadPrompt/ReloadPrompt'
import MatxTheme from './app/base/components/Template/MatxTheme/MatxTheme'
import { AppConfirmProvider } from './app/base/contexts/AppConfirmProvider.tsx'
import { BreadcrumbProvider } from './app/base/contexts/BreadcrumbContext'
import { ErrorProvider } from './app/base/contexts/ErrorProvider.tsx'
import { AuthProvider } from './app/base/contexts/JWTAuthContext'
import { SecurityProvider } from './app/base/contexts/SecurityContext'
import { SettingsProvider } from './app/base/contexts/SettingsContext.tsx'
import { appRoutes } from './app/routes/routes'

/**
 * @author isi-template
 * @constructor
 */
function App() {
  const content = useRoutes(appRoutes)
  const link = document.querySelector('link[rel="icon"]')
  const version = import.meta.env.ISI_VERSION

  const isDebugMode =
    import.meta.env.ISI_DEBUG === true ||
    import.meta.env.ISI_DEBUG === 'true' ||
    import.meta.env.ISI_DEBUG === '1'

  useEffect(() => {
    if (link) {
      if (import.meta.env.ISI_FAVICON) {
        link.setAttribute('href', import.meta.env.ISI_FAVICON)
      }
    }

    console.clear()

    // Mensaje de advertencia con estilos en la consola
    const appName = import.meta.env.ISI_TITLE || 'ISI-PAY'
    const appVersion = import.meta.env.ISI_VERSION || version
    const message = `%c ¡Atención! Estás utilizando la aplicación para ${appName}. Versión: ${appVersion}`
    const styles = [
      'color: #ff9800', // Naranja Amber
      'font-size: 1.2em',
      'font-weight: bold',
    ].join(';')

    console.log(message, styles)
  }, [version, link])

  return (
    <SettingsProvider>
      <AuthProvider>
        <BreadcrumbProvider>
          <SecurityProvider>
            <MatxTheme>
              <AppConfirmProvider
                defaultOptions={{
                  title: 'Autorización',
                  content: '¿Proceder con la solicitud?',
                  confirmationText: 'Aceptar',
                  cancellationText: 'Cancelar',
                  showInput: false,
                  disableCloseOnOverlay: false,
                }}
              >
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
                      disableRestoreFocus: true,
                      disableEnforceFocus: true,
                      'aria-hidden': false,
                    },
                    titleProps: {
                      sx: {
                        py: 1.5,
                      },
                    },
                    contentProps: {
                      dividers: true,
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
                  {isDebugMode && (
                    <Box
                      sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '140px', sm: '180px', md: '220px' },
                          fontWeight: 100,
                          color: 'rgba(0, 0, 0, 0.04)',
                          textTransform: 'uppercase',
                          letterSpacing: '30px',
                          userSelect: 'none',
                          transform: 'rotate(-45deg)',
                        }}
                      >
                        SANDBOX
                      </Typography>
                    </Box>
                  )}

                  <ErrorProvider>
                    {content}
                    <ReloadPrompt />
                  </ErrorProvider>
                </ConfirmProvider>
              </AppConfirmProvider>
            </MatxTheme>
          </SecurityProvider>
        </BreadcrumbProvider>
      </AuthProvider>
    </SettingsProvider>
  )
}

export default App
