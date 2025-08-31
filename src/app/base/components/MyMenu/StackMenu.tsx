import { alpha, Paper, Stack, StackProps } from '@mui/material'
import React, { FC, ReactElement, ReactNode } from 'react'

interface OwnProps {
  children?: ReactElement | ReactElement[] | ReactNode | ReactNode[]
  /**
   * menu fixado, se mueve con el cursor del mause
   */
  asideSidebarFixed?: boolean
}

type Props = StackProps & OwnProps

/**
 * @description menu horizontal que se adapta a la pantalla, responsivo, para los hijos StackMenuItem
 * @author isi-template
 * @param props
 * @constructor
 */
export const StackMenu: FC<Props> = (props) => {
  const { asideSidebarFixed, ...others } = props

  return (
    <Paper
      elevation={0}
      variant="elevation"
      square
      className={asideSidebarFixed ? 'asideSidebarFixed' : ''}
      sx={{
        p: '0.1rem',
        mb: 1,
        pt: 0.7,
        background: (theme) => alpha(theme.palette.background.default, 0.5),
        backdropFilter: 'blur(1px)',
      }}
    >
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        direction="row"
        useFlexGap
        flexWrap="wrap"
        justifyContent="right"
        {...others}
      >
        {props.children}
      </Stack>
    </Paper>
  )
}
export default StackMenu
