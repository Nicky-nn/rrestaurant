import { StandardTextFieldProps, TextField } from '@mui/material'
import React, { FunctionComponent } from 'react'

interface OwnProps extends StandardTextFieldProps {}

type Props = OwnProps

/**
 * @author isi-template
 * @param props
 * @constructor
 */
const FormTextField: FunctionComponent<Props> = (props) => {
  return (
    <TextField variant={'outlined'} size={'small'} fullWidth {...props}>
      {props.children}
    </TextField>
  )
}

export default FormTextField
