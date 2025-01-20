import { Stack } from '@mui/material'
import React, { FunctionComponent, JSX } from 'react'

interface OwnProps {
  children: JSX.Element | JSX.Element[]
}

type Props = OwnProps

const SimpleRowMenu: FunctionComponent<Props> = (props) => {
  return (
    <Stack
      justifyContent={'flex-end'}
      mt={1}
      mb={1}
      direction={{ xs: 'column', sm: 'row', md: 'row', lg: 'row' }}
      spacing={{ xs: 1, sm: 2, md: 4 }}
    >
      {props.children}
    </Stack>
  )
}

export default SimpleRowMenu
