import 'dayjs/locale/es.js'

import {
  DateTimePicker,
  DateTimePickerProps,
  LocalizationProvider,
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import React, { FunctionComponent } from 'react'

interface OwnProps extends DateTimePickerProps {}

type Props = OwnProps

/**
 * @description Componente para seleccion de fecha y hora con formato local
 * @author isi-template
 * @param props
 * @constructor
 */
const FormDateTimePickerField: FunctionComponent<Props> = (props) => {
  const { ...other } = props

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'es'}>
      <DateTimePicker {...other} />
    </LocalizationProvider>
  )
}

export default FormDateTimePickerField
