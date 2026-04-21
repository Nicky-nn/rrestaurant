import { Button, Collapse, Divider, FormControl, FormHelperText, Grid } from '@mui/material'
import { FunctionComponent, useEffect, useState } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'

import AlertError from '../../../base/components/Alert/AlertError'
import AlertLoading from '../../../base/components/Alert/AlertLoading'
import { FormTextField } from '../../../base/components/Form'
import FormSelect from '../../../base/components/Form/FormSelect.tsx'
import { actionForm } from '../../../interfaces'
import { SinTipoDocumentoIdentidadProps } from '../../../interfaces/sin.interface'
import { isEmptyValue } from '../../../utils/helper'
import useQueryTipoDocumentoIdentidad from '../hooks/useQueryTipoDocumento'
import { ClientInputProps } from '../interfaces/client'

interface ClientFormBodyProps {
  form: UseFormReturn<ClientInputProps>
}

type Props = ClientFormBodyProps

const ClientFormBody: FunctionComponent<Props> = (props) => {
  const [openDireccion, setOpenDireccion] = useState(false)
  const { form } = props
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = form

  const { tiposDocumentoIdentidad, tdiLoading, tdiIsError, tdiError, tdIsSuccess } =
    useQueryTipoDocumentoIdentidad()

  if (tdiIsError) {
    return <AlertError mensaje={tdiError?.message!} />
  }

  useEffect(() => {
    if (tdIsSuccess) {
      if (isEmptyValue(getValues('sinTipoDocumento.codigoClasificador')))
        setValue('sinTipoDocumento', tiposDocumentoIdentidad![0])
    }
  }, [tdIsSuccess])

  return (
    <form>
      <Grid container columnSpacing={2} rowSpacing={1.5}>
        <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }} sx={{ mt: 2 }}>
          {tdiLoading ? (
            <AlertLoading />
          ) : (
            <Controller
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.sinTipoDocumento)} required>
                  <FormSelect<SinTipoDocumentoIdentidadProps>
                    name={'sinTipoDocumento'}
                    inputLabel={'Tipo documento identidad'}
                    placeholder={'Seleccione el tipo documento identidad'}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    isSearchable={false}
                    error={Boolean(errors.sinTipoDocumento)}
                    formHelperText={errors.sinTipoDocumento?.message}
                    options={tiposDocumentoIdentidad}
                    getOptionValue={(item) => item.codigoClasificador.toString()}
                    getOptionLabel={(item) => `${item.descripcion}`}
                    required
                    isDisabled={getValues('action') === actionForm.UPDATE}
                  />
                  <FormHelperText>{errors.sinTipoDocumento?.message}</FormHelperText>
                </FormControl>
              )}
              name={'sinTipoDocumento'}
              control={control}
            />
          )}
        </Grid>

        <Grid size={{ lg: 12, md: 12, xs: 12 }}>
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

        <Grid size={{ lg: 7, md: 6.5, sm: 6.5, xs: 12 }}>
          <Controller
            control={control}
            name={'nombres'}
            render={({ field }) => (
              <FormTextField
                name={'nombres'}
                label="Nombre(s)"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={Boolean(errors.nombres)}
                helperText={errors.nombres?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ lg: 5, md: 5.5, sm: 5.5, xs: 12 }}>
          <Controller
            control={control}
            name={'apellidos'}
            render={({ field }) => (
              <FormTextField
                name={'apellidos'}
                label="Apellido(s)"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={Boolean(errors.apellidos)}
                helperText={errors.apellidos?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ lg: 7, md: 6.5, sm: 6.5, xs: 12 }}>
          <Controller
            control={control}
            name={'numeroDocumento'}
            render={({ field }) => (
              <FormTextField
                name={'numeroDocumento'}
                label="Número Documento"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={Boolean(errors.numeroDocumento)}
                helperText={errors.numeroDocumento?.message}
                required
              />
            )}
          />
        </Grid>

        <Grid size={{ lg: 5, md: 5.5, sm: 5.5, xs: 12 }}>
          <Controller
            control={control}
            name={'complemento'}
            render={({ field }) => (
              <FormTextField
                name={'complemento'}
                label="Complemento"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={Boolean(errors.complemento)}
                helperText={errors.complemento?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ lg: 7, md: 6.5, sm: 6.5, xs: 12 }}>
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

        <Grid size={{ lg: 5, md: 5.5, sm: 5.5, xs: 12 }}>
          <Controller
            control={control}
            name={'telefono'}
            render={({ field }) => (
              <FormTextField
                name={'telefono'}
                label="Teléfonos"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={Boolean(errors.telefono)}
                helperText={errors.telefono?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Button variant="text" fullWidth onClick={() => setOpenDireccion(!openDireccion)}>
            {openDireccion ? 'Ocultar Dirección' : 'Añadir Dirección'}
          </Button>
          <Collapse in={openDireccion} timeout="auto" unmountOnExit sx={{ width: '100%', mt: 1 }}>
            <Grid container columnSpacing={2} rowSpacing={1.5}>
              <Grid size={{ lg: 8, md: 8, sm: 12, xs: 12 }}>
                <Controller
                  control={control}
                  name={'direccion.calle'}
                  render={({ field }) => (
                    <FormTextField
                      name={'direccion.calle'}
                      label="Calle/Avenida"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={Boolean(errors.direccion?.calle)}
                      helperText={errors.direccion?.calle?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ lg: 4, md: 4, sm: 12, xs: 12 }}>
                <Controller
                  control={control}
                  name={'direccion.numero'}
                  render={({ field }) => (
                    <FormTextField
                      name={'direccion.numero'}
                      label="Número"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={Boolean(errors.direccion?.numero)}
                      helperText={errors.direccion?.numero?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
                <Controller
                  control={control}
                  name={'direccion.barrio'}
                  render={({ field }) => (
                    <FormTextField
                      name={'direccion.barrio'}
                      label="Barrio/Zona"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={Boolean(errors.direccion?.barrio)}
                      helperText={errors.direccion?.barrio?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
                <Controller
                  control={control}
                  name={'direccion.apartamento'}
                  render={({ field }) => (
                    <FormTextField
                      name={'direccion.apartamento'}
                      label="Piso/Apartamento"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={Boolean(errors.direccion?.apartamento)}
                      helperText={errors.direccion?.apartamento?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  control={control}
                  name={'direccion.referenciasAdicionales'}
                  render={({ field }) => (
                    <FormTextField
                      name={'direccion.referenciasAdicionales'}
                      label="Referencias Adicionales"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={Boolean(errors.direccion?.referenciasAdicionales)}
                      helperText={errors.direccion?.referenciasAdicionales?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
    </form>
  )
}

export default ClientFormBody
