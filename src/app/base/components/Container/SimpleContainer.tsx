import { Container, ContainerProps, styled } from '@mui/material'

interface Props extends ContainerProps {}

/**
 * @description SimpleContainer modificado a container
 */
const SimpleContainer = styled((props: Props) => {
  const { ...other } = props
  return <Container maxWidth={'xl'} fixed {...other} />
})(({ theme }) => ({
  marginTop: '30px',
  marginBottom: '30px',
  [theme.breakpoints.up('xl')]: {
    paddingLeft: '35px',
    paddingRight: '35px',
  },
  [theme.breakpoints.down('sm')]: {
    marginTop: '16px',
    marginBottom: '16px',
  },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: {
      marginBottom: '16px',
    },
  },
}))
export default SimpleContainer
