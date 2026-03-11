import { AddCircleOutlined, RemoveCircle } from '@mui/icons-material'
import { IconButton, InputAdornment, styled, TextField, type TextFieldProps, Typography } from '@mui/material'
import * as React from 'react'
import { ForwardedRef, useEffect, useRef, useState } from 'react'
import { IMaskInput } from 'react-imask'

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:disabled': {
    color: theme.palette.action.disabled,
  },
  '&:hover': {
    color: theme.palette.primary.main,
  },
  '&:focus': {
    color: theme.palette.primary.main,
  },
  transition: theme.transitions.create('color'),
  padding: 4.5,
}))

// =========================================================================
// ADAPTADOR PARA react-imask
// =========================================================================
interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
  scale?: number
}

/**
 * Aplicamos la mascara al tipo numeric en el input
 * @author isi-template
 */
const NumericFormatCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { scale, onChange, ...rest } = props
    return (
      <IMaskInput
        {...rest}
        inputRef={ref}
        scale={scale ?? 2}
        normalizeZeros={true}
        padFractionalZeros={true}
        thousandsSeparator={' '}
        radix={'.'}
        mapToRadix={[',']}
        mask={Number}
        unmask={true}
        onAccept={(value) => {
          onChange({ target: { name: props.name, value: value.toString() } })
        }}
      />
    )
  },
)

// =========================================================================
// INTERFACES
// =========================================================================
export type NumberInputProps = Omit<TextFieldProps, 'onChange' | 'onBlur'> & {
  value?: number | null
  min?: number
  max?: number
  step?: number
  decimalScale?: number
  unit?: string
  textAlign?: 'left' | 'center' | 'right'
  hideActionButtons?: boolean
  onChange?: (value: number | null) => void
  spinnerTabIndex?: boolean
  mostrarMensajeError?: boolean
  customEndAdornment?: React.ReactNode
  customStartAdornment?: React.ReactNode
}

/**
 * Componente principal que nos permite generar un input de tipo number con funciones de validacion, decimales, y todas las propiedades adjuntas
 * @author isi-template
 */
