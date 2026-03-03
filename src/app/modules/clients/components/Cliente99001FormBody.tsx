import { Alert, Grid, Typography } from '@mui/material'
import { FunctionComponent } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'

import { FormTextField } from '../../../base/components/Form'
import { Cliente99001InputProps } from '../interfaces/client99001'

interface Props {
  form: UseFormReturn<Cliente99001InputProps>
}

const Cliente99001FormBody: FunctionComponent<Props> = ({ form }) => {
  const {
    control,
    formState: { errors },
  } = form

  return (
    <form>
      <Grid container columnSpacing={2} rowSpacing={1.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" variant="outlined">
            <Typography variant="body2">
              <strong>Los clientes 99001</strong> son Consulados, embajadas, organismos internacionales,
              patrimonios autónomos, personal diplomático y personas extranjeras sin residencia, excepto en el
              caso de exportación de servicios turísticos.
            </Typography>
          </Alert>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            control={control}
            name={'razonSocial'}
            render={({ field }) => (
              <FormTextField
                name={'razonSocial'}
                label="Razón Social"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={Boolean(errors.razonSocial)}
                helperText={errors.razonSocial?.message}
                required
              />
            )}
          />
        </Grid>

        <Grid size={{ lg: 8, xs: 12 }}>
          <Controller
            control={control}
            name={'email'}
            render={({ field }) => (
              <FormTextField
                name={'email'}
                label="Correo Electrónico"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                required
              />
            )}
          />
        </Grid>

        <Grid size={{ lg: 4, xs: 12 }}>
          <Controller
            control={control}
            name={'codigoCliente'}
            render={({ field }) => (
              <FormTextField
                name={'codigoCliente'}
                label="Código Cliente"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={Boolean(errors.codigoCliente)}
                disabled
              />
            )}
          />
        </Grid>
      </Grid>
    </form>
  )
}

export default Cliente99001FormBody
