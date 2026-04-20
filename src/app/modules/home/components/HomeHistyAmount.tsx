import { Grid } from '@mui/material'
import { blue, purple } from '@mui/material/colors'
import { FunctionComponent, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { numberWithCommasPlaces } from '../../../base/components/MyInputs/NumberInput'
import { VentaReportePorUsuarioProp } from '../../reporte/api/apiReporteUsuario'
import { HomePeriodosProp } from '../services/homePeriodo'

interface OwnProps {
  periodo: HomePeriodosProp | null
  ventaPeriodo: VentaReportePorUsuarioProp[]
}

type Props = OwnProps

const HomeHistoryAmount: FunctionComponent<Props> = (props) => {
  const { ventaPeriodo } = props

  const chartData = useMemo(() => {
    const grouped: Record<string, { state: string; numeroFacturas: number; montoTotal: number }> = {}
    for (const r of ventaPeriodo) {
      if (!grouped[r.state]) {
        grouped[r.state] = { state: r.state, numeroFacturas: 0, montoTotal: 0 }
      }
      grouped[r.state].numeroFacturas += r.numeroFacturas || 0
      grouped[r.state].montoTotal += r.montoTotal || 0
    }
    return Object.values(grouped)
  }, [ventaPeriodo])

  return (
    <Grid container size={12} spacing={1}>
      <Grid size={12}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            key={'historyReport'}
            width={500}
            height={400}
            data={chartData}
            margin={{ top: 5, right: 0, left: 1, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="state" fontSize={'12px'} />
            <YAxis type={'number'} />
            <Tooltip
              formatter={(value) => {
                return `${numberWithCommasPlaces(value)}`
              }}
            />
            <Legend />
            <Bar dataKey="numeroFacturas" name={'# Facturas'} fill={purple[500]} />
            <Bar dataKey="montoTotal" name={'Monto Total'} fill={blue[500]} />
          </BarChart>
        </ResponsiveContainer>
      </Grid>
    </Grid>
  )
}

export default HomeHistoryAmount
