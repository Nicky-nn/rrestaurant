import { StandardTextFieldProps, styled, TextField } from '@mui/material'
import React from 'react'

interface OwnProps extends StandardTextFieldProps {}

type Props = OwnProps

/**
 * Input field que se usa para consulta de datos en modo disabled
 */
export const FormTextConsulta = styled((props: Props) => {
  const { ...others } = props
  return (
    <TextField
      variant={'outlined'}
      size={'small'}
      InputLabelProps={{ shrink: true }}
      fullWidth
      disabled
      margin="none"
      {...others}
    >
      {props.children}
    </TextField>
  )
})(({ theme }) => ({
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.background.default,
  },
  '& .MuiFormLabel-root': {
    WebkitTextFillColor: theme.palette.text.secondary,
  },
}))
