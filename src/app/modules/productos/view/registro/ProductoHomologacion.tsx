import { FormControl, FormHelperText, Grid } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent, useEffect } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import Select from 'react-select'

import AlertError from '../../../../base/components/Alert/AlertError'
import AlertLoading from '../../../../base/components/Alert/AlertLoading'
import { FormTextField } from '../../../../base/components/Form'
import { MyInputLabel } from '../../../../base/components/MyInputs/MyInputLabel'
import { reactSelectStyle } from '../../../../base/components/MySelect/ReactSelect'
import SimpleCard from '../../../../base/components/Template/Cards/SimpleCard'
import { fetchSinProductoServicioPorActividad } from '../../../sin/api/sinProductoServicio.api'
import useQueryActividadesPorDocumentoSector from '../../../sin/hooks/useQueryActividadesPorDocumentoSector'
import {
  SinActividadesDocumentoSectorProps,
  SinProductoServicioProps,
} from '../../../sin/interfaces/sin.interface'
import { ProductoInputProps } from '../../interfaces/producto.interface'

interface OwnProps {
  form: UseFormReturn<ProductoInputProps>
}

type Props = OwnProps

/**
 * Homologación de productos
 * @param props
 * @constructor
 */
const ProductoHomologacion: FunctionComponent<Props> = (props) => {
  const {
    form: {
      control,
      setValue,
      getValues,
      watch,
      formState: { errors },
    },
  } = props

  // miramos los cambios realizados en actividad economica
  const actividadEconomicaWatch = watch('actividadEconomica')

  // CARGA DATOS DE ACTIVIDADES
  const { actividades, actIsError, actError, actLoading } =
    useQueryActividadesPorDocumentoSector()

  // CARGA DE DATOS DE PRODUCTOS SERVICIOS
  const {
    data: productosServicios,
    isLoading: prodServIsLoading,
    error: prodServError,
  } = useQuery<SinProductoServicioProps[], Error>({
    queryKey: ['productosServicios', actividadEconomicaWatch],
    queryFn: async () => {
      const docs = await fetchSinProductoServicioPorActividad(
        getValues('actividadEconomica.codigoActividad'),
      )
      if (docs.length > 0) {
        if (!getValues('sinProductoServicio')) setValue('sinProductoServicio', docs[0])
      }
      return docs
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
  })

  // En caso no existiera valores en actividad economica
  useEffect(() => {
    if (!actLoading && !actIsError && !actividadEconomicaWatch) {
      setValue('actividadEconomica', actividades![0])
    } else {
      setValue('actividadEconomica', null)
      setValue('sinProductoServicio', null)
    }
  }, [actLoading])

  if (actIsError) {
    return <AlertError mensaje={actError!.message} />
  }
  if (prodServError) {
    return <AlertError mensaje={prodServError.message} />
  }

  return (
    <>
      <SimpleCard title={'HOMOLOGACIÓN'}>
        <Grid container spacing={3}>
          <Grid item lg={12} md={12} xs={12}>
            {actLoading ? (
              <AlertLoading />
            ) : (
              <Controller
                name="actividadEconomica"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <MyInputLabel shrink>Actividad Económica</MyInputLabel>
                    <Select<SinActividadesDocumentoSectorProps>
                      {...field}
                      styles={reactSelectStyle(Boolean(errors.sinProductoServicio))}
                      name="actividadEconomica"
                      placeholder={'Seleccione la actividad económica'}
                      menuPosition={'fixed'}
                      value={field.value}
                      onChange={async (actividadEconomica: any) => {
                        field.onChange(actividadEconomica)
                        setValue('sinProductoServicio', null)
                      }}
                      isSearchable={false}
                      options={actividades}
                      getOptionValue={(item) => item.codigoActividad}
                      getOptionLabel={(item) =>
                        `${item.tipoActividad} - ${item.codigoActividad} - ${item.actividadEconomica}`
                      }
                    />
                    <FormHelperText>
                      {errors.sinProductoServicio?.message || ''}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            )}
          </Grid>

          <Grid item lg={12} md={12} xs={12}>
            {prodServIsLoading ? (
              <AlertLoading />
            ) : (
              <Controller
                name={'sinProductoServicio'}
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    component={'div'}
                    error={Boolean(errors.sinProductoServicio)}
                  >
                    <MyInputLabel shrink>Producto Homologado</MyInputLabel>
                    <Select<SinProductoServicioProps>
                      {...field}
                      styles={reactSelectStyle(Boolean(errors.sinProductoServicio))}
                      menuPosition={'fixed'}
                      name="sinProductoServicio"
                      placeholder={'Seleccione producto para homolgación'}
                      value={field.value || null}
                      onChange={(sinProductoServicio) => {
                        field.onChange(sinProductoServicio)
                      }}
                      options={productosServicios}
                      getOptionValue={(ps) => ps.codigoProducto}
                      getOptionLabel={(ps) =>
                        `${ps.codigoProducto} - ${ps.descripcionProducto}`
                      }
                    />
                    <FormHelperText>{errors.sinProductoServicio?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            )}
          </Grid>
          <Grid item lg={12} md={12} xs={12}>
            <Controller
              control={control}
              name={'titulo'}
              render={({ field }) => (
                <FormTextField
                  name="titulo"
                  label="Nombre Producto"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={Boolean(errors.titulo)}
                  helperText={errors.titulo?.message}
                />
              )}
            />
          </Grid>
          <Grid item lg={12} md={12} xs={12}>
            <Controller
              name={'descripcion'}
              control={control}
              render={({ field }) => (
                <FormTextField
                  name="descripcion"
                  label="Descripcion"
                  multiline
                  minRows={3}
                  maxRows={5}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Grid>
        </Grid>
      </SimpleCard>
    </>
  )
}

export default ProductoHomologacion
