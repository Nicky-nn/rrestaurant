import {
  DateTimePicker,
  DateTimePickerProps,
  LocalizationProvider,
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { PickerValidDate } from '@mui/x-date-pickers/models'
import React, { FunctionComponent } from 'react'

interface OwnProps extends DateTimePickerProps<PickerValidDate, boolean> {}

type Props = OwnProps

/**
 * @description Componente para seleccion de fecha y hora con formato local
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
