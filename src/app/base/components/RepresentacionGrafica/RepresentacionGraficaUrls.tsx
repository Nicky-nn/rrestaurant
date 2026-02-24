import { Card, CardActionArea, CardContent, Container, Grid, Typography } from '@mui/material'
import React, { FunctionComponent } from 'react'

import { openInNewTab } from '../../../utils/helper'

interface OwnProps {
  representacionGrafica: {
    pdf: string
    xml: string
    rollo: string
    sin: string
  }
}

type Props = OwnProps

/**
 * @author isi-template
 * @param props
 * @constructor
 */
const RepresentacionGraficaUrls: FunctionComponent<Props> = (props) => {
  const {
    representacionGrafica: { pdf, xml, sin, rollo },
  } = props
  return (
    <>
      <Container>
        <Grid container spacing={2} sx={{ mt: 0.5, mb: 1 }}>
          <Grid
            size={{
              xs: 4,
              md: 3,
              lg: 3,
            }}
          >
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={() => openInNewTab(pdf)}>
                <CardContent sx={{ lineHeight: 0.5, padding: 1 }}>
                  <img
                    srcSet={`/assets/images/file-types/pdf.png?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    src={`/assets/images/file-types/pdf.png?w=164&h=164&fit=crop&auto=format`}
                    alt={'Pdf Medio Oficio'}
                    loading="eager"
                    width={'100%'}
                  />
                  <Typography variant={'caption'} color="text.secondary" gutterBottom>
                    Medio Oficio
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 4,
              md: 3,
              lg: 3,
            }}
          >
            <Card sx={{ height: '100%', padding: 0 }}>
              <CardActionArea onClick={() => openInNewTab(rollo)}>
                <CardContent sx={{ lineHeight: 0.5, padding: 1 }}>
                  <img
                    srcSet={`/assets/images/file-types/rollo.png?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    src={`/assets/images/file-types/rollo.png?w=164&h=164&fit=crop&auto=format`}
                    alt={'Pdf Rollo'}
                    loading="eager"
                    width={'100%'}
                  />
                  <Typography variant={'caption'} color="text.secondary" gutterBottom>
                    Pdf Rollo
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 4,
              md: 3,
              lg: 3,
            }}
          >
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={() => openInNewTab(xml)}>
                <CardContent sx={{ lineHeight: 0.5, padding: 1 }}>
                  <img
                    srcSet={`/assets/images/file-types/xml.png?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    src={`/assets/images/file-types/xml.png?w=164&h=164&fit=crop&auto=format`}
                    alt={'Ver XML'}
                    loading="eager"
                    width={'100%'}
                  />
                  <Typography variant={'caption'} color="text.secondary" gutterBottom>
                    Ver XML
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 4,
              md: 3,
              lg: 3,
            }}
          >
            <Card sx={{ height: '100%', padding: 0 }}>
              <CardActionArea onClick={() => openInNewTab(sin)}>
                <CardContent sx={{ lineHeight: 0.5, padding: 1 }}>
                  <img
                    srcSet={`/assets/images/file-types/sin.png?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    src={`/assets/images/file-types/sin.png?w=164&h=164&fit=crop&auto=format`}
                    alt={'Consulta Servicio de Impuestos Nacionales'}
                    loading="eager"
                    width={'100%'}
                  />
                  <Typography variant={'caption'} color="text.secondary" gutterBottom>
                    S.I.N.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default RepresentacionGraficaUrls
