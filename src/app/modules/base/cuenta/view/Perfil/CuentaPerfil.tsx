import { Person } from '@mui/icons-material'
import { Chip, FormControl, Grid, TextField } from '@mui/material'
import React, { FunctionComponent } from 'react'

import SimpleCard from '../../../../../base/components/Template/Cards/SimpleCard'
import { H4 } from '../../../../../base/components/Template/Typography'
import useAuth from '../../../../../base/hooks/useAuth'

interface OwnProps {}

type Props = OwnProps

/**
 * @author isi-template
 * @param props
 * @constructor
 */
const CuentaPerfil: FunctionComponent<Props> = (props) => {
  const { user } = useAuth()
  return (
    <>
      <SimpleCard title={'PERFIL DE USUARIO'} childIcon={<Person />}>
        <Grid container spacing={2}>
          <Grid
            size={{
              lg: 6,
              md: 6,
              xs: 12,
            }}
          >
            <FormControl fullWidth>
              <TextField label="Nombres" value={user.nombres} variant="outlined" size="small" />
            </FormControl>
          </Grid>
          <Grid
            size={{
              lg: 6,
              md: 6,
              xs: 12,
            }}
          >
            <FormControl fullWidth>
              <TextField label="Apellidos" value={user.apellidos} variant="outlined" size="small" />
            </FormControl>
          </Grid>
          <Grid
            size={{
              lg: 6,
              md: 6,
              xs: 12,
            }}
          >
            <FormControl fullWidth>
              <TextField label="Cargo" value={user.cargo} variant="outlined" size="small" />
            </FormControl>
          </Grid>
          <Grid
            size={{
              lg: 6,
              md: 6,
              xs: 12,
            }}
          >
            <FormControl fullWidth>
              <TextField label="Rol Operaciones" value={user.rol} variant="outlined" size="small" />
            </FormControl>
          </Grid>
          <Grid
            size={{
              lg: 12,
              md: 12,
              xs: 12,
            }}
          >
            <H4>Restricción de accesos</H4>
            {user.dominio.map((item) => (
              <Chip key={item} label={item} variant="outlined" />
            ))}
          </Grid>
        </Grid>
      </SimpleCard>
    </>
  )
}

export default CuentaPerfil
