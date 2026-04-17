/* eslint-disable no-unused-vars */
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent } from 'react'

import FormMultiSelect from '../../../base/components/Form/FormMultiSelect'
import InputSkeleton from '../../../base/components/skeleton/InputSkeleton'
import { apiUsuarioRestriccion } from '../cuenta/api/usuarioRestriccion.api'
import { restriccionPuntoVentaCompose } from '../services/restriccionPuntoVentaCompose'

interface OwnProps {
  codigoSucursal: number
  puntosVenta?: { key: number; value: string }[] | null
  onChange: (value?: { key: number; value: string }[]) => void
}

type Props = OwnProps

const PuntoVentaRestriccionField: FunctionComponent<Props> = (props) => {
  const { onChange, codigoSucursal, puntosVenta } = props

  const { data, isLoading } = useQuery({
    queryKey: ['puntoVentaRestriccion', codigoSucursal],
    queryFn: async () => {
      const resp = await apiUsuarioRestriccion()
      return restriccionPuntoVentaCompose(codigoSucursal, resp?.sucursales)
    },
  })

  if (isLoading) return <InputSkeleton width={250} size={'small'} />

  return (
    <>
      <FormMultiSelect
        isMulti={true}
        closeMenuOnSelect={false}
        options={data || []}
        value={puntosVenta || []}
        isSearchable={false}
        placeholder={'Todos los puntos de venta'}
        onChange={(value) => {
          onChange(value as any)
        }}
        getOptionValue={(option) => option.key?.toString()}
        getOptionLabel={(option) => option.value}
      />
    </>
  )
}

export default PuntoVentaRestriccionField
