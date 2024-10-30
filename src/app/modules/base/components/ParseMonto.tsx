import { Box, Typography, TypographyProps } from '@mui/material'
import React, { FunctionComponent } from 'react'

import { numberWithCommasPlaces } from '../../../base/components/MyInputs/NumberInput'

interface OwnProps extends TypographyProps {
  monto: number // monto a pasar
  sigla: string // sigla de la moneda
  decimales?: number // numero de decimales, default 2
}

type Props = OwnProps

/**
 * Parseamos un monto con su sigla moneda
 * @param props
 * @constructor
 */
const ParseMonto: FunctionComponent<Props> = (props) => {
  const { monto, sigla, decimales, ...others } = props
  return (
    <Box>
      <Typography display={'inline'} {...others}>
        {numberWithCommasPlaces(monto, decimales || 2)}
      </Typography>
      <Typography variant={'caption'} sx={{ ml: 1 }} display={'inline'}>
        {sigla}
      </Typography>
    </Box>
  )
}

export default ParseMonto
