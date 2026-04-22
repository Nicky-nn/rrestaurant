import { Assessment, CheckCircle, History, TrendingUp, Wallet, Warning } from '@mui/icons-material'
import { alpha, Box, Button, Card, Chip, Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material'
import React, { FC, useMemo } from 'react'
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip } from 'recharts'

import useAuth from '../../../base/hooks/useAuth'
import { useArqueoCajaListado } from '../queries/useArqueoCajaListado'
import { ArqueoCajaMetodoPago } from '../types'

// ─── helpers ──────────────────────────────────────────────────────────────────

const parseFechaDMY = (fecha?: string): Date | null => {
  if (!fecha) return null
  const [datePart, timePart] = fecha.split(' ')
  if (!datePart) return null
  const [day, month, year] = datePart.split('/')
  const iso = `${year}-${month}-${day}${timePart ? 'T' + timePart : ''}`
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

const formatFechaHora = (fecha?: string) => {
  const d = parseFechaDMY(fecha)
  if (!d) return '—'
  return d.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'medium' })
}

const fmtMoney = (amount?: number) => `${Number(amount ?? 0).toFixed(2)} BOB`

// ─── Colores para métodos de pago ─────────────────────────────────────────────
const METODO_COLORS: Record<number, string> = {
  1: '#5C6BC0',
  2: '#FFA726',
  3: '#26A69A',
  4: '#AB47BC',
  5: '#42A5F5',
}

const getMetodoColor = (codigo?: number, idx = 0): string => {
  if (codigo && METODO_COLORS[codigo]) return METODO_COLORS[codigo]
  const fallback = ['#5C6BC0', '#FFA726', '#26A69A', '#AB47BC', '#42A5F5', '#EF5350']
  return fallback[idx % fallback.length]
}

const getMetodoLabel = (descripcion?: string): string => {
  if (!descripcion) return 'Otro'
  const lower = descripcion.toLowerCase()
  if (lower.includes('efectivo')) return descripcion
  if (lower.includes('tarjeta') && lower.includes('cr')) return 'Tarjeta de Crédito'
  if (lower.includes('tarjeta') && lower.includes('db')) return 'Tarjeta de Débito'
  if (lower.includes('tarjeta')) return 'Tarjeta'
  if (lower.includes('qr') || lower.includes('yape') || lower.includes('plin')) return 'Yape/Plin'
  if (lower.includes('transfer')) return 'Transferencia'
  return descripcion
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const UltimaCajaSkeleton: FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />
    <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
    <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
    <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
    <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />
  </Box>
)

// ─── Empty state ──────────────────────────────────────────────────────────────
const UltimaCajaEmpty: FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 12,
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        bgcolor: (t) => alpha(t.palette.info.main, 0.1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 1,
      }}
    >
      <History sx={{ fontSize: 32, color: 'info.main' }} />
    </Box>
    <Typography variant="subtitle1" fontWeight={700}>
      Sin historial disponible
    </Typography>
    <Typography variant="body2" color="text.secondary">
      No se encontró ninguna caja cerrada en este punto de venta
    </Typography>
  </Box>
)

// ─── Info item ────────────────────────────────────────────────────────────────
interface InfoItemProps {
  label: string
  value: string
  highlight?: boolean
}

const InfoItem: FC<InfoItemProps> = ({ label, value, highlight }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0.3,
      px: 2,
      py: 1.5,
      borderRadius: 2,
      bgcolor: highlight ? (t) => alpha(t.palette.primary.main, 0.06) : 'transparent',
      border: highlight ? (t) => `1px solid ${alpha(t.palette.primary.main, 0.15)}` : 'none',
    }}
  >
    <Typography
      variant="caption"
      fontWeight={700}
      color="text.secondary"
      sx={{ letterSpacing: 0.6, textTransform: 'uppercase', fontSize: '0.68rem' }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      fontWeight={highlight ? 700 : 500}
      color={highlight ? 'primary.main' : 'text.primary'}
    >
      {value}
    </Typography>
  </Box>
)

// ─── Section header ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
}

const SectionHeader: FC<SectionHeaderProps> = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: 1.5,
        bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
  </Box>
)

