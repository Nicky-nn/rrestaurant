import { AddCircleOutlined, RemoveCircle } from '@mui/icons-material'
import {
  IconButton,
  InputAdornment,
  styled,
  TextField,
  type TextFieldProps,
  Typography,
} from '@mui/material'
import * as React from 'react'
import { ForwardedRef, useEffect, useRef, useState } from 'react'
import { IMaskInput } from 'react-imask'

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey[400],
  '&:disabled': {
    color: theme.palette.grey[200],
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

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
  scale?: number
}

/**
 * Control para validar datos numéricos.
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
          return onChange({
            target: {
              name: props.name,
              value,
            },
          })
        }}
      />
    )
  },
)

export type NumberInputProps = Omit<TextFieldProps, 'onChange' | 'onBlur'> & {
  value?: number | null
  min?: number
  max?: number
  step?: number
  decimalScale?: number
  unit?: string
  helperText?: string
  textAlign?:
    | '-moz-initial'
    | 'inherit'
    | 'initial'
    | 'revert'
    | 'revert-layer'
    | 'unset'
    | '-webkit-match-parent'
    | 'center'
    | 'end'
    | 'justify'
    | 'left'
    | 'match-parent'
    | 'right'
    | 'start'
  hideActionButtons?: boolean
  onChange?: (value: number | null) => void
  spinnerTabIndex?: boolean
  mostrarMensajeError?: boolean
}

/**
 * Control para datos numericos
 * @param value
 * @param min Valor minimo aceptado, default 0
 * @param max Valor maximo aceptado, default Infinity
 * @param step Step de incremento, default 1
 * @param decimalScale Decimales a mostrar, default 0
 * @param unit Unidad a mostrar, default '', Ejemplo: 'BOB, Kg'
 * @param singleUnit Unidad a mostrar cuando solo hay un valor, default '', Ejemplo: 'BOB'
 * @param helperText Texto de ayuda, default ''
 * @param mostrarMensajeError Muestra los mensajes de error, maximo y minimo, default true
 * @param textAlign
 * @param hideActionButtons
 * @param onChange
 * @param props
 * @constructor
 */
const NumberSpinnerField = React.forwardRef<HTMLDivElement, NumberInputProps>(
  function NumberSpinnerField(props, ref: ForwardedRef<HTMLDivElement>) {
    // const t = useTranslations('NumberInput')
    const {
      disabled = false,
      hideActionButtons = false,
      max = Infinity,
      min = -Infinity,
      onChange,
      size = 'small',
      slotProps,
      step = 1,
      value: valueProp,
      textAlign = 'center',
      unit,
      helperText,
      decimalScale = 2,
      spinnerTabIndex = true,
      mostrarMensajeError = true,
      ...rest
    } = props

    const intervalRef = useRef(null) // Referencia para almacenar el intervalo
    const [stateValue, setStateValue] = useState<number | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

    /**
     * Cuando se presiona una tecla
     * @param e
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const char = getKeyDownChar(e)
      if (!char)
        // Ningun caracter
        return
      const target = e.target as HTMLInputElement
      if (target.selectionStart == null || target.selectionEnd == null)
        // Ninguna seleccion
        return
      return char
    }

    /**
     * Incrementa el valor
     */
    const increment = (forceChange = false) => {
      const newValue = Number(
        (
          (stateValue != null && !Number.isNaN(stateValue) ? Number(stateValue) : 0) +
          step
        ).toFixed(decimalScale),
      )
      if (newValue > max) {
        return
      }
      setStateValue(newValue)
      if (forceChange) {
        if (onChange) onChange(newValue)
      }
    }

    /**
     * Decrementa el valor
     */
    const decrement = (forceChange = false) => {
      const newValue = Number(
        (
          (stateValue != null && !Number.isNaN(stateValue) ? Number(stateValue) : 0) -
          step
        ).toFixed(decimalScale),
      )

      if (newValue < min) {
        return
      }
      setStateValue(newValue)
      if (forceChange) {
        if (onChange) onChange(newValue)
      }
    }

    /**
     * Cuando se presiona una tecla
     * @param e
     */
    const getKeyDownChar = (e: React.KeyboardEvent): string | undefined => {
      if (e.key === 'ArrowUp') {
        if (intervalRef.current !== null) return
        increment()
        return
      } else if (e.key === 'ArrowDown') {
        if (intervalRef.current !== null) return
        decrement()
        return
      }
    }

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Limpiar el intervalo cuando se suelta la tecla
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
      // Estado final de cambio afuera
      if (onChange) {
        if (!stateValue) {
          onChange(null)
        } else {
          onChange(Number(stateValue))
        }
      }
    }

    /**
     * Actualizacion de datos y envio fuera del componente
     * @param value
     */
    const updateChange = (value: string) => {
      const formattedValue = clampNumber(value)
      // console.log(formattedValue, value.toString())
      setStateValue(formattedValue)
      // console.log(formattedValue, min, max)
      if (Number(formattedValue) < min) {
        if (mostrarMensajeError) setErrorMessage(`Valor mínimo es ${min}`)
      } else {
        if (Number(formattedValue) > max) {
          if (mostrarMensajeError) setErrorMessage('Valor maximo es ' + max)
        } else {
          setErrorMessage(undefined)
        }
      }
    }

    /**
     * Evento on change del componente
     * @param e
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateChange(e.target.value)
    }

    /******************************************************************************/
    /******************************************************************************/
    useEffect(() => {
      setStateValue(valueProp ?? null)
    }, [valueProp])

    return (
      <TextField
        {...rest}
        ref={ref}
        value={stateValue?.toString() || null} // We can't ever pass null to value because it breaks the shrink state of the label, so we pass empty string instead
        disabled={disabled}
        size={size}
        autoComplete={'off'}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        helperText={errorMessage || helperText}
        error={props.error || Number(stateValue) < min || Number(stateValue) > max}
        placeholder={props.placeholder || min.toString()}
        slotProps={{
          ...slotProps,
          input: {
            sx: {
              fontSize: '1.16em',
            },
            inputComponent: NumericFormatCustom as any,
            inputProps: {
              scale: decimalScale,
              style: {
                textAlign: textAlign,
                height: 20,
              },
            },
            startAdornment: !hideActionButtons && (
              <InputAdornment position="start" sx={{ mr: 0.7 }}>
                <StyledIconButton
                  aria-label="decrementar valor"
                  onClick={() => decrement(true)}
                  edge="start"
                  disabled={disabled || (Number(stateValue) || 0) - step < min}
                  tabIndex={spinnerTabIndex ? undefined : -1}
                >
                  <RemoveCircle />
                </StyledIconButton>
              </InputAdornment>
            ),
            endAdornment: (unit || !hideActionButtons) && (
              <InputAdornment position="end">
                {unit && (
                  <Typography
                    component={'span'}
                    fontSize={'smaller'}
                    sx={{ lineHeight: 0, mt: 0.3 }}
                  >
                    {unit}
                  </Typography>
                )}
                {!hideActionButtons && (
                  <StyledIconButton
                    aria-label="incrementar valor"
                    onClick={() => increment(true)}
                    edge="end"
                    disabled={disabled || (Number(stateValue) || 0) + step > max}
                    tabIndex={spinnerTabIndex ? undefined : -1}
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
  },
)

export default NumberSpinnerField

/**
 * Conversion y verificación de un valor a numérico
 * @param val
 */
const clampNumber = (val: any): number | null => {
  if (val === undefined) return null
  return val
}
