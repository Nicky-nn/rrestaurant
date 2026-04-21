import { Box, Divider, Stack, useTheme, Typography, Slider, FormLabel } from '@mui/material'
import Grid from '@mui/material/Grid'
import React, { FunctionComponent, useEffect, useState } from 'react'

import MyDateRangePickerField from '../../../base/components/MyInputs/MyDateRangePickerField'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import { Button, CircularProgress } from '@mui/material'
import dayjs from 'dayjs'
import { SimpleBox, SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import useAuth from '../../../base/hooks/useAuth'
import { useAppConfirm } from '../../../base/contexts/AppConfirmProvider'
import { reporteRoutesMap } from '../reporteRoutes'
import PedidosSospechososListado from './pedidosArticulosSospechososPV/PedidosSospechososListado'
import { useRestAnomaliaPorSucursal } from '../queries/useRestAnomaliaPorSucursal'
import { useRestAnomaliaGenerarStats } from '../mutations/useRestAnomaliaGenerarStats'
import SucursalRestriccionField from '../../base/components/SucursalRestriccionField'

const ReportePedidosSospechosos: FunctionComponent = () => {
    const theme = useTheme()
    const {
        user: { sucursal, puntoVenta },
    } = useAuth()
    const users = useAuth()
    const { requestConfirm } = useAppConfirm()
    const isAdmin = users.user.rol === 'ADMINISTRADOR'

    const today = new Date()
    today.setHours(0, 0, 0, 0) // inicio del día

    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([today, today])
    const [startDate, endDate] = dateRange
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState<{ key: number; value: string }>({ 
        key: sucursal.codigo, 
        value: `S ${sucursal.codigo}` 
    })

    const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useRestAnomaliaPorSucursal({ codigoSucursal: sucursalSeleccionada.key })
    const anomaliaMutation = useRestAnomaliaGenerarStats()

    const handleGenerarStats = async () => {
      try {
        await anomaliaMutation.mutateAsync({
          codigoSucursal: sucursalSeleccionada.key,
          fechaInicio: dayjs(startDate).startOf('day').format('DD-MM-YYYY HH:mm:ss'),
          fechaFinal: dayjs(endDate).endOf('day').format('DD-MM-YYYY HH:mm:ss')
        })
        
        // Ensure we refetch stats successfully after generation
        refetchStats()
      } catch (error: any) {
        console.error(error)
        const errorMessage = error.response?.errors?.[0]?.message || error.message || 'Error al generar estadísticas'
        await requestConfirm({
          title: 'Error',
          description: errorMessage,
          confirmButtonColor: 'error',
          confirmationText: 'Aceptar',
          cancellationText: 'Cerrar',
        })
      }
    }

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
        <SimpleContainerBox >
            <Breadcrumb routeSegments={[reporteRoutesMap.pedidosSospechosos]} />
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 12 }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'column', md: 'row' }}
                        divider={<Divider orientation="vertical" flexItem />}
                        spacing={1}
                        alignItems="center"
                    >
                        {/* DateRange con altura small */}
                        <Box sx={{ minWidth: 250 }}>
                            <MyDateRangePickerField
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(date) => setDateRange(date)}
                            />
                        </Box>

                        <Box sx={{ minWidth: 200, '& .MuiInputBase-root': { height: 40 } }}>
                            <SucursalRestriccionField
                                isMulti={false}
                                value={sucursalSeleccionada.key}
                                onChange={(val) => {
                                    if (val && val.length > 0) setSucursalSeleccionada(val[0])
                                }}
                            />
                        </Box>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 12 }}>
                    <SimpleBox>
                        {isStatsLoading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : !stats ? (
                            <Box p={3} textAlign="center">
                                <Typography variant="h6" gutterBottom>
                                    Estadísticas no generadas para evaluar anomalías en sucursal {sucursalSeleccionada.key}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    El reporte de pedidos sospechosos requiere un entrenamiento inicial basado en la actividad histórica. Selecciona un rango de fechas con actividad rutinaria arriba y haz clic en generar.
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={handleGenerarStats}
                                    disabled={anomaliaMutation.isPending || !startDate || !endDate}
                                >
                                    {anomaliaMutation.isPending ? 'Generando...' : 'Generar Modelo Computacional'}
                                </Button>
                            </Box>
                        ) : (
                            <PedidosSospechososListado
                                fechaInicial={startDate ?? new Date()}
                                fechaFinal={endDate ?? new Date()}
                                codigoSucursal={sucursalSeleccionada.key}
                                stats={stats}
                            />
                        )}
                    </SimpleBox>
                </Grid>
            </Grid>
        </SimpleContainerBox>
    )
}

export default ReportePedidosSospechosos
