import { yupResolver } from '@hookform/resolvers/yup'
import { Key } from '@mui/icons-material'
import { Button, FormControl, Grid, TextField } from '@mui/material'
import React, { FunctionComponent } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import SimpleCard from '../../../../../base/components/Template/Cards/SimpleCard'
import { notSuccess } from '../../../../../utils/notification'
import { swalAsyncConfirmDialog, swalException } from '../../../../../utils/swal'
import { apiUsuarioCambiarPassword } from '../../api/usuarioCambiarPassword.api'
import { UsuarioCambiarPasswordInputProps } from '../../interfaces/cuenta.interface'
import { cambiarPasswordValidationSchema } from '../../validator/cambiarPassword.validator'

interface OwnProps {}

type Props = OwnProps

/**
 * Módulo para cambiar la contraseña del usuario
 * @author isi-template
 * @param props
 * @constructor
 */
const CuentaPassword: FunctionComponent<Props> = (props) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      password: '',
      nuevoPassword: '',
      nuevoPassword2: '',
    },
    resolver: yupResolver(cambiarPasswordValidationSchema),
  })

  const onSubmit: SubmitHandler<UsuarioCambiarPasswordInputProps> = async (values) => {
    await swalAsyncConfirmDialog({
      preConfirm: async () => {
        return apiUsuarioCambiarPassword(values).catch((err) => {
          swalException(err)
          return false
        })
      },
      text: '¿Confirma que desea cambiar la contraseña?',
    }).then((resp) => {
      if (resp.isConfirmed) {
        notSuccess(
          'Se ha cambiado la contraseña correctamente, esta se aplica a partir del próximo reinicio de sesión',
        )
      }
    })
  }

  const onError = (errors: any, e: any) => console.log(errors, e)

  return (
    <>
      <SimpleCard title={'CAMBIAR CONTRASEÑA'} childIcon={<Key />}>
        <Grid container spacing={2}>
          <Grid
            size={{
              lg: 6,
              md: 6,
              xs: 12,
            }}
          >
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <Grid container spacing={2} rowSpacing={3}>
                <Grid size={12}>
                  <Controller
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <TextField
                          name={'password'}
                          type={'password'}
                          label="Ingrese su contraseña"
                          value={field.value}
                          variant="outlined"
                          size="small"
                          onChange={field.onChange}
                          error={Boolean(errors.password)}
                          helperText={errors.password?.message || ''}
                        />
                      </FormControl>
                    )}
                    name={'password'}
                  />
                </Grid>
                <Grid size={12}>
                  <Controller
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <TextField
                          name={'nuevoPassword'}
                          type={'password'}
                          label="Ingrese su nueva contraseña"
                          value={field.value}
                          variant="outlined"
                          size="small"
                          onChange={field.onChange}
                          error={Boolean(errors.nuevoPassword)}
                          helperText={errors.nuevoPassword?.message || ''}
                        />
                      </FormControl>
                    )}
                    name={'nuevoPassword'}
                    control={control}
                  />
                </Grid>
                <Grid size={12}>
                  <Controller
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <TextField
                          name={'nuevoPassword2'}
                          type={'password'}
                          label="Confirme su nueva contraseña"
                          value={field.value}
                          variant="outlined"
                          size="small"
                          onChange={field.onChange}
                          error={Boolean(errors.nuevoPassword2)}
                          helperText={errors.nuevoPassword2?.message || ''}
                        />
                      </FormControl>
                    )}
                    name={'nuevoPassword2'}
                    control={control}
                  />
                </Grid>

                <Grid size={12}>
                  <Button variant={'contained'} type={'submit'}>
                    Guardar Cambios
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
          <Grid
            size={{
              lg: 6,
              md: 6,
              xs: 12,
            }}
          ></Grid>
        </Grid>
      </SimpleCard>
    </>
  )
}

export default CuentaPassword
