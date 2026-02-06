import { CalendarToday } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material'
import { es } from 'date-fns/locale/es'
import React, { FunctionComponent, useCallback } from 'react'
import DatePicker, { DatePickerProps, registerLocale } from 'react-datepicker'

import { MuiReactDatePickerStyles } from './MuiReactDatePickerStyles.tsx'

registerLocale('es', es)

interface MuiDatePickerProps
  extends Omit<
    DatePickerProps,
    | 'onChange' // Conflicto: La librería espera (Date | [Date, Date] | null)
    | 'value' // Conflicto: La librería usa string aquí, nosotros Date object
    | 'selected' // Nosotros lo manejamos vía la prop 'value'
    | 'customInput' // Nosotros inyectamos el TextField
    | 'selectsRange' // No soportado en este wrapper
    | 'selectsMultiple' // No soportado en este wrapper
    | 'showIcon'
    | 'isClearable'
  > {
  label?: string
  value: Date | null
  onChange: (
    date: Date | null,
    event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void
  placeholderText?: string
  isError?: boolean
  showTimeInput?: boolean
  helperText?: string
  fullWidth?: boolean
  size?: TextFieldProps['size']
  showIcon?: boolean
  isClearable?: boolean
}

/**
 * Wrapper para date picker enfocado a rangos de fechas, requiere react-datepicker y date-fns
 * @author isi-template
 * @param props
 * @constructor
 */
const MyDatePickerFieldComponent: FunctionComponent<MuiDatePickerProps> = (props) => {
  const {
    label,
    value,
    onChange,
    placeholderText,
    dateFormat = 'dd/MM/yyyy',
    helperText,
    fullWidth = true,
    size = 'small',
    showIcon = true,
    isClearable = true,
    disabled,
    isError,
    ...others
  } = props

  // const ref = React.useRef<DatePicker | null>(null)
  const handleDateChange = useCallback(
    (date: any) => {
      // Garantizamos que solo propagamos fechas simples o nulos.
      // Si por error llegara un array (rango), lo ignoramos.
      if (!Array.isArray(date)) {
        onChange(date)
      }
    },
    [onChange],
  )

  // Función para limpiar
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Evita que se abra el calendario al limpiar
      onChange(null)
    },
    [onChange],
  )

  return (
    <MuiReactDatePickerStyles size={size}>
      <DatePicker
        {...others}
        showIcon={false}
        selected={value}
        dateFormat={dateFormat}
        locale={'es'}
        onChange={handleDateChange}
        isClearable={false}
        customInput={
          <TextField
            label={label}
            error={isError}
            helperText={helperText}
            fullWidth={fullWidth}
            size={size}
            variant="outlined"
            // Aseguramos que el label no se superponga
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              ...((showIcon || isClearable) && {
                input: {
                  disabled: props.disabled,
                  readOnly: props.readOnly,
                  ...(isClearable && {
                    endAdornment: (
                      <InputAdornment position="end">
                        {isClearable && value && !disabled && (
                          <IconButton
                            size="small" // Siempre small para que quepa bien
                            onClick={handleClear}
                            sx={{
                              marginRight: -0.5,
                              color: 'text.secondary',
                            }}
                            title="Limpiar fecha"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }),
                  ...(showIcon && {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday
                          fontSize={size === 'small' ? 'small' : 'medium'}
                          color={'action'}
                          sx={{ cursor: 'pointer' }}
                        />
                      </InputAdornment>
                    ),
                  }),
                },
              }),
            }}
            autoComplete="off"
          />
        }
      />
    </MuiReactDatePickerStyles>
  )
}
const MyDatePickerField = React.memo(MyDatePickerFieldComponent)
export default MyDatePickerField
