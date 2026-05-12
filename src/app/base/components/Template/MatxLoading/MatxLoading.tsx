import { Box, CircularProgress, styled, Typography } from '@mui/material'

import InrestoLogo from './InrestoLogo'

const useInrestoLogo = import.meta.env.ISI_INRESTO_LOGO === 'true'

const StyledLoading = styled('div')(() => ({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& .circleProgress': {
    position: 'absolute',
    left: -7,
    right: 0,
    top: 'calc(55% - 25px)',
  },
}))

const LoadingText = styled(Typography)(() => ({
  animation: 'inresto-fade-text 1.8s ease-in-out infinite',
  letterSpacing: '0.15em',
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  marginTop: 8,
}))

/**
 * @author isi-template
 * @constructor
 */
const MatxLoading = () => {
  return (
    <StyledLoading>
      <Box display="flex" flexDirection="column" alignItems="center">
        {useInrestoLogo ? (
          <>
            <InrestoLogo width={80} animated />
            <LoadingText color="text.secondary">Cargando...</LoadingText>
          </>
        ) : (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <img
              src="/assets/images/logo-circle.svg"
              alt="Cargando..."
              style={{ width: 'auto', height: 25 }}
            />
            <CircularProgress className="circleProgress" color="primary" />
          </Box>
        )}
      </Box>
    </StyledLoading>
  )
}

export default MatxLoading
