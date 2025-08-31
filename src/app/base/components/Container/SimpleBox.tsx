import { Box, styled } from '@mui/material'

/**
 * SimpleBox con background y borde
 * @author isi-template
 */
export const SimpleBox = styled(Box)(({ theme }) => ({
  padding: '10px 10px 10px 10px',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  margin: '0 auto',
}))

/**
 * SimpleBox sin background y borde, usado para contenedores generales
 * @author isi-template
 */
export const SimpleContainerBox = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginTop: '16px',
    marginBottom: '16px',
    paddingLeft: '10px',
    paddingRight: '10px',
  },
  [theme.breakpoints.up('md')]: {
    marginTop: '20px',
    marginBottom: '20px',
    paddingLeft: '15px',
    paddingRight: '15px',
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: '20px',
    marginBottom: '20px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: {
      marginBottom: '16px',
    },
  },
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
}))
