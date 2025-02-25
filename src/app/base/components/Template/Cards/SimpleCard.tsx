import { Card, CardContent, CardHeader, CardProps, styled } from '@mui/material'
import { FC, ReactNode } from 'react'

import { H4 } from '../Typography'

const CardRoot = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: '12px',
  overflow: 'inherit', // Cambio realizado para mostrar los hidden selects
  '&>.MuiCardHeader-root': {
    padding: 0,
    paddingBottom: 10,
  },
  '&>.MuiCardContent-root': {
    padding: 0,
    paddingLeft: 0.5,
  },
  '& > .MuiCardHeader-avatar': {
    marginRight: '8px',
    color: theme.palette.primary.light,
    marginTop: '-2px',
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
          title={title && <H4>{title.toUpperCase()}</H4>}
          subheader={subtitle && subtitle}
        />
      )}

      <CardContent>{children}</CardContent>
    </CardRoot>
  )
}

export default SimpleCard
