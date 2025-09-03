import { Card, CardContent, CardHeader, CardProps, styled } from '@mui/material'
import { FC, ReactNode } from 'react'

import { H4 } from '../Typography'

const CardRoot = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: '12px',
  overflow: 'inherit', // Cambio realizado para mostrar los hidden selects
  '& > .MuiCardHeader-root': {
    padding: 0,
    paddingBottom: 20,
    '.MuiCardHeader-avatar': {
      marginRight: '8px',
      color: theme.palette.primary.main,
      marginTop: '-3px',
    },
    '.MuiTypography-root.MuiCardHeader-subheader': {
      // textDecoration: `underline`,
      // textDecorationThickness: 0.001,
      // textUnderlineOffset: '2px',
      // fontWeight: 500,
      marginTop: -2,
    },
  },
  '& > .MuiCardContent-root': {
    paddingTop: 0,
    paddingBottom: '0 !important',
    paddingRight: 0,
    paddingLeft: 0.5,
  },
  '& > .MuiAvatar-root': {
    backgroundColor: theme.palette.primary.light,
  },
}))

export interface SimpleCardProps extends CardProps {
  title?: string
  subtitle?: string
  childIcon?: ReactNode
  children: ReactNode
}

/**
 * SimpleCard para box con titulo y contenido
 * @param props
 * @constructor
 */
const SimpleCard: FC<SimpleCardProps> = (props: SimpleCardProps) => {
  const { children, title, subtitle, childIcon, ...others } = props

  return (
    <CardRoot variant={'outlined'} {...others}>
      {title && (
        <CardHeader
          avatar={title && childIcon && childIcon}
          title={title && <H4>{title}</H4>}
          subheader={subtitle && <span style={{ fontSize: '0.9em' }}>{subtitle}</span>}
        />
      )}

      <CardContent>{children}</CardContent>
    </CardRoot>
  )
}

export default SimpleCard
