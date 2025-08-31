import { Box, Card, Grid, Icon, IconButton, styled, Tooltip } from '@mui/material'

import { H3 } from '../../components/Template/Typography'

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px !important',
  background: theme.palette.background.paper,
  [theme.breakpoints.down('sm')]: {
    padding: '16px !important',
  },
}))

const ContentBox = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  '& small': {
    color: theme.palette.text.secondary,
  },
  '& .icon': {
    opacity: 0.6,
    fontSize: '44px',
    color: theme.palette.primary.main,
  },
}))

const Heading = styled('h6')(({ theme }) => ({
  margin: 0,
  marginTop: '4px',
  fontWeight: '500',
  fontSize: '14px',
  color: theme.palette.primary.main,
}))

const StatCards = () => {
  return (
    <Grid container spacing={3} sx={{ mb: '24px' }}>
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <StyledCard elevation={6}>
          <ContentBox>
            <Icon className="icon">group</Icon>
            <Box ml="12px">
              <H3>Usuarios Activos</H3>
              <Heading>3</Heading>
            </Box>
          </ContentBox>
          <Tooltip title="View Details" placement="top">
            <IconButton>
              <Icon>arrow_right_alt</Icon>
            </IconButton>
          </Tooltip>
        </StyledCard>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <StyledCard elevation={6}>
          <ContentBox>
            <Icon className="icon">attach_money</Icon>
            <Box ml="12px">
              <H3>Ventas de la semana</H3>
              <Heading>9,935.84 BOB</Heading>
            </Box>
          </ContentBox>
          <Tooltip title="View Details" placement="top">
            <IconButton>
              <Icon>arrow_right_alt</Icon>
            </IconButton>
          </Tooltip>
        </StyledCard>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <StyledCard elevation={6}>
          <ContentBox>
            <Icon className="icon">store</Icon>
            <Box ml="12px">
              <H3>Estado del inventario</H3>
              <Heading>8.5% Exedentes</Heading>
            </Box>
          </ContentBox>
          <Tooltip title="View Details" placement="top">
            <IconButton>
              <Icon>arrow_right_alt</Icon>
            </IconButton>
          </Tooltip>
        </StyledCard>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <StyledCard elevation={6}>
          <ContentBox>
            <Icon className="icon">shopping_cart</Icon>
            <Box ml="12px">
              <H3>Facturado</H3>
              <Heading>305 Facturas Emitidas</Heading>
            </Box>
          </ContentBox>
          <Tooltip title="View Details" placement="top">
            <IconButton>
              <Icon>arrow_right_alt</Icon>
            </IconButton>
          </Tooltip>
        </StyledCard>
      </Grid>
    </Grid>
  );
}

export default StatCards
