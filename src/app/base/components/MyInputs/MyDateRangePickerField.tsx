import { CalendarToday } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import { Button, IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material'
import { format, lastDayOfMonth, lastDayOfWeek, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { es } from 'date-fns/locale/es'
import React, { FunctionComponent, useCallback } from 'react'
import DatePicker, { DatePickerProps, registerLocale } from 'react-datepicker'

import { MuiReactDatePickerStyles } from './MuiReactDatePickerStyles.tsx'

registerLocale('es', es)

/**
 * Wrapper para date picker enfocado a rangos de fechas, requiere react-datepicker y date-fns
 * version react-datepicker: 9.1.0
 * @author isi-template
 */
interface MyDateRangePickerProps extends Omit<
  DatePickerProps,
  | 'onChange' // Redefinimos para devolver [Date, Date]
  | 'selectsRange' // Siempre true
  | 'selectsMultiple' // Siempre false
  | 'startDate' // Lo pedimos explícitamente
  | 'endDate' // Lo pedimos explícitamente
  | 'selected' // No se usa en rangos (se usa start/end)
  | 'customInput' // Inyectado por nosotros
  | 'value' // Calculado automáticamente
  | 'formatMultipleDates'
  | 'showIcon'
  | 'isClearable'
> {
  startDate: Date | null
  endDate: Date | null
  onChange: (
    date: [Date | null, Date | null],
    event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void
  label?: string
  error?: boolean
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
const MyDateRangePickerFieldComponent: FunctionComponent<MyDateRangePickerProps> = (props) => {
  const {
    startDate = null,
    endDate = null,
    onChange,
    label,
    error = false,
    helperText,
    fullWidth = true,
    size = 'small',
    dateFormat = 'dd/MM/yyyy',
    showMonthYearDropdown,
    showMonthDropdown,
    showYearDropdown,
    showIcon = true,
    isClearable = true,
    disabled,
    ...others
  } = props

  const ref = React.useRef<DatePicker | null>(null)

  // Casteamos a la salida para asegurar tipos correctos a tu componente padre.
  const handleRangeChange = useCallback(
    (dates: any) => {
      if (Array.isArray(dates)) {
        const [start, end] = dates
        onChange([start, end])
      }
    },
    [onChange],
  )

  // Función para limpiar
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Evita que se abra el calendario al limpiar
      onChange([null, null])
    },
    [onChange],
  )

  return (
    <MuiReactDatePickerStyles size={size}>
      <DatePicker
        {...others}
        // Pasamos explícitamente las props que redefinimos
        selectsRange={true}
        showIcon={false}
        startDate={startDate}
        endDate={endDate}
        dateFormat={dateFormat}
        locale={'es'}
        shouldCloseOnSelect={false}
        onChange={handleRangeChange}
        clearButtonTitle={'Vaciar'}
        isClearable={false}
        closeOnScroll={(e) => e.target === document}
        toggleCalendarOnIconClick
        customInput={
          <TextField
            label={label}
            error={error}
            helperText={helperText}
            fullWidth={fullWidth}
            size={size}
            variant="outlined"
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
                        {isClearable && startDate && endDate && !disabled && (
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
      >
        <Button
          color={'primary'}
          variant={'text'}
          sx={{ pt: 0.1, pb: 0.1 }}
          size={'small'}
          fullWidth
          onClick={() => {
            onChange([new Date(), new Date()])
            if (ref) ref.current?.setOpen(false)
          }}
        >
          Hoy {format(new Date(), 'dd/MM/yyyy')}
        </Button>
        <Button
          color={'info'}
          variant={'text'}
          sx={{ pt: 0.1, pb: 0.1 }}
          size={'small'}
          fullWidth
          onClick={() => {
            onChange([
              startOfWeek(new Date(), { weekStartsOn: 1 }),
              lastDayOfWeek(new Date(), { weekStartsOn: 1 }),
            ])
            if (ref) ref.current?.setOpen(false)
          }}
        >
          Esta Semana
        </Button>
        <Button
          color={'info'}
          variant={'text'}
          sx={{ pt: 0.1, pb: 0.1 }}
          size={'small'}
          fullWidth
          onClick={() => {
            onChange([startOfMonth(new Date()), lastDayOfMonth(new Date())])
            if (ref) ref.current?.setOpen(false)
          }}
        >
          {format(new Date(), 'MM/yyyy')}
        </Button>
        <Button
          color={'info'}
          variant={'text'}
          sx={{ pt: 0.1, pb: 0.1 }}
          size={'small'}
          fullWidth
          onClick={() => {
            onChange([startOfMonth(subMonths(new Date(), 1)), lastDayOfMonth(subMonths(new Date(), 1))])
            if (ref) ref.current?.setOpen(false)
          }}
        >
          {format(subMonths(new Date(), 1), 'MM/yyyy')}
        </Button>
      </DatePicker>
    </MuiReactDatePickerStyles>
  )
}
const MyDateRangePickerField = React.memo(MyDateRangePickerFieldComponent)

export default MyDateRangePickerField
