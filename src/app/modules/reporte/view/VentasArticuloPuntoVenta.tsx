import { Box, Divider, Stack, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { format, lastDayOfMonth, startOfMonth } from 'date-fns'
import { FunctionComponent, useEffect, useState } from 'react'

import { SimpleBox, SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import MyDateRangePickerField from '../../../base/components/MyInputs/MyDateRangePickerField'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import useAuth from '../../../base/hooks/useAuth'
import PuntoVentaRestriccionField from '../../base/components/PuntoVentaRestriccionField'
import { reporteRoutesMap } from '../reporteRoutes'
import VapvGraficoListado from './ventasArticuloPuntoVenta/VapvGraficoListado'
import VapvListado from './ventasArticuloPuntoVenta/VapvListado'

interface OwnProps {}

type Props = OwnProps

const VentasArticuloPuntoVenta: FunctionComponent<Props> = (props) => {
  const theme = useTheme()
  const {
    user: { sucursal, puntoVenta },
  } = useAuth()
  const [dateRange, setDateRange] = useState<[Date | any, Date | any]>([
    startOfMonth(new Date()),
    lastDayOfMonth(new Date()),
  ])
  const [puntosVenta, setPuntosVenta] = useState<{ key: number; value: string }[]>([])

  const [startDate, endDate] = dateRange

  useEffect(() => {
    setPuntosVenta([{ key: puntoVenta.codigo, value: `S ${sucursal.codigo} - PV ${puntoVenta.codigo}` }])
  }, [sucursal, puntoVenta])

  return (
    <SimpleContainerBox maxWidth="xl">
      <Breadcrumb routeSegments={[reporteRoutesMap.articuloPorPuntoVenta]} />

      <Grid container spacing={2}>
        <Grid size={12}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            divider={<Divider orientation="vertical" flexItem />}
            spacing={2}
          >
            <Box sx={{ minWidth: 250 }}>
              <MyDateRangePickerField
                startDate={startDate || undefined}
                endDate={endDate || undefined}
                onChange={setDateRange}
              />
            </Box>

            <Box
              sx={{
                minWidth: { md: 400 },
                maxWidth: { md: 700 },
                width: '100%',
              }}
            >
              <PuntoVentaRestriccionField
                codigoSucursal={sucursal.codigo}
                puntosVenta={puntosVenta}
                onChange={(value) => {
                  if (value) setPuntosVenta(value)
                }}
              />
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <VapvListado
            fechaInicial={startDate || new Date()}
            fechaFinal={endDate || new Date()}
            codigoSucursal={sucursal.codigo}
            codigoPuntoVenta={puntosVenta.map((item) => item.key)}
            mostrarTodos={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SimpleBox>
            <Divider sx={{ mb: 2 }}>Top 10</Divider>

            <VapvGraficoListado
              fechaInicial={startDate ? format(new Date(startDate), 'dd/MM/yyyy') : ''}
              fechaFinal={endDate ? format(new Date(endDate), 'dd/MM/yyyy') : ''}
              codigoSucursal={sucursal.codigo}
              codigoPuntoVenta={puntosVenta.map((item) => item.key)}
              mostrarTodos={false}
            />
          </SimpleBox>
        </Grid>
      </Grid>
    </SimpleContainerBox>
  )
}

export default VentasArticuloPuntoVenta
