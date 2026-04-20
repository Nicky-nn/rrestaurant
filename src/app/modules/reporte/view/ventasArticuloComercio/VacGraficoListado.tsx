import { Alert, useTheme } from '@mui/material'
import { deepPurple } from '@mui/material/colors'
import { useQuery } from '@tanstack/react-query'
import { orderBy } from 'lodash'
import { FunctionComponent } from 'react'
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
import { obtenerReporteVentasPorArticuloComercio } from '../../../pos/api/reporteVentasArticulo'

interface OwnProps {
  fechaInicial: string // dd/mm/yyyy
  fechaFinal: string // dd/mm/yyyy
  codigoSucursal: number[]
  height?: number
}

type Props = OwnProps

/**
 * Listado de articulos mas vendidos por punto de venta
 * @param props
 * @constructor
 */
const VacGraficoListado: FunctionComponent<Props> = (props) => {
  const { fechaInicial, fechaFinal, codigoSucursal, height } = props
  const theme = useTheme()

  const fi = fechaInicial
  const ff = fechaFinal

  // API FETCH
  const { data: respData, isLoading } = useQuery({
    queryKey: ['vapvGraficoListado', fechaInicial, fechaFinal, codigoSucursal],
    queryFn: async () => {
      if (!fechaInicial || !fechaFinal) return []
      const resp = await obtenerReporteVentasPorArticuloComercio(fi, ff, codigoSucursal)
      if (!resp) return []
      return orderBy(resp, ['totalFinal'], ['desc']).slice(0, 10)
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
  })

  if (isLoading) return <InputSkeleton width={250} size={'small'} />

  if (!respData) return <Alert>No se ha cargado datos</Alert>

  if (respData.length === 0) return <Alert severity="info">No se ha realizado ninguna venta</Alert>

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
        <XAxis type={'number'} dataKey={'totalFinal'} />
        <YAxis type={'category'} dataKey={'codigoArticulo'} fontSize={11} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.divider,
            borderRadius: 8,
          }}
          itemStyle={{ color: theme.palette.text.primary }}
          labelStyle={{ color: theme.palette.text.secondary, fontWeight: 700 }}
          formatter={(value, name, item) => {
            return `${numberWithCommasPlaces(value)} ${item.payload.moneda}`
          }}
          isAnimationActive={false}
          labelFormatter={(label, payload) => {
            return `${label} - ${payload[0]?.payload?.nombreArticulo ?? ''}`
          }}
        />
        <Legend />
        <Bar
          dataKey="totalFinal"
          name="Total Final"
          fill={deepPurple[300]}
          activeBar={<Rectangle fill={deepPurple[400]} />}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default VacGraficoListado
