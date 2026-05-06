import { useQuery } from '@tanstack/react-query'
import { FunctionComponent } from 'react'

import FormMultiSelect from '../../../base/components/Form/FormMultiSelect'
import InputSkeleton from '../../../base/components/skeleton/InputSkeleton'
import { apiUsuarioRestriccion } from '../cuenta/api/usuarioRestriccion.api'
import { UsuarioRestriccionProps } from '../cuenta/interfaces/restriccion.interface'

interface OwnProps {
  isMulti?: boolean
  value?: number | number[]
  onChange: (value?: { key: number; value: string }[]) => void
}

type Props = OwnProps

const PuntoVentaRestriccionField: FunctionComponent<Props> = ({ isMulti = true, value, onChange }) => {
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

  const mappedValue = isMulti
    ? options.filter((o) => (Array.isArray(value) ? value.includes(o.key) : o.key === value))
    : options.find((o) => o.key === (Array.isArray(value) ? value[0] : value)) || null

  return (
    <FormMultiSelect
      isMulti={isMulti}
      value={mappedValue}
      options={options}
      placeholder="Seleccione Sucursal"
      onChange={(selectedOptions: any) => {
        if (!selectedOptions) {
          onChange([])
          return
        }

        const optionsArray = Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions]

        // Transform selected options to match the expected type
        const transformedValues = optionsArray.map((option) => ({
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
