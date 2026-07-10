import 'dayjs/locale/es.js'

import { Grid, TextField } from '@mui/material'
import React, { FunctionComponent } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { EntradaPorCajaInputProp } from '../../interfaces'
import SimpleCard from '../../../../base/components/Template/Cards/SimpleCard.tsx'
import FormSelect from '../../../../base/components/Form/FormSelect.tsx'
import { KeyValueProp, KeyValuePropV2 } from '../../../../base/interfaces/base.ts'
import { apiTipoDocumentoListado, TipoDocumentoProp } from '../../../../interfaces/tipoDocumento.ts'
import FormDateTimePickerField from '../../../../base/components/Form/FormDateTimePickerField.tsx'
import { HorizontalSplitOutlined } from '@mui/icons-material'

interface OwnProps {
  responsables: KeyValuePropV2<string, string>[]
}

type Props = OwnProps

/**
 * @description Entrada de datos generales
 * @constructor
 */
const EntradaDatosGenerales: FunctionComponent<Props> = (props) => {
  const form = useFormContext<EntradaPorCajaInputProp>()

  const { responsables } = props

  const {
    control,
    formState: { errors },
  } = form

  return (
    <>
      <SimpleCard childIcon={<HorizontalSplitOutlined />} title={'Datos Generales'}>
        <Grid container columnSpacing={1} rowSpacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name={'codigo'}
              control={control}
              render={({ field }) => (
                <TextField
                  label={'Código'}
                  size={'small'}
                  fullWidth
                  onChange={field.onChange}
                  value={field.value || ''}
                  placeholder={'Autogenerado'}
                  disabled
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name={'fechaDocumento'}
              control={control}
              render={({ field }) => (
                <FormDateTimePickerField
                  label={'Fecha Registro'}
                  onChange={field.onChange}
                  value={field.value || null}
                  disabled
                  slotProps={{
                    textField: {
                      size: 'small',
                      helperText: errors.fechaDocumento?.message || '',
                      error: Boolean(errors.fechaDocumento),
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name={'tipoDocumento'}
              control={control}
              render={({ field }) => (
                <>
                  <FormSelect<KeyValueProp<TipoDocumentoProp>>
                    inputLabel={'Tipo Documento'}
                    options={apiTipoDocumentoListado || []}
                    value={field.value || null}
                    onChange={field.onChange}
                    isClearable={true}
                    getOptionValue={(option) => option.key || ''}
                    getOptionLabel={(option) => `${option.value}`}
                    error={Boolean(errors.tipoDocumento)}
                    formHelperText={errors.tipoDocumento?.message}
                  />
                </>
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name={'descripcionMovimiento'}
              control={control}
              render={({ field }) => (
                <TextField
                  label={'Descripcion de movimiento'}
                  size={'small'}
                  fullWidth
                  multiline
                  rows={3}
                  onChange={field.onChange}
                  value={field.value || ''}
                  helperText={errors.descripcionMovimiento?.message || ''}
                  error={Boolean(errors.descripcionMovimiento)}
                  required
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name={'responsable'}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormSelect<KeyValuePropV2<string, string>>
                  inputLabel={'Responsable *'}
                  fullWidth
                  onChange={field.onChange}
                  value={field.value}
                  options={responsables}
                  getOptionValue={(option) => option.key}
                  getOptionLabel={(option) => option.value}
                  formHelperText={error?.message}
                  error={Boolean(error)}
                  required
                />
              )}
            />
          </Grid>
        </Grid>
      </SimpleCard>
    </>
  )
}

export default EntradaDatosGenerales
