import 'dayjs/locale/es'

import { DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { esES } from '@mui/x-date-pickers/locales'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import React from 'react'

interface SimpleDatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  label?: string
  error?: boolean
  helperText?: string
}

/**
 * @description Genera el simple date Picker
 * @param value
 * @param onChange
 * @param label
 * @param error
 * @param helperText
 * @param others
 * @author Gonzalo
 * @constructor
 */
const SimpleDateTimePickerField: React.FC<SimpleDatePickerProps> = ({
  value,
  onChange,
  label = 'Fecha',
  error = false,
  helperText = '',
  ...others
}) => {
  dayjs.locale('es')
  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="es"
      localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <DateTimePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={(date) => onChange(date?.toDate() || null)}
        slotProps={{
          textField: {
            size: 'small',
            error,
            helperText,
          },
          field: {
            sx: {
              '& .MuiClock-pmButton': {
                display: 'none',
              },
            },
          },
        }}
        format="DD/MM/YYYY HH:mm:ss"
        ampm={false}
        {...others}
      />
    </LocalizationProvider>
  )
}

export default SimpleDateTimePickerField
