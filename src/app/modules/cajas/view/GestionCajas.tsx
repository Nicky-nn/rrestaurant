import {
  AccountBalanceWallet,
  ArrowForward,
  CallMade,
  CallReceived,
  History,
  Lock,
  LockOpen,
  ReceiptLong,
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import React, { FunctionComponent, useState } from 'react'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import useCajas from '../../../base/hooks/useCajas'
import { cajasRoutesMap } from '../cajasRoutes'
import { useArqueoCajaListado } from '../queries/useArqueoCajaListado'
import { ArqueoCajaObservacion } from '../types'
import AperturaCajaDialog from './AperturaCajaDialog'

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: '4px',
  borderRadius: '10px',
  display: 'flex',
  justifyContent: 'center',
  maxWidth: 'fit-content',
  margin: '0 auto',
  border: 'none',
  '& .MuiToggleButtonGroup-grouped': {
    margin: '0 2px',
    border: 'none !important',
    borderRadius: '8px !important',
    padding: '6px 18px',
    color: theme.palette.text.secondary,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.85rem',
    '&.Mui-selected': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.primary.main,
      boxShadow: theme.shadows[1],
      fontWeight: 600,
      '&:hover': {
        backgroundColor: theme.palette.background.paper,
      },
    },
    '&:not(.Mui-selected):hover': {
      backgroundColor: alpha(theme.palette.text.primary, 0.05),
    },
  },
}))

const PrimaryCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '16px',
  padding: theme.spacing(3),
  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}))

const HeaderCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  padding: '16px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
  },
}))

const IconCircle = styled(Box)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginRight: theme.spacing(1.5),
}))

const MontoRow = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
}))

// Parsea "DD/MM/YYYY HH:MM:SS" a Date
const parseFechaDMY = (fecha?: string): Date | null => {
  if (!fecha) return null
  const [datePart, timePart] = fecha.split(' ')
  if (!datePart) return null
  const [day, month, year] = datePart.split('/')
  const iso = `${year}-${month}-${day}${timePart ? 'T' + timePart : ''}`
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

const formatHora = (fecha?: string) => {
  const d = parseFechaDMY(fecha)
  if (!d) return '...'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatFechaHora = (fecha?: string) => {
  const d = parseFechaDMY(fecha)
  if (!d) return '...'
  return d.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })
}

