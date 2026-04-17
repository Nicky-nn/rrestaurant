/* eslint-disable no-unused-vars */
import { useQuery } from '@tanstack/react-query'
import { FunctionComponent } from 'react'

import FormMultiSelect from '../../../base/components/Form/FormMultiSelect'
import InputSkeleton from '../../../base/components/skeleton/InputSkeleton'
import { apiUsuarioRestriccion } from '../cuenta/api/usuarioRestriccion.api'
import { UsuarioRestriccionProps } from '../cuenta/interfaces/restriccion.interface'

interface OwnProps {
  onChange: (value?: { key: number; value: string }[]) => void
}

type Props = OwnProps

const PuntoVentaRestriccionField: FunctionComponent<Props> = ({ onChange }) => {
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

  return (
    <FormMultiSelect
      isMulti={true}
      options={options}
      placeholder="Seleccione Sucursal"
      onChange={(selectedOptions) => {
        // Transform selected options to match the expected type
        const transformedValues = selectedOptions?.map((option) => ({
          key: Number(option.key),
          value: option.value,
        }))

        // Call the onChange prop with the transformed values
        onChange(transformedValues)
      }}
    />
  )
}

export default PuntoVentaRestriccionField
