import { DatePicker, DatePickerProps, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { PickerValidDate } from '@mui/x-date-pickers/models'
import React, { FunctionComponent } from 'react'

interface OwnProps extends DatePickerProps<PickerValidDate, boolean> {}

type Props = OwnProps

/**
 * @description Componente para seleccion de fecha con formato local
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
