import { Card, CardActionArea, CardContent, Container, Grid, Typography } from '@mui/material'
import React, { FunctionComponent } from 'react'

interface OwnProps {
  onSelected: (value: 'pdf' | 'rollo') => void
}

type Props = OwnProps

const TipoDeDescarga: FunctionComponent<Props> = (props) => {
  const { onSelected } = props

  return (
    <Container>
      <Grid container spacing={2} sx={{ mt: 0.5, mb: 1, justifyContent: 'center' }}>
        <Grid
          size={{
            xs: 6,
            md: 6,
            lg: 6,
          }}
        >
          <Card sx={{ height: '100%' }}>
            <CardActionArea onClick={() => onSelected('pdf')}>
              <CardContent sx={{ lineHeight: 0.5, padding: 1, textAlign: 'center' }}>
                <img
                  srcSet={`/assets/images/file-types/pdf.png?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                  src={`/assets/images/file-types/pdf.png?w=164&h=164&fit=crop&auto=format`}
                  alt={'Pdf Medio Oficio'}
                  loading="eager"
                  width={'100%'}
                  style={{ maxWidth: '80px', margin: '0 auto' }}
                />
                <Typography
                  variant={'caption'}
                  color="text.secondary"
                  gutterBottom
                  display="block"
                  sx={{ mt: 1 }}
                >
                  Documento PDF
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 6,
            md: 6,
            lg: 6,
          }}
        >
          <Card sx={{ height: '100%', padding: 0 }}>
            <CardActionArea onClick={() => onSelected('rollo')}>
              <CardContent sx={{ lineHeight: 0.5, padding: 1, textAlign: 'center' }}>
                <img
                  srcSet={`/assets/images/file-types/rollo.png?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                  src={`/assets/images/file-types/rollo.png?w=164&h=164&fit=crop&auto=format`}
                  alt={'Pdf Rollo'}
                  loading="eager"
                  width={'100%'}
                  style={{ maxWidth: '80px', margin: '0 auto' }}
                />
                <Typography
                  variant={'caption'}
                  color="text.secondary"
                  gutterBottom
                  display="block"
                  sx={{ mt: 1 }}
                >
                  Formato Rollo
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default TipoDeDescarga
