import { Box, Divider, Stack, useTheme, Typography, Slider, FormLabel } from '@mui/material'
import Grid from '@mui/material/Grid'
import React, { FunctionComponent, useEffect, useState } from 'react'

import MyDateRangePickerField from '../../../base/components/MyInputs/MyDateRangePickerField'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import { Button, CircularProgress, alpha, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { InfoOutlined, HelpOutline } from '@mui/icons-material'
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

    const [openInfo, setOpenInfo] = useState(false)
    const [triggerSearch, setTriggerSearch] = useState(0)

    const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useRestAnomaliaPorSucursal({ codigoSucursal: sucursalSeleccionada.key })
    const anomaliaMutation = useRestAnomaliaGenerarStats()

    const handleGenerarStats = async () => {
      try {
        await anomaliaMutation.mutateAsync({
          codigoSucursal: sucursalSeleccionada.key,
          fechaInicio: dayjs(startDate).startOf('day').format('DD/MM/YYYY HH:mm:ss'),
          fechaFinal: dayjs(endDate).endOf('day').format('DD/MM/YYYY HH:mm:ss')
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
                <Grid size={{ xs: 12, md: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: -4 }}>
                    <Button 
                        variant="text" 
                        color="info" 
                        startIcon={<HelpOutline />}
                        onClick={() => setOpenInfo(true)}
                        sx={{ fontWeight: 600 }}
                    >
                        ¿Cómo funciona?
                    </Button>
                </Grid>

                <Dialog open={openInfo} onClose={() => setOpenInfo(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoOutlined color="info" /> ¿Cómo funciona esta herramienta?
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Este módulo identifica pedidos con comportamiento inusual mediante un modelo computacional que aprende de tu historial.
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                    1. Generar Stats (Entrenamiento)
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Selecciona un rango de fechas con actividad <em>rutinaria y normal</em> para enseñar al sistema el patrón de ventas correcto de tu restaurante.
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                    2. Consultar Anomalías
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Selecciona un nuevo rango de fechas para buscar pedidos que se desvían de lo normal, comparándolos con el modelo previamente entrenado.
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mt: 1 }}>
                                    3. Matriz de Riesgo y Puntajes
                                </Typography>
                                <Typography variant="body2" color="text.secondary" component="div">
                                    El sistema asigna un nivel de gravedad a cada anomalía:
                                    <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
                                        <li><strong>BAJO (0 a 14 pts):</strong> Operaciones rutinarias normales. No requieren atención.</li>
                                        <li><strong style={{ color: '#ffb300' }}>MEDIO (15 a 24 pts):</strong> Comportamientos ligeramente inusuales. No son necesariamente un fraude.</li>
                                        <li><strong style={{ color: '#f57c00' }}>ALTO (25 a 49 pts):</strong> Infracción directa a límites o cambios financieros (descuentos manuales). Requiere revisión al final del día.</li>
                                        <li><strong style={{ color: '#d32f2f' }}>CRÍTICO (50+ pts):</strong> Alto riesgo de fraude interno (ej. Anulación de pedido ya cobrado). Deben investigarse de inmediato.</li>
                                    </ul>
                                </Typography>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenInfo(false)} color="inherit">Entendido</Button>
                    </DialogActions>
                </Dialog>

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

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                onClick={handleGenerarStats}
                                disabled={anomaliaMutation.isPending || !startDate || !endDate}
                                sx={{ height: 40, whiteSpace: 'nowrap' }}
                            >
                                {anomaliaMutation.isPending ? 'Generando...' : 'Generar Stats'}
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={() => {
                                    refetchStats()
                                    setTriggerSearch(c => c + 1)
                                }}
                                sx={{ height: 40, whiteSpace: 'nowrap' }}
                            >
                                Consultar Anomalías
                            </Button>
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
                                    El reporte de pedidos sospechosos requiere un entrenamiento inicial basado en la actividad histórica. Selecciona un rango de fechas con actividad rutinaria arriba y haz clic en "Generar Stats".
                                </Typography>
                            </Box>
                        ) : (
                            <PedidosSospechososListado
                                fechaInicial={startDate ?? new Date()}
                                fechaFinal={endDate ?? new Date()}
                                codigoSucursal={sucursalSeleccionada.key}
                                stats={stats}
                                triggerSearch={triggerSearch}
                            />
                        )}
                    </SimpleBox>
                </Grid>
            </Grid>
        </SimpleContainerBox>
    )
}

export default ReportePedidosSospechosos