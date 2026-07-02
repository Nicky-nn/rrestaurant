import { TextIncreaseOutlined } from '@mui/icons-material'
import {
  Box,
  Button,
  ButtonProps,
  Divider,
  IconButton,
  IconButtonProps,
  Popover,
  Stack,
  TextField,
} from '@mui/material'
import React, { forwardRef, MouseEvent, ReactNode, useEffect, useState } from 'react'

// Definimos la interfaz de las propiedades
export interface PopoverTextoProps {
  /** Nombre del input */
  name: string
  /** Value del input, puede ser inyectado por RHF */
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void // Inyectado por RHF
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void // Inyectado por RHF
  /** Titulo que se añade como nota sobre el btn */
  title?: string
  /** Error de estado */
  error?: boolean
  /** Mensaje de error, incluso usando RHF */
  helperText?: ReactNode
  /** Mostrar como icono?, default: true */
  isIcon?: boolean
  /** Nodo del icono: default: TextIncreaseOutlined */
  icon?: ReactNode
  /** Si es Btn, el nombre del mismo */
  buttonText?: string
  variant?: ButtonProps['variant'] // Variante del botón
  color?: ButtonProps['color'] // Color del tema
  placeholder?: string // Texto guía
  disabled?: boolean // Estado deshabilitado
  buttonProps?: Omit<ButtonProps, 'onClick'>
  iconButtonProps?: Omit<IconButtonProps, 'onClick'>
}

/**
 * Componente principal utilizando forwardRef para compatibilidad con react-hook-form
 * NOTA: Se cambió HTMLDivElement a HTMLInputElement para mejor mapeo del inputRef
 * Componente reusable que permite generar un popover con un TextField, con sus deferentes opciones de control
 * @autor isi-template
 */
export const PopoverTexto = forwardRef<HTMLInputElement, PopoverTextoProps>(
  (
    {
      name,
      value,
      onChange,
      onBlur,
      error,
      helperText,
      isIcon = true,
      icon = <TextIncreaseOutlined />,
      buttonText = 'Añadir texto',
      variant = 'outlined',
      color = 'primary',
      placeholder = 'Escribe aquí...',
      disabled = false,
      buttonProps,
      iconButtonProps,
      title,
      ...props
    },
    ref,
  ) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    // BÚFER: Estado local para no afectar a React-Hook-Form hasta que se pulse "Aplicar"
    const [localValue, setLocalValue] = useState<string>(value || '')

    // Sincronizar el valor inicial si cambia desde fuera (por ejemplo, al resetear el formulario)
    useEffect(() => {
      if (!anchorEl) {
        setLocalValue(value || '')
      }
    }, [value, anchorEl])

    const handleOpen = (event: MouseEvent<HTMLElement>) => {
      setLocalValue(value || '') // Reinicia el localValue al valor actual de RHF al abrir
      setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
      setAnchorEl(null)
      // Notificamos onBlur a RHF al cerrar el Popover para efectos de validación
      if (onBlur) {
        const fakeEvent = { target: { name, value } } as unknown as React.FocusEvent<HTMLInputElement>
        onBlur(fakeEvent)
      }
    }

    // ACCIÓN 1: Cancelar
    const handleCancelar = () => {
      // Simplemente cerramos, ignorando el `localValue`
      handleClose()
    }

    // ACCIÓN 2: Vaciar
    const handleVaciar = () => {
      setLocalValue('')
    }

    // ACCIÓN 3: Aplicar
    const handleAplicar = () => {
      if (onChange) {
        // Creamos un evento sintético para que react-hook-form lo entienda como un input nativo
        const fakeEvent = {
          target: {
            name,
            value: localValue,
          },
        } as React.ChangeEvent<HTMLInputElement>

        onChange(fakeEvent)
      }
      handleClose() // Cierra después de aplicar
    }

    const open = Boolean(anchorEl)
    const id = open ? `popover-texto-${name}` : undefined

    // Para mostrar en el botón, si el texto es muy largo, lo truncamos un poco
    const displayValue = value && value.length > 30 ? `${value.substring(0, 30)}...` : value
    const displayText = value ? displayValue : buttonText

    return (
      <>
        {/* COMPONENTE ANCLA */}
        {isIcon ? (
          <IconButton
            title={title}
            aria-describedby={id}
            color={error ? 'error' : color}
            disabled={disabled}
            {...iconButtonProps}
            onClick={handleOpen}
          >
            {icon}
          </IconButton>
        ) : (
          <Button
            title={title}
            startIcon={value ? <TextIncreaseOutlined /> : icon}
            variant={variant}
            color={error ? 'error' : color}
            disabled={disabled}
            aria-describedby={id}
            {...buttonProps}
            sx={{
              textTransform: 'none',
              justifyContent: 'flex-start',
              textAlign: 'left',
              ...buttonProps?.sx,
            }}
            onClick={handleOpen}
          >
            {displayText}
          </Button>
        )}

        {/* POPOVER FLOTANTE */}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                width: { xs: 'calc(100vw - 32px)', sm: 380 },
                maxWidth: '100%',
                borderRadius: 2,
                boxShadow: 4,
                overflow: 'hidden',
              },
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <TextField
              inputRef={ref}
              multiline
              minRows={4}
              maxRows={8}
              name={name}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              placeholder={placeholder}
              error={error}
              helperText={helperText}
              autoFocus // Enfoca al abrir el popover
              fullWidth
              size="small"
              {...props}
            />
          </Box>

          <Divider />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            sx={{ p: 1, bgcolor: 'background.default' }}
          >
            <Button
              size="small"
              color="error"
              onClick={handleVaciar}
              disabled={!localValue}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Vaciar
            </Button>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <Button
                size="small"
                color="inherit"
                onClick={handleCancelar}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Cancelar
              </Button>
              <Button
                size="small"
                variant="contained"
                color={color}
                onClick={handleAplicar}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Aplicar
              </Button>
            </Stack>
          </Stack>
        </Popover>
      </>
    )
  },
)

// Para que las DevTools de React muestren un nombre más legible
PopoverTexto.displayName = 'PopoverTexto'
