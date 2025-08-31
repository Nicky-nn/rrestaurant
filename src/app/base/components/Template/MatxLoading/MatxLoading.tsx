import { Box, CircularProgress, styled } from '@mui/material'

const StyledLoading = styled('div')(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: 'auto',
    height: '25px',
  },
  '& .circleProgress': {
    position: 'absolute',
    left: -7,
    right: 0,
    top: 'calc(55% - 25px)',
  },
  '& .MuiBox-root': {
    position: 'absolute',
    top: '45%',
  },
}))

/**
 * @author isi-template
 * @constructor
 */
const MatxLoading = () => {
  return (
    <StyledLoading>
      <Box>
        <img src="/assets/images/logo-circle.svg" alt="Cargando..." />
        <CircularProgress className="circleProgress" color={'primary'} />
      </Box>
    </StyledLoading>
  )
}

export default MatxLoading
