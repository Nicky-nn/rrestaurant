import { AddCircle, RemoveCircle } from '@mui/icons-material'
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  OutlinedInputProps,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'

import { NumeroMask } from '../Mask/NumeroMask'

interface NumberInputProps extends Omit<OutlinedInputProps, 'onChange'> {
  value?: number
  min?: number
  max?: number
  step?: number
  decimalScale?: number
  unit?: string
  singularUnit?: string
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
  onChange?: (value?: number) => void
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
const NumberSpinnerField: React.FC<NumberInputProps> = ({
  value,
  min = 0,
  max = Infinity,
  step = 1,
  decimalScale = 0,
  unit,
  singularUnit: singleUnit,
  helperText,
  textAlign = 'center',
  hideActionButtons = false,
  onChange,
  ...props
}) => {
  const [stateValue, setStateValue] = useState(value?.toString())
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  // Allow decimal if any of props is decimal
  // num can be Infinity: num%1 || 0
  // num%1 can give numbers like 0 and 0.1: hence length-2
  // decimalScale cannot be negative: floor to 0 with Max
  const propDecimalScale = Math.max(
    ...[min, max, step].map((num) => (num % 1 || 0).toString().length - 2),
    0,
  )
  const allowDecimal = decimalScale > 0 || propDecimalScale > 0
  // Update decimalScale to allow decimal
  decimalScale = decimalScale > 0 ? decimalScale : propDecimalScale
  // Regex to match value with
  const numberRegex = generateNumberRegex(min, max, allowDecimal)

  const formatValue = (val: any) => clampNumber(val, min, max, decimalScale)
  const getKeyDownChar = (e: React.KeyboardEvent): string | undefined => {
    /* Returns the event's key if it's a character. */

    if (e.ctrlKey || e.shiftKey || e.altKey) return
    if (e.key === 'ArrowUp') {
      updateValue(step)()
      return
    } else if (e.key === 'ArrowDown') {
      updateValue(-step)()
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

  const internalValue =
    formatValue(stateValue).toString() === stateValue && value !== undefined
      ? formatValue(value).toString()
      : stateValue

  /**
   * Actualizacion de datos y envio fuera del componente
   * @param value
   */
  const updateChange = (value: string) => {
    setStateValue(value)
    setErrorMessage(undefined)
    const formattedValue = formatValue(value)
    if (formattedValue?.toString() === value?.toString()) onChange?.(formattedValue)
    else onChange?.(undefined)
  }

  /**
   * Actualizacion del valor
   * @param diff
   */
  const updateValue = (diff: number) => () =>
    updateChange(formatValue(formatValue(internalValue) + diff).toString())

  /**
   * Cuando se cambia el valor del input
   * @param e
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateChange(e.target.value)

  /**
   * Cuando se pega el contenido externo
   * @param e
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData?.getData('Text').replaceAll(' ', '')
    console.log('paste', text, max, min, text?.trim())
    if (!text?.trim().match(numberRegex)) {
      setErrorMessage('Entrada inválida')
      e.preventDefault()
    } else if (Number(text?.trim()) < min) {
      setErrorMessage('Valor mínimo es ' + min)
      e.preventDefault()
    } else if (Number(text?.trim()) > max) {
      console.log('a')
      setErrorMessage('Valor máximo es ' + max)
      e.preventDefault()
    }
  }

  // /**
  //  * Cuando se pierde el foco
  //  * @param e
  //  */
  // const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  //   console.log('blue', e.target.value)
  //   updateChange(formatValue(e.target.value).toString())
  // }

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
    const resultingStr =
      target.value.substring(0, target.selectionStart).replaceAll(' ', '') +
      char.replaceAll(' ', '') +
      target.value.substring(target.selectionEnd).replaceAll(' ', '')
    if (!resultingStr.match(numberRegex)) {
      setErrorMessage('Entrada inválida')
      e.preventDefault()
    } else if (Number(resultingStr) < min) {
      setErrorMessage('Valor minimo es ' + min)
      e.preventDefault()
    } else if (Number(resultingStr) > max) {
      setErrorMessage('Valor maximo es ' + max)
      e.preventDefault()
    }
  }

  props ??= {}
  props.inputProps ??= {}
  props.inputProps.style ??= {}
  props.inputProps.style.textAlign ??= textAlign
  props.inputProps.style.fontSize ??= 16
  props.inputProps.style.height ??= 20
  props.inputProps.scale ??= decimalScale
  props.inputProps.min ??= min
  props.placeholder ??= Math.min(max, Math.max(min, 0)).toFixed(decimalScale).toString()
  const formControlProps = getFormControlProps(props)

  hideActionButtons = hideActionButtons || props.readOnly || false

  singleUnit ??= unit
  unit ??= singleUnit

  return (
    <Box>
      <FormControl
        {...formControlProps}
        variant="outlined"
        error={props.error || Number(stateValue) < min || Number(stateValue) > max}
      >
        <InputLabel shrink htmlFor="number-input">
          {props.label}
        </InputLabel>
        <OutlinedInput
          notched
          error={props.error || Number(stateValue) < min || Number(stateValue) > max}
          {...props}
          value={internalValue?.toString() || ''}
          id="number-input"
          onChange={handleChange}
          // onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          autoComplete={'off'}
          inputComponent={NumeroMask as any}
          startAdornment={
            !hideActionButtons ? (
              <InputAdornment position="start" sx={{ mr: 0.7 }}>
                <IconButton
                  aria-label="decrease value"
                  onClick={updateValue(-step)}
                  edge="start"
                  disabled={props.disabled || formatValue(internalValue) <= min}
                  sx={{
                    color: (theme) => props.color || theme.palette.grey[500],
                    '&:hover': {
                      color: (theme) => props.color || theme.palette.primary.main,
                    },
                    '&:focus': {
                      color: (theme) => props.color || theme.palette.primary.main,
                    },
                    transition: (theme) => theme.transitions.create('color'),
                    p: 0.6,
                  }}
                >
                  <RemoveCircle />
                </IconButton>
              </InputAdornment>
            ) : undefined
          }
          endAdornment={
            (unit || !hideActionButtons) && (
              <InputAdornment position="end" sx={{ ml: 0.7 }}>
                {unit && (
                  <Typography fontSize={'small'} sx={{ lineHeight: 0 }}>
                    {formatValue(internalValue) === 1 ? singleUnit : unit}
                  </Typography>
                )}
                {!hideActionButtons && (
                  <IconButton
                    aria-label="increase value"
                    onClick={updateValue(step)}
                    edge="end"
                    disabled={props.disabled || formatValue(internalValue) >= max}
                    color={undefined}
                    sx={{
                      color: (theme) => props.color || theme.palette.grey[500],
                      '&:hover': {
                        color: (theme) => props.color || theme.palette.primary.main,
                      },
                      '&:focus': {
                        color: (theme) => props.color || theme.palette.primary.main,
                      },
                      transition: (theme) => theme.transitions.create('color'),
                      p: 0.6,
                    }}
                  >
                    <AddCircle />
                  </IconButton>
                )}
              </InputAdornment>
            )
          }
        />
        {(helperText || errorMessage) && (
          <FormHelperText>{helperText || errorMessage}</FormHelperText>
        )}
      </FormControl>
    </Box>
  )
}

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
): number => {
  let v = typeof val === 'number' ? val : Number(val)
  v = Math.min(max, Math.max(min, isNaN(v) ? 0 : v))
  return Number(v.toFixed(decimalScale))
}

/**
 * Generacion de expresion regular para validacion de datos numericos
 * @param min
 * @param max
 * @param allowDecimal
 */
const generateNumberRegex = (min: number, max: number, allowDecimal: boolean): RegExp => {
  const floatRegexStr = '(\\.[0-9]*)?'
  const negativeIntRegexStr = '-[0-9]*'
  const positiveIntRegexStr = '[0-9]+'
  const positiveOrNegativeIntRegexStr = '-?[0-9]*'

  let regexStr = '^'
  if (max < 0) regexStr += negativeIntRegexStr
  else if (min > 0) regexStr += positiveIntRegexStr
  else regexStr += positiveOrNegativeIntRegexStr
  if (allowDecimal) regexStr += floatRegexStr
  regexStr += '$'
  return new RegExp(regexStr)
}

/**
 * Generacion de propiedades para el componente de formulario
 * @param props
 */
const getFormControlProps = (props: any) => {
  return {
    color: props.color,
    disabled: props.disabled,
    error: props.error,
    fullWidth: props.fullWidth,
    required: props.required,
    variant: props.variant,
  }
}
