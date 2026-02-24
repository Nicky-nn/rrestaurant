import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent } from 'react'
import { SingleValue } from 'react-select'

import AlertError from '../../../../../base/components/Alert/AlertError.tsx'
import FormSelect from '../../../../../base/components/Form/FormSelect.tsx'
import InputSkeleton from '../../../../../base/components/skeleton/InputSkeleton.tsx'
import { EntidadInputProps } from '../../../../../interfaces'
import { AlmacenProps } from '../../../../../interfaces/almacen.ts'
import { apiAlmacenSimpleListado } from './apiAlmacenSimpleListado.ts'

interface OwnProps {
  value: AlmacenProps | undefined | null
  onChange: (value?: SingleValue<AlmacenProps>) => void
  isDisabled?: boolean
  error?: boolean
  formHelperText?: string
  isClearable?: boolean
  required?: boolean
  entidad: EntidadInputProps
}

type Props = OwnProps

/**
 * Componente api para gestión de almacenes
 * @param props
 * @constructor
 */
const AlmacenField: FunctionComponent<Props> = (props) => {
  const { value, onChange, isDisabled, error, formHelperText, isClearable, required, entidad } = props

  const {
    data: almacenes,
    isLoading: almacenesLoading,
    error: almacenError,
  } = useQuery({
    queryKey: ['almacenes'],
    queryFn: async () => {
      return apiAlmacenSimpleListado(`sucursal.codigo=${entidad.codigoSucursal}`)
    },
  })

  if (almacenesLoading) {
    return <InputSkeleton />
  }

  if (almacenError) {
    return <AlertError mensaje={almacenError.message} />
  }

  return (
    <FormSelect<AlmacenProps>
      inputLabel={`Almacen ${required ? '*' : ''}`}
      options={almacenes || []}
      value={value}
      onChange={(newValue: any) => {
        onChange(newValue)
      }}
      isSearchable={false}
      required={required ?? false}
      isClearable={isClearable ?? true}
      getOptionValue={(option) => option.codigoAlmacen || ''}
      getOptionLabel={(option) => `${option.codigoAlmacen} - ${option.nombre}`}
      error={error ?? false}
      isDisabled={isDisabled ?? false}
      formHelperText={formHelperText || ''}
    />
  )
}

export default AlmacenField
