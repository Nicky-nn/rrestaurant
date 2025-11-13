import { Box, CircularProgress } from '@mui/material'
import React, { FunctionComponent, ReactElement } from 'react'

import { Small } from '../Template/Typography.tsx'

interface OwnProps {
  mensaje?: string | ReactElement
  height?: number
}

type Props = OwnProps

/**
 * @description Loading para con circular progress
 * @author isi-template
 * @param props
 * @constructor
 */
const CircularLoading: FunctionComponent<Props> = (props) => {
  const { mensaje, height = 'auto' } = props

  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: 1,
      }}
    >
      <CircularProgress />
      {mensaje && typeof mensaje === 'string' && <Small>{mensaje}</Small>}
      {mensaje && typeof mensaje !== 'string' && mensaje}
    </Box>
  )
}

export default CircularLoading