const GestionCajas: FunctionComponent = () => {
  const [tab, setTab] = useState('actual')
  const [openApertura, setOpenApertura] = useState(false)

  const { aperturaCajaActivo, refetchArqueoActivo, refetchCajas } = useCajas()

  const handleTabChange = (event: React.MouseEvent<HTMLElement>, newTab: string | null) => {
    if (newTab !== null) setTab(newTab)
  }

  const { data } = useArqueoCajaListado(
    { limit: 1, query: aperturaCajaActivo?._id ? `_id=${aperturaCajaActivo._id}` : undefined },
    { enabled: !!aperturaCajaActivo },
  )
  const caja = data?.docs?.[0]

  const formatMoney = (amount: number = 0) => `Bs. ${Number(amount).toFixed(2)}`

  // Observacion de apertura (para la hora en el header)
  const obsApertura = caja?.observaciones?.find((o: ArqueoCajaObservacion) => o.accion === 'APERTURA_CAJA')

  return (
    <SimpleContainerBox>
      <Breadcrumb routeSegments={[cajasRoutesMap.gestion]} />

      <Box sx={{ pt: 1, pb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <StyledToggleButtonGroup size="small" value={tab} exclusive onChange={handleTabChange}>
            <ToggleButton value="actual">
              <AccountBalanceWallet sx={{ fontSize: 16, mr: 0.8 }} />
              Caja Actual
            </ToggleButton>
            <ToggleButton value="ultima">
              <History sx={{ fontSize: 16, mr: 0.8 }} />
              Última Caja
            </ToggleButton>
            <ToggleButton value="historial">
              <ReceiptLong sx={{ fontSize: 16, mr: 0.8 }} />
              Historial
            </ToggleButton>
          </StyledToggleButtonGroup>
        </Box>

        {tab === 'actual' && !aperturaCajaActivo && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              gap: 2,
            }}
          >
            <IconCircle
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.12),
                color: 'warning.main',
                width: 64,
                height: 64,
                mb: 1,
              }}
            >
              <Lock sx={{ fontSize: 32 }} />
            </IconCircle>
            <Typography variant="subtitle1" fontWeight={700}>
              No hay caja abierta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              No tienes una caja activa en este punto de venta
            </Typography>
            <Button
              variant="contained"
              startIcon={<LockOpen />}
              onClick={() => setOpenApertura(true)}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Abrir Caja
            </Button>
          </Box>
        )}

        {tab === 'actual' && !!aperturaCajaActivo && (
          <Box>
            <HeaderCard>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconCircle
                  sx={{
                    backgroundColor: (theme) => alpha(theme.palette.success.main, 0.12),
                    color: 'success.main',
                    width: 40,
                    height: 40,
                  }}
                >
                  <AccountBalanceWallet fontSize="small" />
                </IconCircle>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                    Arqueo de Caja {caja?.cajaCodigo || '...'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {caja?.turnoCaja?.nombre || 'Turno'} &nbsp;·&nbsp; Abierta el{' '}
                    {formatHora(obsApertura?.fecha ?? caja?.fechaApertura)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={
                    <CallReceived sx={{ transform: 'rotate(-90deg)', fontSize: '1rem !important' }} />
                  }
                  sx={{
                    color: 'success.main',
                    borderColor: (theme) => alpha(theme.palette.success.main, 0.3),
                    '&:hover': {
                      borderColor: 'success.main',
                      backgroundColor: (theme) => alpha(theme.palette.success.main, 0.08),
                    },
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  Ingreso
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CallMade sx={{ fontSize: '1rem !important' }} />}
                  sx={{
                    color: 'error.main',
                    borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
                    '&:hover': {
                      borderColor: 'error.main',
                      backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
                    },
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  Retiro
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Lock sx={{ fontSize: '1rem !important' }} />}
                  sx={{
                    backgroundColor: 'text.primary',
                    color: 'background.paper',
                    fontWeight: 600,
                    borderRadius: '8px',
                    '&:hover': { backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.85) },
                    textTransform: 'none',
                    boxShadow: 'none',
                    fontSize: '0.8rem',
                  }}
                >
                  Cerrar Caja
                </Button>
              </Box>
            </HeaderCard>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <PrimaryCard>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.85, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}
                  >
                    Monto Esperado en Caja
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, mb: 3 }}>
                    {formatMoney(caja?.montoTeorico)}
                  </Typography>

                  <MontoRow>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Fondo Inicial
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatMoney(caja?.montoInicial)}
                    </Typography>
                  </MontoRow>
                  <MontoRow>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Otros Ingresos
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="success.light">
                      +{formatMoney(caja?.totalIngresos)}
                    </Typography>
                  </MontoRow>
                  <MontoRow>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Retiros/Gastos
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="error.light">
                      -{formatMoney(caja?.totalRetiros)}
                    </Typography>
                  </MontoRow>
                  <MontoRow>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Ventas
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="warning.main"
                      sx={{
                        filter: 'blur(6px)',
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                    >
                      -{formatMoney(caja?.totalRetiros)}
                    </Typography>
                  </MontoRow>

                  <Box sx={{ mt: 'auto', pt: 16 }}>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward sx={{ transform: 'rotate(-45deg)' }} />}
                      fullWidth
                      size="small"
                      sx={{
                        backgroundColor: 'background.paper',
                        color: 'primary.main',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        py: 1.2,
                        boxShadow: 'none',
                      }}
                    >
                      Ir al Punto de Venta
                    </Button>
                  </Box>
                </PrimaryCard>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    p: 3,
                    boxShadow: (theme) => theme.shadows[1],
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    height: '100%',
                    backgroundColor: 'background.paper',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    Movimientos del Turno
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />

                  {(caja?.observaciones ?? []).map((obs: ArqueoCajaObservacion, idx: number) => {
                    const isApertura = obs.accion === 'APERTURA_CAJA'
                    const isCierre = obs.accion === 'CIERRE_CAJA'
                    const isRetiro = obs.accion?.includes('RETIRO') && !isApertura
                    const isIngreso = obs.accion?.includes('INGRESO')

                    const label = isApertura
                      ? 'Apertura de Caja'
                      : isCierre
                        ? 'Cierre de Caja'
                        : isRetiro
                          ? 'Retiro'
                          : isIngreso
                            ? 'Ingreso'
                            : (obs.accion ?? 'Movimiento')

                    const chipColor: 'primary' | 'error' | 'success' | 'default' = isApertura
                      ? 'primary'
                      : isCierre
                        ? 'default'
                        : isRetiro
                          ? 'error'
                          : isIngreso
                            ? 'success'
                            : 'default'

                    const total = caja?.observaciones?.length ?? 0

                    return (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          mb: 2,
                          pb: 2,
                          borderBottom: idx < total - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        <IconCircle
                          sx={{
                            backgroundColor: (theme) =>
                              alpha(
                                isApertura
                                  ? theme.palette.primary.main
                                  : isCierre
                                    ? theme.palette.text.primary
                                    : isRetiro
                                      ? theme.palette.error.main
                                      : isIngreso
                                        ? theme.palette.success.main
                                        : theme.palette.info.main,
                                0.1,
                              ),
                            color: isApertura
                              ? 'primary.main'
                              : isCierre
                                ? 'text.secondary'
                                : isRetiro
                                  ? 'error.main'
                                  : isIngreso
                                    ? 'success.main'
                                    : 'info.main',
                            width: 38,
                            height: 38,
                          }}
                        >
                          {isApertura ? (
                            <LockOpen sx={{ fontSize: 18 }} />
                          ) : isCierre ? (
                            <Lock sx={{ fontSize: 18 }} />
                          ) : isRetiro ? (
                            <CallMade sx={{ fontSize: 18 }} />
                          ) : isIngreso ? (
                            <CallReceived sx={{ transform: 'rotate(-90deg)', fontSize: 18 }} />
                          ) : (
                            <ReceiptLong sx={{ fontSize: 18 }} />
                          )}
                        </IconCircle>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                            <Typography variant="body2" fontWeight={700}>
                              {label}
                            </Typography>
                            {obs.usuario && (
                              <Chip
                                label={obs.usuario}
                                size="small"
                                variant="outlined"
                                color={chipColor}
                                sx={{ height: 18, fontSize: '0.68rem', fontWeight: 600 }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatFechaHora(obs.fecha)}
                          </Typography>
                          {obs.observacion && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ mt: 0.2, opacity: 0.8 }}
                            >
                              {obs.observacion}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )
                  })}

                  {(!caja?.observaciones || caja.observaciones.length === 0) && (
                    <Typography variant="caption" color="text.secondary">
                      Sin movimientos registrados
                    </Typography>
                  )}
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {tab !== 'actual' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Typography variant="body2" color="text.secondary">
              En construcción...
            </Typography>
          </Box>
        )}
      </Box>

      <AperturaCajaDialog
        open={openApertura}
        onClose={() => setOpenApertura(false)}
        onSuccess={() => {
          setOpenApertura(false)
          refetchArqueoActivo()
          refetchCajas()
        }}
      />
    </SimpleContainerBox>
  )
}

export default React.memo(GestionCajas)
