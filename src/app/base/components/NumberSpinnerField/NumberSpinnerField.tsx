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
import { ForwardedRef, useState } from 'react'
import { IMaskInput } from 'react-imask'

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey[500],
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
  p: 0.6,
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

type NumberInputProps = Omit<TextFieldProps, 'onChange'> & {
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
  onChange: (value: number | null) => void
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
      ...rest
    } = props

    const isControlled = valueProp !== undefined && onChange !== undefined

    // We use an internal state when the component is uncontrolled
    const [fallbackValue, setFallbackValue] = React.useState<number | null | undefined>(
      valueProp,
    )
    // const [stateValue, setStateValue] = useState<number | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const stateValue = isControlled ? valueProp : fallbackValue
    const setStateValue = isControlled ? onChange : setFallbackValue

    /**
     * Cuando se presiona una tecla
     * @param e
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const char = getKeyDownChar(e)
      if (!char)
        // No character
        return
      const target = e.target as HTMLInputElement
      if (target.selectionStart == null || target.selectionEnd == null)
        // No selection
        return
    }

    /**
     * Incrementa el valor
     */
    const increment = () => {
      const newValue =
        (stateValue != null && !Number.isNaN(stateValue) ? stateValue : min - step) + step
      if (newValue > max) {
        return
      }
      setStateValue(newValue)
    }

    /**
     * Decrementa el valor
     */
    const decrement = () => {
      // If we decrement when the input is empty, we consider the previous value to be 0
      const newValue =
        (stateValue != null && !Number.isNaN(stateValue) ? stateValue : 0) - step

      if (newValue < min) {
        return
      }
      setStateValue(newValue)
    }

    /**
     * Cuando se presiona una tecla
     * @param e
     */
    const getKeyDownChar = (e: React.KeyboardEvent): string | undefined => {
      /* Returns the event's key if it's a character. */
      if (e.key === 'ArrowUp') {
        increment()
        return
      } else if (e.key === 'ArrowDown') {
        decrement()
        return
      }
      const char = e.key
      if (char.length > 1)
        // Not character
        return
      const charCode = char.charCodeAt(0)
      if (charCode < 32 || (charCode > 126 && charCode < 160) || charCode > 255)
        // Not printable character
        return
      return char
    }

    /**
     * Cuando se pierde el foco, pendiente de implementar
     * @param e
     */
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      console.log('blue', e.target.value)
      if (e.target?.value) {
        const text = e.target?.value.replaceAll(' ', '')
        if (Number(text) < min) {
          console.log('entrando min')
          setErrorMessage('Valor mínimo es ' + min)
          onChange(null)
          return
        }
        if (Number(text) > max) {
          console.log('entrando min')
          setErrorMessage('Valor máximo es ' + max)
          onChange(null)
          return
        }
        // if (onBlur) onBlur(parseFloat(text ?? '0') ?? null)
      }
      return
    }

    /**
     * Actualizacion de datos y envio fuera del componente
     * @param value
     */
    const updateChange = (value: string) => {
      setStateValue(Number(value))
      const formattedValue = clampNumber(value, min, max, decimalScale)
      // console.log(formattedValue, value.toString())

      if (formattedValue?.toString() === value?.toString()) {
        setErrorMessage(undefined)
        onChange(formattedValue)
      } else {
        if (Number(value) < min) {
          setErrorMessage(`Valor mínimo es ${min}`)
        }

        if (Number(value) > max) {
          setErrorMessage('Valor maximo es ' + max)
        }
        // const va = Number(value)
        // console.log(va)
        onChange(null)
        setStateValue(null)
        // onChange(null)
      }
    }

    /**
     * Evento on change del componente
     * @param e
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateChange(e.target.value)
    }

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
        helperText={errorMessage || helperText}
        error={props.error || Number(stateValue) < min || Number(stateValue) > max}
        placeholder={props.placeholder || min.toString()}
        slotProps={{
          ...slotProps,
          input: {
            inputComponent: NumericFormatCustom as any,
            inputProps: {
              scale: decimalScale,
              // max: max !== Infinity ? max : undefined,
              // min: min !== -Infinity ? min : undefined,
              style: {
                textAlign: textAlign,
                height: 20,
                fontSize: 15.5,
              },
            },
            startAdornment: !hideActionButtons && (
              <InputAdornment position="start" sx={{ mr: 0.7 }}>
                <StyledIconButton
                  aria-label="decrementar valor"
                  onClick={decrement}
                  edge="start"
                  disabled={disabled || (stateValue ?? 0) - step < min}
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
                    fontSize={'small'}
                    sx={{ lineHeight: 0, mt: 0.3 }}
                  >
                    {unit}
                  </Typography>
                )}
                {!hideActionButtons && (
                  <StyledIconButton
                    aria-label="incrementar valor"
                    onClick={increment}
                    edge="end"
                    disabled={disabled || (stateValue ?? 0) + step > max}
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
 * @param min
 * @param max
 * @param decimalScale
 */
const clampNumber = (
  val: any,
  min: number = -Infinity,
  max: number = Infinity,
  decimalScale: number = 0,
): number | null => {
  let v = typeof val === 'number' ? val : Number(val)
  v = Math.min(max, Math.max(min, isNaN(v) ? 0 : v))
  return Number(v.toFixed(decimalScale))
}
