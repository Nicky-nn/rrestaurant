import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { SingleValue } from 'react-select'

import AlertError from '../../../../base/components/Alert/AlertError'
import AlertLoading from '../../../../base/components/Alert/AlertLoading'
import FormSelect from '../../../../base/components/Form/FormSelect'
import { NumeroFormat } from '../../../../base/components/Mask/NumeroFormat'
import SimpleCard from '../../../../base/components/Template/Cards/SimpleCard'
import { handleSelect } from '../../../../utils/helper'
import { apiSinUnidadMedida } from '../../../sin/api/sinUnidadMedida.api'
import { SinUnidadMedidaProps } from '../../../sin/interfaces/sin.interface'
import { ProductoInputProps } from '../../interfaces/producto.interface'

interface OwnProps {
  form: UseFormReturn<ProductoInputProps>
}

type Props = OwnProps

/**
 * @description Componente generacion Unidad medida y precio
 * @param props
 * @constructor
 */
const ProductoPrecio: FunctionComponent<Props> = (props) => {
  const {
    form: {
      control,
      setValue,
      watch,
      formState: { errors },
    },
  } = props

  const [variantesWatch, varianteWatch] = watch(['variantes', 'variante'])

  const {
    data: unidadesMedida,
    error: umError,
    isLoading: umIsLoading,
  } = useQuery<SinUnidadMedidaProps[], Error>({
    queryKey: ['unidadesMedida'],
    queryFn: async () => {
      return apiSinUnidadMedida()
    },
    refetchOnWindowFocus: false,
  })

  if (umError) {
    return <AlertError mensaje={umError.message} />
  }

  return (
    <SimpleCard title={'PRECIO - UNIDAD MEDIDA'}>
      <Grid container columnSpacing={3} rowSpacing={2}>
        <Grid item lg={12} md={12} xs={12}>
          {umIsLoading ? (
            <AlertLoading />
          ) : (
            <Controller
              control={control}
              name={'variante.unidadMedida'}
              render={({ field }) => (
                <FormSelect<SinUnidadMedidaProps>
                  formControlProps={{ sx: { mb: 1 } }}
                  inputLabel={'Unidad Medida'}
                  formHelperText={errors.variante?.unidadMedida?.message}
                  error={Boolean(errors.variante?.unidadMedida)}
                  placeholder={'Seleccione la unidad de medida'}
                  value={field.value}
                  onChange={async (unidadMedida: SingleValue<SinUnidadMedidaProps>) => {
                    field.onChange(unidadMedida)
                    setValue(
                      'variantes',
                      variantesWatch.map((vs) => ({
                        ...vs,
                        unidadMedida,
                      })),
                    )
                  }}
                  options={unidadesMedida}
                  getOptionValue={(item) => item.codigoClasificador}
                  getOptionLabel={(item) =>
                    `${item.codigoClasificador} - ${item.descripcion}`
                  }
                />
              )}
            />
          )}
        </Grid>

        <Grid item lg={4} md={4} xs={12}>
          <Controller
            control={control}
            name={'variante.precio'}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.variante?.precio)} required>
                <InputLabel>Precio</InputLabel>
                <OutlinedInput
                  label={'Precio'}
                  size={'small'}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={(e) => {
                    setValue(
                      'variantes',
                      variantesWatch.map((vs) => ({
                        ...vs,
                        precio: parseFloat(e.target.value),
                      })),
                    )
                  }}
                  inputComponent={NumeroFormat as any}
                  error={Boolean(errors.variante?.precio)}
                />
                <FormHelperText>{errors.variante?.precio?.message || ''}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item lg={4} md={4} xs={12}>
          <Controller
            control={control}
            name={'variante.precioComparacion'}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={Boolean(errors.variante?.precioComparacion)}
                required
              >
                <InputLabel>Precio de comparación</InputLabel>
                <OutlinedInput
                  {...field}
                  label={'Precio de comparación'}
                  size={'small'}
                  value={field.value}
                  onFocus={handleSelect}
                  onChange={field.onChange}
                  onBlur={(e) => {
                    setValue(
                      'variantes',
                      variantesWatch.map((vs) => ({
                        ...vs,
                        precioComparacion: isNaN(parseFloat(e.target.value))
                          ? 0
                          : parseFloat(e.target.value),
                      })),
                    )
                  }}
                  inputComponent={NumeroFormat as any}
                  inputProps={{}}
                  placeholder={'0.00'}
                  error={Boolean(errors.variante?.precioComparacion)}
                />
                <FormHelperText>
                  {errors.variante?.precioComparacion?.message ||
                    'Intro 0 si no desea registrar'}
                </FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item lg={4} md={4} xs={12}>
          <Controller
            control={control}
            name={'variante.costo'}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.variante?.costo)}>
                <InputLabel>Costo</InputLabel>
                <OutlinedInput
                  {...field}
                  label={'Costo'}
                  size={'small'}
                  value={field.value}
                  onFocus={handleSelect}
                  onChange={field.onChange}
                  onBlur={(e) => {
                    setValue(
                      'variantes',
                      variantesWatch.map((vs) => ({
                        ...vs,
                        costo: parseFloat(e.target.value),
                      })),
                    )
                  }}
                  inputComponent={NumeroFormat as any}
                  inputProps={{}}
                  placeholder={'0.00'}
                  error={Boolean(errors.variante?.costo)}
                />
                <FormHelperText>
                  {errors.variante?.costo?.message || 'Información protegida'}
                </FormHelperText>
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </SimpleCard>
  )
}

export default ProductoPrecio
