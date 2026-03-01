import { Alert, AlertColor, Slide, SlideProps, Snackbar, SnackbarOrigin } from '@mui/material'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

// ==========================================
// 1. TIPOS Y DEFINICIONES
// ==========================================

// Definimos el tipo de posición que solicitaste: horizontal_vertical
type HorizontalPos = 'left' | 'center' | 'right'
type VerticalPos = 'top' | 'bottom'
export type ToastPosition = `${HorizontalPos}_${VerticalPos}`

interface ToastOptions {
  position?: ToastPosition
  duration?: number
}

interface ToastProviderProps {
  children: React.ReactNode
  defaultOptions?: ToastOptions
}

interface ToastContextType {
  showToast: {
    // Cambiamos string por React.ReactNode
    (message: React.ReactNode, options?: ToastOptions & { severity?: AlertColor }): void
    // Métodos directos
    info: (message: React.ReactNode, options?: ToastOptions) => void
    success: (message: React.ReactNode, options?: ToastOptions) => void
    warning: (message: React.ReactNode, options?: ToastOptions) => void
    error: (message: React.ReactNode, options?: ToastOptions) => void
  }
}

// ==========================================
// 2. CONTEXTO Y HOOK PERSONALIZADO
// ==========================================

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider')
  }
  return context
}

// Componentes de transición para el Slider dependiendo de la dirección
const SlideTransitionLeft = (props: SlideProps) => <Slide {...props} direction="left" />
const SlideTransitionRight = (props: SlideProps) => <Slide {...props} direction="right" />
const SlideTransitionUp = (props: SlideProps) => <Slide {...props} direction="up" />
const SlideTransitionDown = (props: SlideProps) => <Slide {...props} direction="down" />

// ==========================================
// 3. TOAST PROVIDER (El motor del sistema)
// ==========================================

export const ToastProvider = ({ children, defaultOptions }: ToastProviderProps) => {
  const [open, setOpen] = useState(false)

  // Valores por defecto globales
  const fallbackPosition = defaultOptions?.position || 'right_bottom'
  const fallbackDuration = defaultOptions?.duration || 3000

  // Guardamos la configuración del toast actual, cambiando string a React.ReactNode
  const [toastConfig, setToastConfig] = useState<{
    message: React.ReactNode
    severity: AlertColor
    position: ToastPosition
    duration: number
  }>({
    message: '',
    severity: 'info',
    position: fallbackPosition,
    duration: fallbackDuration,
  })

  // Estado para controlar el tiempo. Si es null, el Toast no se cierra automáticamente.
  const [timer, setTimer] = useState<number | null>(fallbackDuration)

  // Función base que procesa todos los toasts
  const baseShowToast = useCallback(
    (message: React.ReactNode, options?: ToastOptions & { severity?: AlertColor }) => {
      const duration = options?.duration || fallbackDuration

      setToastConfig({
        message,
        severity: options?.severity || 'info',
        position: options?.position || fallbackPosition,
        duration,
      })

      setTimer(duration)
      setOpen(true)
    },
    [fallbackPosition, fallbackDuration],
  )

  // Construimos el objeto showToast con sus submétodos usando useMemo
  const showToast = useMemo(() => {
    const toastFn = (message: React.ReactNode, options?: ToastOptions & { severity?: AlertColor }) =>
      baseShowToast(message, options)

    toastFn.info = (message: React.ReactNode, options?: ToastOptions) =>
      baseShowToast(message, { ...options, severity: 'info' })
    toastFn.success = (message: React.ReactNode, options?: ToastOptions) =>
      baseShowToast(message, { ...options, severity: 'success' })
    toastFn.warning = (message: React.ReactNode, options?: ToastOptions) =>
      baseShowToast(message, { ...options, severity: 'warning' })
    toastFn.error = (message: React.ReactNode, options?: ToastOptions) =>
      baseShowToast(message, { ...options, severity: 'error' })

    return toastFn
  }, [baseShowToast])

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    // Evita que se cierre si el usuario hace clic fuera del Toast
    if (reason === 'clickaway') return
    setOpen(false)
  }

  // Funcionalidad 1: Mantener en Hover
  const handleMouseEnter = () => setTimer(null) // Pausa el temporizador
  const handleMouseLeave = () => setTimer(toastConfig.duration) // Reinicia el temporizador

  // Funcionalidad 2: Parsear la posición "horizontal_vertical"
  const getAnchorOrigin = (pos?: ToastPosition): SnackbarOrigin => {
    if (!pos) return { vertical: 'bottom', horizontal: 'right' }
    const [horizontal, vertical] = pos.split('_') as [HorizontalPos, VerticalPos]
    return { horizontal, vertical }
  }

  // Funcionalidad 4: Elegir la animación de Slide basada en la posición
  const transitionComponent = useMemo(() => {
    const pos = toastConfig.position || 'right_bottom'
    const [horizontal, vertical] = pos.split('_')

    if (horizontal === 'right') return SlideTransitionLeft // Entra desde el borde derecho
    if (horizontal === 'left') return SlideTransitionRight // Entra desde el borde izquierdo
    if (vertical === 'top') return SlideTransitionDown // Entra desde el borde superior
    return SlideTransitionUp // Entra desde el borde inferior
  }, [toastConfig.position])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={timer}
        onClose={handleClose}
        anchorOrigin={getAnchorOrigin(toastConfig.position)}
        slots={{
          transition: transitionComponent,
        }}
        onMouseEnter={handleMouseEnter} // Pausa en hover
        onMouseLeave={handleMouseLeave} // Reanuda al quitar el mouse
      >
        {/* Usamos elevation y variant="filled" para que destaque bien en Dark/Light mode */}
        <Alert
          onClose={handleClose}
          severity={toastConfig.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: '100%',
            // Control responsivo del ancho
            minWidth: { xs: '280px', sm: '300px' },
            maxWidth: { xs: '100%', sm: '400px' },
            // Evita que textos muy largos (como URLs) rompan el diseño
            wordBreak: 'break-word',
          }}
        >
          {toastConfig.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}