// ─── Main component ───────────────────────────────────────────────────────────
const UltimaCaja: FC = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const { sucursal, puntoVenta } = user

  // Traemos varias cajas en estado FINALIZADO y filtramos en cliente
  // por puntoVenta.codigo y sucursal.codigo, porque la API arqueoCajaListado
  // no soporta filtros con notacion de punto en campos anidados.
  const { data, isLoading } = useArqueoCajaListado(
    { limit: 20, query: 'state=FINALIZADO', reverse: true },
    { staleTime: 30_000 },
  )

  const caja = useMemo(() => {
    const docs = data?.docs ?? []
    return (
      docs.find(
        (d) => d.puntoVenta?.codigo === puntoVenta.codigo && d.sucursal?.codigo === sucursal.codigo,
      ) ?? null
    )
  }, [data?.docs, puntoVenta.codigo, sucursal.codigo])

  const pieData = useMemo(() => {
    const metodos = caja?.metodoPagoVenta ?? []
    return metodos
      .filter((m: ArqueoCajaMetodoPago) => (m.monto ?? 0) > 0)
      .map((m: ArqueoCajaMetodoPago, idx: number) => ({
        name: getMetodoLabel(m.metodoPago?.descripcion),
        value: m.monto ?? 0,
        color: getMetodoColor(m.metodoPago?.codigoClasificador, idx),
      }))
  }, [caja])

  const obsCierre = caja?.observaciones?.find((o) => o.accion === 'CIERRE_CAJA')
  const obsApertura = caja?.observaciones?.find((o) => o.accion === 'APERTURA_CAJA')
  const cajeroRegistro = obsCierre?.usuario ?? caja?.usuarioCierre ?? '—'

  const diferencia = caja?.diferencia ?? 0
  const hayDiferencia = diferencia !== 0
  const diferenciaPositiva = diferencia > 0

  if (isLoading) return <UltimaCajaSkeleton />
  if (!caja) return <UltimaCajaEmpty />

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* HEADER */}
      <Card
        sx={{
          borderRadius: 3,
          p: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: theme.shadows[1],
          border: `1px solid ${theme.palette.divider}`,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <History sx={{ color: 'primary.main', fontSize: 22 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                {caja.cajaCodigo ?? `Caja ${caja.cajaId}`}
              </Typography>
              {caja.turnoCaja?.nombre && (
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  | Turno {caja.turnoCaja.nombre}
                </Typography>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: 0.5 }}>
              RESUMEN DE CIERRE
            </Typography>
          </Box>
        </Box>

        {caja.representacionGrafica?.pdf && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Assessment sx={{ fontSize: '1rem !important' }} />}
            href={caja.representacionGrafica.pdf}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'primary.main',
              borderColor: (t) => alpha(t.palette.primary.main, 0.35),
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
              },
            }}
          >
            Ver Arqueo Completo
          </Button>
        )}
      </Card>

      {/* TIEMPOS Y REGISTRO */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3,
          boxShadow: theme.shadows[1],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <SectionHeader
          icon={<History sx={{ fontSize: 16, color: 'primary.main' }} />}
          title="Tiempos y Registro"
        />
        <Divider sx={{ mb: 2.5 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <InfoItem label="Apertura" value={formatFechaHora(obsApertura?.fecha ?? caja.fechaApertura)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <InfoItem label="Cierre" value={formatFechaHora(obsCierre?.fecha ?? caja.fechaCierre)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <InfoItem label="Registro Cajero" value={cajeroRegistro} highlight />
          </Grid>
        </Grid>
      </Card>

      {/* RESUMEN Y MÉTODOS DE PAGO */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3,
          boxShadow: theme.shadows[1],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <SectionHeader
          icon={<TrendingUp sx={{ fontSize: 16, color: 'primary.main' }} />}
          title="Resumen y Métodos de Pago"
        />
        <Divider sx={{ mb: 2.5 }} />

        <Grid container spacing={3} alignItems="center">
          {/* Cifras */}
          <Grid size={{ xs: 12, sm: 7 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Nº Ventas Realizadas
                </Typography>
                <Chip
                  label={caja.nroVentas ?? 0}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    bgcolor: (t) => alpha(t.palette.text.primary, 0.07),
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Ventas (Global)
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {fmtMoney(caja.totalVentas)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Cortesias
                </Typography>
                <Typography variant="body1" fontWeight={600} color="text.secondary">
                  {fmtMoney(caja.cortesia?.montoTotal)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Donut chart */}
          <Grid size={{ xs: 12, sm: 5 }}>
            {pieData.length > 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <PieChart width={160} height={160}>
                  <Pie
                    data={pieData}
                    cx={75}
                    cy={75}
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [`${Number(value).toFixed(2)} BOB`, '']}
                    contentStyle={{
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: theme.shadows[4],
                      fontSize: '0.78rem',
                    }}
                  />
                </PieChart>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    justifyContent: 'center',
                  }}
                >
                  {pieData.map((entry) => (
                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: entry.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {entry.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 160,
                }}
              >
                <Typography variant="caption" color="text.disabled">
                  Sin datos de métodos de pago
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* MOVIMIENTOS DE CAJA */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3,
          boxShadow: theme.shadows[1],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <SectionHeader
          icon={<Wallet sx={{ fontSize: 16, color: 'primary.main' }} />}
          title="Movimientos de Caja"
        />
        <Divider sx={{ mb: 2.5 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ letterSpacing: 0.6, textTransform: 'uppercase', fontSize: '0.68rem' }}
              >
                Importe Inicial
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {fmtMoney(caja.montoInicial)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ letterSpacing: 0.6, textTransform: 'uppercase', fontSize: '0.68rem' }}
              >
                Total Ingresos Extra
              </Typography>
              <Typography variant="body1" fontWeight={700} color="success.main">
                +{fmtMoney(caja.totalIngresos)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ letterSpacing: 0.6, textTransform: 'uppercase', fontSize: '0.68rem' }}
              >
                Total Retiros
              </Typography>
              <Typography variant="body1" fontWeight={700} color="error.main">
                -{fmtMoney(caja.totalRetiros)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.4,
                p: 1.5,
                borderRadius: 2,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.15)}`,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                color="primary.main"
                sx={{ letterSpacing: 0.6, textTransform: 'uppercase', fontSize: '0.68rem' }}
              >
                Total Declarado (*)
              </Typography>
              <Typography variant="body1" fontWeight={800} color="primary.main">
                {fmtMoney(caja.montoReal ?? caja.montoTeorico)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}
        >
          (*) El Total Declarado corresponde al monto registrado fisicamente por el cajero al momento del
          cierre.
        </Typography>
      </Card>

      {/* DIFERENCIA DEL ARQUEO */}
      <Card
        sx={{
          borderRadius: 3,
          p: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: theme.shadows[1],
          border: (t) =>
            `1px solid ${
              hayDiferencia
                ? alpha(diferenciaPositiva ? t.palette.success.main : t.palette.error.main, 0.3)
                : alpha(t.palette.success.main, 0.3)
            }`,
          bgcolor: (t) =>
            hayDiferencia
              ? alpha(diferenciaPositiva ? t.palette.success.main : t.palette.error.main, 0.04)
              : alpha(t.palette.success.main, 0.04),
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: (t) =>
                alpha(
                  hayDiferencia
                    ? diferenciaPositiva
                      ? t.palette.success.main
                      : t.palette.error.main
                    : t.palette.success.main,
                  0.12,
                ),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hayDiferencia ? (
              <Warning sx={{ fontSize: 22, color: diferenciaPositiva ? 'success.main' : 'error.main' }} />
            ) : (
              <CheckCircle sx={{ fontSize: 22, color: 'success.main' }} />
            )}
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={hayDiferencia ? (diferenciaPositiva ? 'success.main' : 'error.main') : 'success.main'}
            >
              Diferencia del Arqueo
            </Typography>
            <Typography
              variant="caption"
              color={hayDiferencia ? (diferenciaPositiva ? 'success.dark' : 'error.dark') : 'success.dark'}
              fontWeight={500}
            >
              {hayDiferencia
                ? diferenciaPositiva
                  ? 'Sobrante de dinero detectado.'
                  : 'Faltante de dinero en caja detectado.'
                : 'Sin diferencias. Arqueo perfecto.'}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h5"
          fontWeight={800}
          color={hayDiferencia ? (diferenciaPositiva ? 'success.main' : 'error.main') : 'success.main'}
        >
          {diferencia > 0 ? '+' : ''}
          {fmtMoney(diferencia)}
        </Typography>
      </Card>
    </Box>
  )
}

export default UltimaCaja
