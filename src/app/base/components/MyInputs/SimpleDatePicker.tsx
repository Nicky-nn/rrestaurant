import 'dayjs/locale/es'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Dayjs } from 'dayjs'
import React from 'react'

// Omitimos value y onChange para definirlos de forma simple
interface BaseDatePickerProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
  label: string
  value: Dayjs | null
  onChange: (value: Dayjs | null) => void
  error?: boolean
  helperText?: string
}

/**
 * nuevo wrapper para simple date pikcer
 * @author isi-template 2023.3
 * @param label
 * @param value
 * @param onChange
 * @param error
 * @param helperText
 * @param props
 * @constructor
 */
const SimpleDatePicker: React.FC<BaseDatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  ...props
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <DatePicker
        {...props}
        label={label}
        value={value}
        onChange={(newValue) => onChange(newValue)}
        format="DD/MM/YYYY"
        // SlotProps es vital en v8 para pasar estilos y errores al TextField interno
        slotProps={{
          textField: {
            fullWidth: true,
            variant: 'outlined',
            error: error,
            helperText: helperText,
            size: 'small',
          },
        }}
      />
    </LocalizationProvider>
  )
}

export default SimpleDatePicker
