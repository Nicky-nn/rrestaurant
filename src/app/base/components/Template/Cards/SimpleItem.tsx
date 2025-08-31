import { Paper, styled } from '@mui/material'

/**
 * @author isi-template
 */
export const SimpleItem = styled(Paper)(({ theme }: any) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
})) as typeof Paper
