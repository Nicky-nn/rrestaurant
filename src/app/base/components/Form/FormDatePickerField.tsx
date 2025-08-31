import 'dayjs/locale/es.js'

import { DatePicker, DatePickerProps, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import React, { FunctionComponent } from 'react'

interface OwnProps extends DatePickerProps {}

type Props = OwnProps

/**
 * @description Componente para seleccion de fecha con formato local
 * @author isi-template
 * @param props
 * @constructor
 */
const FormDatePickerField: FunctionComponent<Props> = (props) => {
  const { ...other } = props

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'es'}>
      <DatePicker {...other} />
    </LocalizationProvider>
  )
}

export default FormDatePickerField
