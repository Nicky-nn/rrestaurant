import { CheckCircle, TextIncrease } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  IconButtonProps,
  Popover,
  Stack,
  TextField,
  TextFieldProps,
} from '@mui/material'
import React, { ReactElement, useEffect, useState } from 'react'

// Definimos las props que nuestro componente aceptará
interface IconButtonTextAreaPopoverProps {
  /** Identificador único */
  id: string
  /** El valor inicial del textarea */
  initialValue: string
  /** Función que se llama al hacer clic en 'Aplicar' con el nuevo valor */
  onApply: (newValue: string) => void
  /** El icono a mostrar en el botón. Por defecto es un lápiz de edición. */
  icon?: ReactElement
  /** Props adicionales para pasar al IconButton de MUI */
  iconButtonProps?: IconButtonProps
  /** Props adicionales para pasar al TextField de MUI (ej. label, placeholder) */
  textFieldProps?: Omit<TextFieldProps, 'value' | 'onChange'>
}

/**
 * Icon Button con Popover para editar el valor
 * @param id
 * @param initialValue
 * @param onApply
 * @param icon
 * @param iconButtonProps
 * @param textFieldProps
 * @constructor
 */
export const IconButtonTextAreaPopover: React.FC<IconButtonTextAreaPopoverProps> = ({
  id,
  initialValue,
  onApply,
  icon = <TextIncrease />, // Usamos el icono por defecto si no se proporciona uno
  iconButtonProps,
  textFieldProps,
}) => {
  // Estado para el ancla del Popover (controla si está abierto y dónde)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  // Estado interno para manejar el texto *mientras* se está editando
  const [currentValue, setCurrentValue] = useState(initialValue)

  // Cuando se abre el popover
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Seteamos el botón actual como ancla para abrir el Popover
    setAnchorEl(event.currentTarget)
    // Nos aseguramos que el valor de edición sea el más reciente
    setCurrentValue(initialValue)
  }

  // Cuando se cierra el popover, no se modifica nada
  const handleClose = () => {
    setAnchorEl(null)
  }

  // Cuando se aplica, se envia el valor del input
  const handleApply = () => {
    onApply(currentValue) // Emitimos el evento con el nuevo valor
    handleClose() // Cerramos el popover
  }

  // Cuando se vacia el input text area
  const handleClear = () => {
    setCurrentValue('') // Vaciamos el estado interno
  }

  const open = Boolean(anchorEl)

  /*********************************************************************************/
  /*********************************************************************************/

  // Sincroniza el estado interno si el valor inicial cambia desde el padre
  useEffect(() => {
    setCurrentValue(initialValue)
  }, [initialValue])
  /*******************************************************************************/
  /*******************************************************************************/
  /*******************************************************************************/
  return (
    <>
      <IconButton onClick={handleOpen} {...iconButtonProps}>
        {icon}
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box
          sx={{
            p: 1.5,
            pt: textFieldProps?.label ? 2.1 : 1.7,
            alignItems: 'center',
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 350,
          }}
        >
          <TextField
            multiline
            rows={5}
            fullWidth
            variant="outlined"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            autoFocus
            sx={{
              bgcolor: 'background.paper',
              ...textFieldProps?.sx,
            }}
            {...textFieldProps}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" color={'error'} onClick={handleClose}>
              Cancelar
            </Button>
            <Button size="small" color="secondary" onClick={handleClear}>
              Vaciar
            </Button>
            <Button size="small" variant="contained" onClick={handleApply} startIcon={<CheckCircle />}>
              Aplicar
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  )
}
