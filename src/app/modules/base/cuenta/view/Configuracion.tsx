import { Grid } from '@mui/material'
import { FunctionComponent } from 'react'

import SimpleContainer from '../../../../base/components/Container/SimpleContainer'
import Breadcrumb from '../../../../base/components/Template/Breadcrumb/Breadcrumb'

interface OwnProps {}

type Props = OwnProps

const Configuracion: FunctionComponent<Props> = (props) => {
  return (
    <>
      <SimpleContainer maxWidth={'lg'}>
        <Breadcrumb routeSegments={[{ name: 'Configuración' }]} />

        <Grid container spacing={2} columnSpacing={5}>
          {/* <Grid item sm={4} xs={12}>
            <SimpleCard>
              <Box>
                Configuración de la cuenta, se registran opciones especificas del front-end en cuestión
              </Box>
            </SimpleCard>
          </Grid> */}
        </Grid>
      </SimpleContainer>
    </>
  )
}

export default Configuracion
