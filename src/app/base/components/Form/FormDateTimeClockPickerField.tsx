import 'dayjs/locale/es.js'

import { DateTimePicker, DateTimePickerProps, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers'
import React, { FunctionComponent } from 'react'

interface OwnProps extends DateTimePickerProps {}

type Props = OwnProps

/**
 * @description Componente para seleccion de fecha y hora con formato local con fecha reloj
 * @author isi-template
 * @param props
 * @constructor
 */
const FormDateTimeClockPickerField: FunctionComponent<Props> = (props) => {
  const { ...other } = props

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'es'}>
      <DateTimePicker
        viewRenderers={{
          hours: renderTimeViewClock,
          minutes: renderTimeViewClock,
        }}
        {...other}
      />
    </LocalizationProvider>
  )
}

export default FormDateTimeClockPickerField
