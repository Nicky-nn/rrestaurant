import { Box, BoxProps, Typography, TypographyProps } from '@mui/material'
import React, { FunctionComponent } from 'react'

import { numberWithCommasPlaces } from '../MyInputs/NumberInput'

interface OwnProps extends TypographyProps {
  label?: string // Text antecedido al monto
  monto: number // monto a pasar
  sigla?: string // sigla de la moneda
  decimales?: number // numero de decimales, default 2
  boxProps?: BoxProps
  siglaProps?: TypographyProps
  labelProps?: TypographyProps
}

type Props = OwnProps

/**
 * Parseamos un monto con su sigla moneda
 * @param props
 * @constructor
 */
const ParseMontoMoneda: FunctionComponent<Props> = (props) => {
  const { monto, sigla, decimales, boxProps, siglaProps, label, labelProps, ...others } =
    props
  return (
    <Box {...boxProps}>
      {label && (
        <Typography
          variant={'inherit'}
          display={'inline'}
          sx={{ mr: 0.5 }}
          {...labelProps}
        >
          {label}
        </Typography>
      )}

      <Typography variant={'inherit'} display={'inline'} {...others}>
        {numberWithCommasPlaces(monto, decimales || 2)}
      </Typography>

      {sigla && (
        <Typography
          fontSize={'smaller'}
          sx={{ ml: 0.7 }}
          display={'inline'}
          {...siglaProps}
        >
          {sigla}
        </Typography>
      )}
    </Box>
  )
}

export default ParseMontoMoneda