const NumberSpinnerField = React.forwardRef<HTMLDivElement, NumberInputProps>(function NumberSpinnerField(
  props,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    disabled = false,
    hideActionButtons = false,
    max = Infinity,
    min = -Infinity,
    onChange,
    size = 'small',
    slotProps,
    step = 1,
    value: valueProp = null, // Renombramos internamente para no confundir con el state
    textAlign = 'center',
    unit,
    helperText,
    decimalScale = 2,
    spinnerTabIndex = true,
    mostrarMensajeError = true,
    customEndAdornment,
    customStartAdornment,
    ...rest
  } = props

  // =======================================================================
  // BUFFER TRANSITORIO Y CANDADOS DE RENDIMIENTO
  // =======================================================================
  const [localValue, setLocalValue] = useState<number | null>(valueProp)
  const spinBufferRef = useRef<number | null>(valueProp)
  // Candado para saber si estamos presionando la tecla
  const isSpinningRef = useRef(false)

  // Controladores de tiempo para el clic mantenido
  const spinTimeoutRef = useRef<number | null>(null)
  const spinIntervalRef = useRef<number | null>(null)

  // Sincronizamos con el padre SOLO si el valor entrante es realmente distinto
  useEffect(() => {
    if (valueProp !== spinBufferRef.current) {
      setLocalValue(valueProp)
      spinBufferRef.current = valueProp
    }
  }, [valueProp])

  // Limpieza de memoria al desmontar el componente
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current)
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)
    }
  }, [])

  const updateBuffer = (newVal: number | null, isFinalChange: boolean) => {
    // FRENO DE BUCLE: Si el valor es exactamente el mismo, no hacemos nada
    if (newVal === spinBufferRef.current) return

    spinBufferRef.current = newVal
    setLocalValue(newVal) // Actualiza la UI instantáneamente

    // Si es un cambio final avisamos al formulario
    if (isFinalChange && onChange) {
      onChange(newVal)
    }
  }

  // Evaluamos el error visual basado en el valor actual del buffer
  const isOutOfRange = localValue !== null && (localValue < min || localValue > max)
  const dynamicHelperText =
    mostrarMensajeError && isOutOfRange
      ? localValue! < min
        ? `El valor mínimo es ${min}`
        : `El valor máximo es ${max}`
      : helperText
  // Si no hay texto de error, le pasamos un espacio en blanco (' ')
  // Esto obliga a Material-UI a mantener la altura del contenedor siempre fija.
  const finalHelperText = dynamicHelperText || ' '

  // ===== HANDLERS DE INCREMENTO / DECREMENTO =====
  const executeIncrement = (isFinalChange: boolean) => {
    const current = spinBufferRef.current ?? 0
    let next = Number((current + step).toFixed(decimalScale))
    if (next > max) next = max
    updateBuffer(next, isFinalChange)
  }

  const executeDecrement = (isFinalChange: boolean) => {
    const current = spinBufferRef.current ?? 0
    let next = Number((current - step).toFixed(decimalScale))
    if (next < min) next = min
    updateBuffer(next, isFinalChange)
  }

  // ===== HANDLERS DE BOTONES (Clic mantenido / Touch) =====
  const startSpin = (direction: 'UP' | 'DOWN') => {
    isSpinningRef.current = true // Activamos el candado para que IMask no interfiera

    // 1. Salto inmediato (como si fuera un clic normal)
    if (direction === 'UP') executeIncrement(false)
    else executeDecrement(false)

    // 2. Esperamos 400ms (Delay natural antes de empezar la repetición rápida)
    spinTimeoutRef.current = setTimeout(() => {
      // 3. Empezamos a sumar/restar a toda velocidad (cada 50 milisegundos)
      spinIntervalRef.current = setInterval(() => {
        if (direction === 'UP') executeIncrement(false)
        else executeDecrement(false)
      }, 50)
    }, 400)
  }

  const stopSpin = () => {
    isSpinningRef.current = false // Quitamos el candado

    // Detenemos los motores
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current)
    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)

    // Enviamos el valor final acumulado al formulario principal al soltar el dedo/clic
    if (onChange) {
      onChange(spinBufferRef.current)
    }
  }

  // ===== HANDLERS DE TECLADO (Mantener presionado) =====
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      isSpinningRef.current = true // Activamos el candado
      executeIncrement(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      isSpinningRef.current = true // Activamos el candado
      executeDecrement(false)
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      isSpinningRef.current = false // Quitamos el candado al soltar

      // Enviamos el valor final acumulado al formulario principal
      if (onChange) {
        onChange(spinBufferRef.current)
      }
    }
  }

  // ===== HANDLER DE ESCRITURA NORMAL (Tipeo con IMask) =====
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value
    const nextVal = valStr === '' ? null : Number(valStr)

    // Si IMask dispara esto mientras mantenemos presionada la flecha,
    // isSpinningRef será true, por lo que bloqueamos el envío final al padre.
    updateBuffer(nextVal, !isSpinningRef.current)
  }

  return (
    <TextField
      {...rest}
      ref={ref}
      value={localValue?.toString() ?? ''} // Usamos nuestro valor local rápido
      disabled={disabled}
      size={size}
      autoComplete={'off'}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onChange={handleChange}
      helperText={finalHelperText}
      error={props.error || isOutOfRange}
      placeholder={props.placeholder || min.toString()}
      slotProps={{
        ...slotProps,
        input: {
          inputComponent: NumericFormatCustom as any,
          inputProps: {
            scale: decimalScale,
            style: { textAlign },
          },
          startAdornment: (!hideActionButtons || customStartAdornment) && (
            <InputAdornment position="start" sx={{ mr: 0.7 }}>
              {customStartAdornment}
              {!hideActionButtons && (
                <StyledIconButton
                  aria-label="decrementar valor"
                  edge="start"
                  disabled={disabled || (localValue !== null && localValue - step < min)}
                  tabIndex={spinnerTabIndex ? undefined : -1}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    startSpin('DOWN')
                  }}
                  onPointerUp={stopSpin}
                  onPointerLeave={stopSpin}
                  onPointerCancel={stopSpin}
                >
                  <RemoveCircle />
                </StyledIconButton>
              )}
            </InputAdornment>
          ),
          endAdornment: (unit || !hideActionButtons || customEndAdornment) && (
            <InputAdornment position="end">
              {customEndAdornment}
              {unit && (
                <Typography component={'span'} fontSize={'smaller'} sx={{ lineHeight: 0, mt: 0.3, px: 0.5 }}>
                  {unit}
                </Typography>
              )}
              {!hideActionButtons && (
                <StyledIconButton
                  aria-label="incrementar valor"
                  edge="end"
                  disabled={disabled || (localValue !== null && localValue + step > max)}
                  tabIndex={spinnerTabIndex ? undefined : -1}
                  // ¡Usamos Pointer Events para unificar Mouse y Touch!
                  onPointerDown={(e) => {
                    e.preventDefault() // Evita perder foco
                    startSpin('UP')
                  }}
                  onPointerUp={stopSpin}
                  onPointerLeave={stopSpin}
                  onPointerCancel={stopSpin} // Corta el giro si el sistema interrumpe el gesto (ej. scroll)
                >
                  <AddCircleOutlined />
                </StyledIconButton>
              )}
            </InputAdornment>
          ),
          ...slotProps?.input,
        },
        htmlInput: {
          ...slotProps?.htmlInput,
        },
      }}
    />
  )
})

export default React.memo(NumberSpinnerField)
