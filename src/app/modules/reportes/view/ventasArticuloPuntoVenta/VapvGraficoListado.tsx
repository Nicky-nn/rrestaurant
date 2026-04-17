import { Alert } from '@mui/material'
import { deepPurple } from '@mui/material/colors'
import { useQuery } from '@tanstack/react-query'
import { orderBy } from 'lodash'
import React, { FunctionComponent } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { numberWithCommasPlaces } from '../../../../base/components/MyInputs/NumberInput'
import InputSkeleton from '../../../../base/components/skeleton/InputSkeleton'
import { obtenerReporteVentasPorArticuloPuntoVenta } from '../../api/reporteVentasArticulo'

interface OwnProps {
  fechaInicial: string // dd/mm/yyyy
  fechaFinal: string // dd/mm/yyyy
  codigoSucursal: number
  codigoPuntoVenta: number[]
  mostrarTodos: boolean
  height?: number
}

type Props = OwnProps

/**
 * Listado de articulos mas vendidos por punto de venta
 * @param props
 * @constructor
 */
const VapvGraficoListado: FunctionComponent<Props> = (props) => {
  const {
    fechaInicial,
    fechaFinal,
    codigoPuntoVenta,
    codigoSucursal,
    mostrarTodos,
    height,
  } = props

  const fi = fechaInicial
  const ff = fechaFinal

  // API FETCH
  const { data: respData, isLoading } = useQuery({
    queryKey: [
      'vapvGraficoListado',
      fechaInicial,
      fechaFinal,
      codigoPuntoVenta,
      codigoSucursal,
      mostrarTodos,
    ],
    queryFn: async () => {
      if (!fechaInicial || !fechaFinal) return []
      const resp = await obtenerReporteVentasPorArticuloPuntoVenta(
        fi,
        ff,
        codigoSucursal,
        codigoPuntoVenta,
        mostrarTodos,
      )
      if (!resp) return []
      return orderBy(resp, ['montoVentas'], ['desc']).slice(0, 10)
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
  })

  if (isLoading) return <InputSkeleton width={250} size={'small'} />

  if (!respData) return <Alert>No se ha cargado datos</Alert>

  if (respData.length === 0)
    return <Alert severity="info">No se ha realizado ninguna venta</Alert>

  return (
    <ResponsiveContainer width="100%" height={height ? height : 460}>
      <BarChart
        width={500}
        data={respData}
        layout={'vertical'}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis type={'number'} dataKey={'montoVentas'} />
        <YAxis type={'category'} dataKey={'codigoArticulo'} fontSize={11} />
        <Tooltip
          formatter={(value, name, item) => {
            return `${numberWithCommasPlaces(value)} ${item.payload.moneda}`
          }}
          isAnimationActive={false}
          labelFormatter={(label, payload) => {
            return (
              <>
                {label} - {payload[0]?.payload?.nombreArticulo}
              </>
            )
          }}
        />
        <Legend />
        <Bar
          dataKey="montoVentas"
          fill={deepPurple[300]}
          activeBar={<Rectangle fill={deepPurple[400]} />}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default VapvGraficoListado
