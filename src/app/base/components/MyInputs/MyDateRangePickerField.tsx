import { Button } from '@mui/material'
import {
  format,
  lastDayOfMonth,
  lastDayOfWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale/es'
import React, { FunctionComponent } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'

registerLocale('es', es)

interface OwnProps {
  startDate?: Date
  endDate?: Date
  onChange: (
    date: [Date | null, Date | null],
    event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void
  placeholderText?: string
}

type Props = OwnProps

/**
 * Wrapper para date picker enfocado a rangos de fechas, requiere react-datepicker y date-fns
 * @param props
 * @constructor
 */
const MyDateRangePickerField: FunctionComponent<Props> = (props) => {
  const { startDate, endDate, onChange, ...others } = props
  const ref = React.useRef<DatePicker | null>(null)
  return (
    <DatePicker
      ref={ref}
      selectsRange={true}
      showIcon={true}
      startDate={startDate}
      endDate={endDate}
      dateFormat="dd/MM/yyyy"
      locale={'es'}
      wrapperClassName={'myDatePicker'}
      onChange={(date, event) => {
        onChange(date, event)
      }}
      clearButtonTitle={'Vaciar'}
      isClearable={true}
      closeOnScroll={(e) => e.target === document}
      toggleCalendarOnIconClick
      {...others}
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
          onChange([
            startOfMonth(subMonths(new Date(), 1)),
            lastDayOfMonth(subMonths(new Date(), 1)),
          ])
          if (ref) ref.current?.setOpen(false)
        }}
      >
        {format(subMonths(new Date(), 1), 'MM/yyyy')}
      </Button>
    </DatePicker>
  )
}

export default MyDateRangePickerField
