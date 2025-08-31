import { Card, Fab, Grid, Icon, lighten, styled, useTheme } from '@mui/material'
import { FC } from 'react'

const ContentBox: any = styled('div')((): any => ({
  display: 'flex',
  flexWrap: 'wra,p',
  alignItems: 'center',
}))

const FabIcon = styled(Fab)(() => ({
  width: '44px !important',
  height: '44px !important',
  boxShadow: 'none !important',
}))

const H3: FC<any> = styled('h3')(({ textcolor }: any) => ({
  margin: 0,
  fontWeight: '500',
  marginLeft: '12px',
  color: textcolor,
}))

const H1: FC<any> = styled('h1')(({ theme }) => ({
  margin: 0,
  flexGrow: 1,
  color: theme.palette.text.secondary,
}))

const Span: FC<any> = styled('span')(({ textcolor }: any) => ({
  fontSize: '13px',
  color: textcolor,
  marginLeft: '4px',
}))

const IconBox = styled('div')(() => ({
  width: 16,
  height: 16,
  overflow: 'hidden',
  borderRadius: '300px ',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  '& .icon': { fontSize: '14px' },
}))

const StatCards2 = () => {
  const { palette } = useTheme()
  const textError = palette.error.main
  const bgError = lighten(palette.error.main, 0.85)

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Card elevation={3} sx={{ p: 2 }}>
          <ContentBox>
            <FabIcon size="medium" sx={{ background: 'rgba(9, 182, 109, 0.15)' }}>
              <Icon sx={{ color: '#08ad6c' }}>trending_up</Icon>
            </FabIcon>
            <H3 textcolor={'#08ad6c'}>Ventas en relación a la semana anterior</H3>
          </ContentBox>
          <ContentBox sx={{ pt: 2 }}>
            <H1>10</H1>
            <IconBox sx={{ background: 'rgba(9, 182, 109, 0.15)' }}>
              <Icon className="icon">expand_less</Icon>
            </IconBox>
            <Span textcolor={'#08ad6c'}>(+21%)</Span>
          </ContentBox>
        </Card>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Card elevation={3} sx={{ p: 2 }}>
          <ContentBox>
            <FabIcon size="medium" sx={{ background: bgError, overflow: 'hidden' }}>
              <Icon sx={{ color: textError }}>star_outline</Icon>
            </FabIcon>
            <H3 textcolor={textError}>Ventas de mes</H3>
          </ContentBox>
          <ContentBox sx={{ pt: 2 }}>
            <H1>54,940.00 BOB</H1>
            <IconBox sx={{ background: bgError }}>
              <Icon className="icon">expand_less</Icon>
            </IconBox>
            <Span textcolor={textError}>(+21%)</Span>
          </ContentBox>
        </Card>
      </Grid>
    </Grid>
  )
}

export default StatCards2
