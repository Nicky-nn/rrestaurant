import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent } from 'react'
import { SingleValue } from 'react-select'

import { apiMonedaSimpleListado } from '../../../../../base/api/apiMonedaSimpleListado.ts'
import AlertError from '../../../../../base/components/Alert/AlertError.tsx'
import FormSelect from '../../../../../base/components/Form/FormSelect.tsx'
import InputSkeleton from '../../../../../base/components/skeleton/InputSkeleton.tsx'
import { MonedaProps } from '../../../../../interfaces/monedaPrecio.ts'

interface OwnProps {
  value: MonedaProps | undefined | null
  onChange: (value?: SingleValue<MonedaProps>) => void
  isDisabled?: boolean
  error?: boolean
  formHelperText?: string
  isClearable?: boolean
  required?: boolean
}

type Props = OwnProps

/**
 * Componente api para gestion de monedas
 * @param props
 * @constructor
 */
const MonedaField: FunctionComponent<Props> = (props) => {
  const { value, onChange, isDisabled, error, formHelperText, isClearable, required } =
    props

  const {
    data: monedas,
    isLoading: monedaLoading,
    error: monedaError,
  } = useQuery({
    queryKey: ['monedas1'],
    queryFn: async () => {
      const resp = await apiMonedaSimpleListado()
      return resp || []
    },
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  if (monedaLoading) {
    return <InputSkeleton />
  }

  if (monedaError) {
    return <AlertError mensaje={monedaError.message} />
  }

  return (
    <FormSelect<MonedaProps>
      inputLabel={`Moneda ${required ? '*' : ''}`}
      options={monedas || []}
      value={value}
      onChange={onChange}
      required={required}
      isClearable={isClearable ?? true}
      getOptionValue={(option) => option.codigo?.toString() || ''}
      getOptionLabel={(option) => `${option.sigla} - ${option.descripcion}`}
      isDisabled={isDisabled ?? false}
      error={error ?? false}
      formHelperText={formHelperText || ''}
    />
  )
}

export default MonedaField
