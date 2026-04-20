/* eslint-disable no-unused-vars */
import { Box, Divider, Stack, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { format, lastDayOfMonth, startOfMonth } from 'date-fns'
import { FunctionComponent, useEffect, useState } from 'react'

import MyDateRangePickerField from '../../../base/components/MyInputs/MyDateRangePickerField'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import {
  SimpleBox,
  SimpleContainerBox,
} from '../../../base/components/Template/Cards/SimpleBox'
import useAuth from '../../../base/hooks/useAuth'
import PuntoVentaRestriccionField from '../../base/components/PuntoVentaRestriccionField'
import SucursalRestriccionField from '../../base/components/SucursalRestriccionField'
import { reporteRoutesMap } from '../reporteRoutes'
import VacGraficoListado from './ventasArticuloComercio/VacGraficoListado'
import VacListado from './ventasArticuloComercio/VacListado'

interface OwnProps {}

type Props = OwnProps

const VentasArticuloComercio: FunctionComponent<Props> = (props) => {
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
    setPuntosVenta([
      { key: puntoVenta.codigo, value: `S ${sucursal.codigo} - PV ${puntoVenta.codigo}` },
    ])
  }, [sucursal, puntoVenta])

  // State to store the selected sucursal codes
  const [selectedSucursales, setSelectedSucursales] = useState<
    { key: number; value: string }[]
  >([])

  // Handler for sucursal selection
  const handleSucursalChange = (values?: { key: number; value: string }[]) => {
    // Update the state with selected sucursales
    setSelectedSucursales(values || [])
  }

  return (
    <SimpleContainerBox maxWidth={'xl'}>
      <Breadcrumb routeSegments={[reporteRoutesMap.articuloPorComercio]} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack
            direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }}
            divider={<Divider orientation="vertical" flexItem />}
            spacing={1}
          >
            <Box sx={{ minWidth: 250 }}>
              <MyDateRangePickerField
                startDate={startDate ?? undefined}
                endDate={endDate ?? undefined}
                onChange={(date) => {
                  setDateRange(date)
                }}
              />
            </Box>
            <Box
              sx={{
                [theme.breakpoints.up('md')]: {
                  minWidth: 400,
                  maxWidth: 700,
                },
              }}
            >
              <SucursalRestriccionField onChange={handleSucursalChange} />
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} md={8}>
          <VacListado
            fechaInicial={startDate || new Date()}
            fechaFinal={endDate || new Date()}
            codigoSucursal={selectedSucursales.map((item) => item.key)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SimpleBox>
            <Divider sx={{ mb: 2 }}>Top 10</Divider>
            <VacGraficoListado
              fechaInicial={startDate ? format(new Date(startDate), 'dd/MM/yyyy') : ''}
              fechaFinal={endDate ? format(new Date(endDate), 'dd/MM/yyyy') : ''}
              codigoSucursal={selectedSucursales.map((item) => item.key)}
            />
          </SimpleBox>
        </Grid>
      </Grid>
    </SimpleContainerBox>
  )
}

export default VentasArticuloComercio
