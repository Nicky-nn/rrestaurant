import { styled, Theme } from '@mui/material'

interface OwnProps {
  theme: Theme
}

type Props = OwnProps

/**
 * @author isi-template
 */
export const SimpleItem = styled('div')(({ theme }: Props) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))
