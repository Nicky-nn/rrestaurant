import { CheckCircle } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputProps,
  TextField,
} from '@mui/material'
import React, {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { ContentConfirmMessage } from '../components/Dialog/ContentConfirmMessage.tsx'

// --- DEFINICIONES DE TIPO EMPRESARIALES ---
export interface AppConfirmResult {
  confirmed: boolean // Más explícito que 'confirmed'
  reason?: string
}

export interface AppConfirmOptions {
  title?: string
  // Descripción del mensaje
  description?: string | ReactNode
  // Acepta Array de strings o de Componentes heredado de ContentConfirmMessage
  steps?: (string | ReactNode)[]
  // En caso se quiera customizar
  content?: ReactNode
  confirmationText?: string
  cancellationText?: string
  confirmButtonColor?: Exclude<ButtonProps['color'], 'inherit'>
  // -- Propiedades del Input --
  showInput?: boolean // Mostrar el input?
  inputRequired?: boolean // Es obligatorio? (Valida y pone *)
  inputLabel?: string // Label personalizado
  inputPlaceholder?: string // Placeholder personalizado
  inputValue?: string // Valor inicial (opcional)
  inputHelperText?: string // Helper text
  inputProps?: InputProps // Propiedades adiconales del input

  // Deshabilita el esc y backdrop
  disableCloseOnOverlay?: boolean // Seguridad extra
}

// Props del Provider (Configuración Global)
interface AppConfirmProviderProps {
  children: ReactNode
  defaultOptions?: Partial<AppConfirmOptions> // Configuración base
}

interface AppConfirmContextType {
  requestConfirm: (options?: AppConfirmOptions) => Promise<AppConfirmResult>
}

/**
 * Dialogo de confirmacion interno, para evitar lag en inputs
 * @param open
 * @param options
 * @param onClose
 * @param onConfirm
 * @constructor
 */
const ConfirmDialogInternal: React.FC<{
  open: boolean
  options: AppConfirmOptions
  onClose: () => void
  onConfirm: (reason: string) => void
}> = memo(({ open, options, onClose, onConfirm }) => {
  const [reasonValue, setReasonValue] = useState('')
  const [reasonError, setReasonError] = useState(false)

  const { steps = [] } = options

  // Efecto para inicializar valores cuando se abre el modal
  useEffect(() => {
    if (open) {
      setReasonValue(options.inputValue || '')
      setReasonError(false)
    }
  }, [open, options.inputValue])

  // Evento click del btn y sus respectivas verificaciones
  const handleConfirmClick = async () => {
    if (options.inputRequired && !reasonValue.trim()) {
      setReasonError(true)
      return
    }
    onConfirm(reasonValue)
  }

  // Helper de visualización
  const shouldShowInput = options.showInput || options.inputRequired

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      onClose={(e, reason) => {
        if (
          options.disableCloseOnOverlay &&
          (reason === 'backdropClick' || reason === 'escapeKeyDown')
        )
          return
        onClose()
      }}
    >
      <DialogTitle sx={{ py: 1.7, fontWeight: 800 }}>Autorización</DialogTitle>

      {!options.disableCloseOnOverlay && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
      )}

      <DialogContent dividers>
        <Box sx={{ mb: shouldShowInput ? 2 : 0 }}>
          {typeof options.content === 'string' || !options.content ? (
            <ContentConfirmMessage
              title={options.title || 'Confirmación'}
              description={
                options.description ||
                (typeof options.content === 'string' ? options.content : undefined)
              }
              type={options.confirmButtonColor as any}
              steps={steps}
            />
          ) : (
            options.content
          )}
        </Box>

        {shouldShowInput && (
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            variant="outlined"
            required={options.inputRequired}
            label={
              options.inputLabel ||
              (options.inputRequired ? 'Motivo (Obligatorio)' : 'Comentarios')
            }
            placeholder={options.inputPlaceholder || 'Escriba aquí...'}
            value={reasonValue}
            onChange={(e) => {
              setReasonValue(e.target.value)
              if (options.inputRequired && e.target.value.trim()) {
                setReasonError(false)
              }
            }}
            error={reasonError}
            // LÓGICA HELPER TEXT: Error > HelperText custom > Nada
            helperText={
              reasonError
                ? 'Este campo es obligatorio para continuar.'
                : options.inputHelperText || ''
            }
            sx={{ mt: 1 }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ py: 1.7, justifyContent: 'center' }}>
        <Button onClick={onClose} color="inherit">
          {options.cancellationText || 'Cancelar'}
        </Button>

        <Button
          onClick={handleConfirmClick}
          variant="contained"
          color={options.confirmButtonColor || 'primary'}
          startIcon={<CheckCircle />}
        >
          {options.confirmationText || 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
})

// Nombre único para evitar conflictos con otras librerías
const AppConfirmContext = createContext<AppConfirmContextType | undefined>(undefined)

// Proveedor de datos
export const AppConfirmProvider: React.FC<AppConfirmProviderProps> = ({
  children,
  defaultOptions = {},
}) => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<AppConfirmOptions>({})

  const resolveRef = useRef<(value: AppConfirmResult) => void>(() => {})

  // Funcion principal inicial
  const requestConfirm = useCallback(
    (opts?: AppConfirmOptions) => {
      return new Promise<AppConfirmResult>((resolve) => {
        setOptions({ ...defaultOptions, ...(opts || {}) })
        setOpen(true)
        resolveRef.current = resolve
      })
    },
    [defaultOptions],
  )

  const handleClose = useCallback(() => {
    setOpen(false)
    // antes de resolver la promesa si fuera necesario, aunque aquí es directo.
    resolveRef.current({ confirmed: false })
  }, [])

  const handleConfirmSuccess = useCallback((reason: string) => {
    setOpen(false)
    resolveRef.current({ confirmed: true, reason })
  }, [])

  return (
    <AppConfirmContext.Provider value={{ requestConfirm }}>
      {children}
      <ConfirmDialogInternal
        open={open}
        options={options}
        onClose={handleClose}
        onConfirm={handleConfirmSuccess}
      />
    </AppConfirmContext.Provider>
  )
}

// --- HOOK EXPORTADO CON NOMBRE ÚNICO ---
export const useAppConfirm = () => {
  const context = useContext(AppConfirmContext)
  if (!context)
    throw new Error('useAppConfirm debe usarse dentro de un AppConfirmProvider')
  return context
}
