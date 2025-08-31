import { Alert, AlertTitle, Container, Grid } from '@mui/material'
import React, { FunctionComponent } from 'react'

import { genReplaceEmpty } from '../../../utils/helper'

interface OwnProps {
  mensaje: string
  tipo?: 'error' | 'warning' | 'info' | 'success'
}

type Props = OwnProps

const tipos = {
  error: 'Error',
  warning: 'Alerta',
  info: 'Información',
  success: 'Satisfactorio',
}

/**
 * @author isi-template
 * @param props
 * @constructor
 */
const AlertError: FunctionComponent<Props> = (props) => {
  const { mensaje, tipo } = props
  const alertTitle = genReplaceEmpty(tipos[tipo || 'error'], 'Error')
  return (
    <>
      <Container>
        <Grid container spacing={0} mt={2}>
          <Grid
            size={{
              lg: 12,
              md: 12,
              xs: 12,
            }}
          >
            <Alert severity={tipo}>
              <AlertTitle>{alertTitle}</AlertTitle>
              {mensaje}
            </Alert>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default AlertError
