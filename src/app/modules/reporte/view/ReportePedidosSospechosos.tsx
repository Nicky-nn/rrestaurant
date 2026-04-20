import { Box, Divider, FormLabel, Slider, Stack, Typography, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { FunctionComponent, useEffect, useState } from 'react'

import MyDateRangePickerField from '../../../base/components/MyInputs/MyDateRangePickerField'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import { SimpleBox, SimpleContainerBox } from '../../../base/components/Template/Cards/SimpleBox'
import useAuth from '../../../base/hooks/useAuth'
import PuntoVentaRestriccionField from '../../base/components/PuntoVentaRestriccionField'
import { reporteRoutesMap } from '../reporteRoutes'
import PedidosSospechososListado from './pedidosArticulosSospechososPV/PedidosSospechososListado'

const ReportePedidosSospechosos: FunctionComponent = () => {
  const theme = useTheme()
  const {
    user: { sucursal, puntoVenta },
  } = useAuth()
  const users = useAuth()
  const isAdmin = users.user.rol === 'ADMINISTRADOR'

  const today = new Date()
  today.setHours(0, 0, 0, 0) // inicio del día

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([today, today])
  const [startDate, endDate] = dateRange
  const [puntosVenta, setPuntosVenta] = useState<{ key: number; value: string }[]>([])

  // Estado para el umbral
  const [umbral, setUmbral] = useState<number>(1)

  useEffect(() => {
    setPuntosVenta([{ key: puntoVenta.codigo, value: `S ${sucursal.codigo} - PV ${puntoVenta.codigo}` }])
  }, [sucursal, puntoVenta])

  // Restricción de acceso para administradores
  if (!isAdmin) {
    return (
      <SimpleContainerBox maxWidth="xl" sx={{ mt: 5 }}>
        <Typography color="error" align="center" variant="h6">
          Acceso denegado. Solo administradores pueden ver este reporte.
        </Typography>
      </SimpleContainerBox>
    )
  }

  return (
    <SimpleContainerBox>
      <Breadcrumb routeSegments={[reporteRoutesMap.pedidosSospechosos]} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack
            direction={{ xs: 'column', sm: 'column', md: 'row' }}
            divider={<Divider orientation="vertical" flexItem />}
            spacing={1}
            alignItems="center"
          >
            {/* DateRange con altura small */}
            <Box sx={{ minWidth: 250 }}>
              <MyDateRangePickerField
                startDate={startDate ?? undefined}
                endDate={endDate ?? undefined}
                onChange={(date) => setDateRange(date)}
              />
            </Box>

            {/* PuntoVenta con altura small */}
            <Box
              sx={{
                [theme.breakpoints.up('md')]: {
                  minWidth: 390,
                  maxWidth: 700,
                },
                '& .MuiInputBase-root': { height: 40 }, // fuerza 40px
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
            <Box sx={{ minWidth: 150, px: 2 }}>
              <FormLabel component="legend">Umbral</FormLabel>
              <Slider
                aria-label="Umbral"
                value={umbral}
                onChange={(_, newValue) => setUmbral(Number(newValue))}
                getAriaValueText={(value) => `${value}`}
                step={0.5}
                min={0.5}
                max={2}
                marks={[
                  { value: 0.5, label: '0.5' },
                  { value: 1, label: '1' },
                  { value: 1.5, label: '1.5' },
                  { value: 2, label: '2' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <SimpleBox>
            <PedidosSospechososListado
              fechaInicial={startDate ?? new Date()}
              fechaFinal={endDate ?? new Date()}
              codigoSucursal={sucursal.codigo}
              codigoPuntoVenta={puntosVenta.map((item) => item.key)}
              umbral={umbral}
            />
          </SimpleBox>
        </Grid>
      </Grid>
    </SimpleContainerBox>
  )
}

export default ReportePedidosSospechosos
