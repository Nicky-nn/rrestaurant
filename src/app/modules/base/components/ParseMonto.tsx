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
 * @author isi-template
 * @param props
 * @constructor
 * @deprecated use ParseMontoMoneda que reemplaza este componente
 */
const ParseMonto: FunctionComponent<Props> = (props) => {
  const { monto, sigla, decimales, ...others } = props
  return (
    <Box>
      <Typography sx={{ fontSize: '0.77rem' }} display={'inline'} {...others}>
        {numberWithCommasPlaces(monto, decimales || 2)}
      </Typography>
      <Typography
        variant={'caption'}
        sx={{ ml: 0.7, fontSize: '0.65rem' }}
        display={'inline'}
      >
        {sigla}
      </Typography>
    </Box>
  )
}

export default ParseMonto
