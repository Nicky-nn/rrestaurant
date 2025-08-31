import { Box, LinearProgress, Skeleton } from '@mui/material'
import React, { FunctionComponent, useEffect } from 'react'

import { Small } from '../Template/Typography'

interface OwnProps {
  mensaje?: string
  tipo?: 'error' | 'warning' | 'info' | 'success'
}

type Props = OwnProps

/**
 * @description Loading para randerización de componentes
 * @author isi-template
 * @param props
 * @constructor
 */
const AlertLoading: FunctionComponent<Props> = (props) => {
  const { mensaje, tipo } = props
  const [progress, setProgress] = React.useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0
        }
        const diff = Math.random() * 10
        return Math.min(oldProgress + diff, 100)
      })
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <Box sx={{ width: '100%' }}>
      <Small>{mensaje}</Small>
      <Skeleton animation="pulse" variant={'rectangular'} height={mensaje ? 15 : 35} />
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  )
}

export default AlertLoading
