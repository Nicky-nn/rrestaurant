import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import React, { FunctionComponent } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'

registerLocale('es', es)

interface OwnProps {
  value?: Date | null
  onChange: (
    date: Date | null,
    event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void
  placeholderText?: string
  dateFormat?: string // Formato segun la especificación de date-fns
  isError?: boolean
  showTimeInput?: boolean
}

type Props = OwnProps

/**
 * Wrapper para date picker enfocado a rangos de fechas, requiere react-datepicker y date-fns
 * @author isi-template
 * @param props
 * @constructor
 */
const MyDatePickerField: FunctionComponent<Props> = (props) => {
  const { value, onChange, dateFormat: df, isError, ...others } = props
  const dateFormat = df || 'dd/MM/yyyy'
  const ref = React.useRef<DatePicker | null>(null)
  return (
    <DatePicker
      ref={ref}
      showIcon={true}
      value={value ? format(value, dateFormat) : ''}
      dateFormat={dateFormat}
      locale={'es'}
      wrapperClassName={'myDatePicker'}
      onChange={(date, event) => {
        onChange(date, event)
      }}
      clearButtonTitle={'Vaciar'}
      isClearable={true}
      closeOnScroll={(e) => e.target === document}
      toggleCalendarOnIconClick
      className={isError ? 'myDatePickerError' : ''}
      {...others}
    />
  )
}

export default MyDatePickerField
