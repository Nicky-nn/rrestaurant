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
        slotProps={{
          textField: {
            fullWidth: true,
            error: error,
            helperText: helperText,
            size: 'small',
            ...(props.slotProps?.textField || { variant: 'outlined' }),
          },
        }}
      />
    </LocalizationProvider>
  )
}

export default SimpleDatePicker
