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
 * Wrapper para date picker enfocado a rangos de fechas, requiere react-datepicker
 * @param props
 * @constructor
 */
const MyDateRangePickerField: FunctionComponent<Props> = (props) => {
  const { startDate, endDate, onChange, ...others } = props
  return (
    <DatePicker
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
      {...others}
    />
  )
}

export default MyDateRangePickerField
