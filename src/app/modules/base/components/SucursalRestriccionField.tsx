/* eslint-disable no-unused-vars */
import { useQuery } from '@tanstack/react-query'
import { FunctionComponent } from 'react'

import FormMultiSelect from '../../../base/components/Form/FormMultiSelect'
import InputSkeleton from '../../../base/components/skeleton/InputSkeleton'
import { apiUsuarioRestriccion } from '../cuenta/api/usuarioRestriccion.api'
import { UsuarioRestriccionProps } from '../cuenta/interfaces/restriccion.interface'

interface OwnProps {
  onChange: (value?: { key: number; value: string }[]) => void
  value?: number | number[] | null
  isMulti?: boolean
}

type Props = OwnProps

const SucursalRestriccionField: FunctionComponent<Props> = ({ onChange, value, isMulti = true }) => {
  const { data: sucursales, isLoading } = useQuery<UsuarioRestriccionProps>({
    queryKey: ['sucursalPuntoVenta'],
    queryFn: async () => {
      const data = await apiUsuarioRestriccion()
      return data || []
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
  })

  if (isLoading) {
    return <InputSkeleton />
  }

  const options =
    sucursales?.sucursales?.map((sucursal) => ({
      key: sucursal.codigo,
      value: `${sucursal.codigo} - ${sucursal.direccion}`,
      label: `${sucursal.codigo} - ${sucursal.direccion}`,
    })) || []

  // Ensure value maps directly to the react-select options structure
  const selectedValue = value !== undefined && value !== null
    ? (Array.isArray(value) 
        ? options.filter((o) => value.includes(o.key)) 
        : options.find((o) => o.key === value)) || (isMulti ? [] : null)
    : undefined

  return (
    <FormMultiSelect
      value={selectedValue}
      isMulti={isMulti}
      options={options}
      placeholder="Seleccione Sucursal"
      onChange={(selectedOptions: any) => {
        if (!selectedOptions) {
          onChange([])
          return
        }
        const opts = Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions]
        const transformedValues = opts.map((option: any) => ({
          key: Number(option.key),
          value: option.value,
        }))

        // Call the onChange prop with the transformed values
        onChange(transformedValues)
      }}
    />
  )
}

export default SucursalRestriccionField
