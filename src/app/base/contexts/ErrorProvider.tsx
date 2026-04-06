// ==========================================
// 2. CONTEXTO Y PROVIDER
// ==========================================

import { ExpandMore } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

import { MyGraphQlError } from '../services/GraphqlError.ts'

interface ErrorContextType {
  showError: (error: Error | MyGraphQlError | unknown) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export const useError = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError debe ser usado dentro de un ErrorProvider')
  }
  return context
}

/**
 * Proveedor de datos para la generación de excepcion de graphql
 * @param children
 * @constructor
 */
export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<Error | MyGraphQlError | null>(null)

  const showError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err)
    } else if (typeof err === 'string') {
      setError(new Error(err))
    } else {
      setError(new Error('Ha ocurrido un error desconocido'))
    }
    setOpen(true)
  }, [])

  const handleClose = () => {
    setOpen(false)
    // Opcional: limpiar el error después de la animación de cierre
    setTimeout(() => setError(null), 300)
  }

  // Extraemos propiedades de forma segura
  const errorMessage = error?.message || 'Error inesperado'
  const errorName = error?.name || 'Error'
  const errorCause = (error as MyGraphQlError)?.cause
  const errorStack = error?.stack

  // Determinamos si mostramos el acordeón (si hay info técnica)
  const hasTechnicalDetails = Boolean(errorCause || (errorStack && errorStack !== ''))

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              backgroundImage: 'none',
            },
          },
        }}
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 400, fontSize: '1.15rem' }}>
          ⚠️ Ha ocurrido un problema
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          {/* Mensaje principal */}
          <Alert severity="error" sx={{ mb: 3, fontSize: '1.05rem', borderRadius: 2 }}>
            {errorMessage}
          </Alert>

          {/* Acordeón para detalles técnicos */}
          {hasTechnicalDetails && (
            <Accordion
              variant="outlined"
              sx={{
                boxShadow: 'none',
                border: 1,
                borderColor: 'divider',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                bgcolor: 'background.default',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Información avanzada del error
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                    CÓDIGO / RUTA:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {errorName}
                  </Typography>
                </Box>

                {errorCause && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                      MENSAJE ORIGINAL DEL SERVIDOR:
                    </Typography>
                    <Typography variant="body2">{errorCause}</Typography>
                  </Box>
                )}

                {errorStack && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                      STACKTRACE:
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        p: 1.5,
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                        color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
                        borderRadius: 2,
                        overflowX: 'auto',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        border: 1,
                        borderColor: 'divider',
                        '& pre, & code': { margin: 0, fontFamily: 'inherit' },
                      }}
                      dangerouslySetInnerHTML={{ __html: errorStack }}
                    />
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} variant="contained" color="primary" disableElevation>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorContext.Provider>
  )
}
