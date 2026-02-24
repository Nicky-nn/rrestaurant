import { FormControl, Stack } from '@mui/material'
import React, { FunctionComponent, useEffect } from 'react'

import FormSelect from '../../../../../base/components/Form/FormSelect.tsx'
import { reactSelectStyle } from '../../../../../base/components/MySelect/ReactSelect.tsx'
import { ArticuloUnidadMedidaProps } from '../../../../../interfaces/articuloUnidadMedida.ts'

export interface UnidadMedidaSeleccionProps {
  label?: string
  disabled?: boolean
  autoSeleccion?: boolean // Si value contiene datos, se prioriza, luego autoselección, default false
}

interface OwnProps {
  datos: ArticuloUnidadMedidaProps[]
  value: ArticuloUnidadMedidaProps | null
  onChange: (resp: ArticuloUnidadMedidaProps | null) => void
  error?: string
  unidadMedidaProps: UnidadMedidaSeleccionProps
}

type Props = OwnProps

/**
 *
 * @param props
 * @author seleccione de unidad de medida
 * @author isi-template
 * @constructor
 */
const ArticuloUnidadMedidaSeleccion: FunctionComponent<Props> = (props) => {
  const { onChange, error, value, unidadMedidaProps, datos } = props

  const { autoSeleccion = false, disabled = false, label } = unidadMedidaProps

  /************************************************************************************/
  /************************************************************************************/
  // Logica de auto seleccion
  useEffect(() => {
    if (autoSeleccion && datos && datos.length > 0 && !value) {
      const primer = datos[0]
      onChange(primer)
    }
  }, [autoSeleccion, datos, value, onChange])

  /*********************************************************************************/
  /*********************************************************************************/
  /*********************************************************************************/
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
    >
      <FormControl fullWidth error={!!error}>
        <FormSelect<ArticuloUnidadMedidaProps>
          inputLabel={label ?? 'Unidad de medida *'}
          styles={reactSelectStyle(!!error)}
          placeholder={!disabled ? 'Seleccione...' : ''}
          options={datos}
          value={value}
          onChange={onChange}
          getOptionValue={(item) => item._id}
          getOptionLabel={(item) => `${item.codigoUnidadMedida} - ${item.nombreUnidadMedida}`}
          error={!!error}
          formHelperText={error ?? ''}
          isSearchable={false}
          isClearable={false}
          isDisabled={disabled}
        />
      </FormControl>
    </Stack>
  )
}

export default ArticuloUnidadMedidaSeleccion
