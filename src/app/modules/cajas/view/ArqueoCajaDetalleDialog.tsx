import {
  ArrowBack,
  ArrowForward,
  Close,
  Download,
  Email,
  PictureAsPdf,
  TaskAlt,
  WhatsApp,
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { FC, useMemo, useState } from 'react'

import PdfViewerDialog from '../../reporte/components/PdfViewerDialog'
import { ArqueoCaja, ArqueoCajaIngreso, ArqueoCajaMetodoPago, ArqueoCajaRetiro } from '../types'

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

const formatHora = (fecha?: string) => {
  const d = parseFechaDMY(fecha)
  if (!d) return '—'
  return d.toLocaleTimeString('es-BO', { timeStyle: 'medium' })
}

const formatFechaHora = (fecha?: string) => {
  const d = parseFechaDMY(fecha)
  if (!d) return '—'
  return d.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'medium' })
}

const fmtMoney = (amount?: number, sign = false) => {
  const n = Number(amount ?? 0)
  const prefix = sign && n > 0 ? '+' : ''
  return `${prefix}${n.toFixed(2)} BOB`
}

// ─── Row resumen ──────────────────────────────────────────────────────────────

interface ResumenRowProps {
  label: string
  value: string
  color?: string
  bold?: boolean
  large?: boolean
}

const ResumenRow: FC<ResumenRowProps> = ({ label, value, color, bold, large }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: large ? 0.9 : 0.5,
    }}
  >
    <Typography variant={large ? 'body1' : 'body2'} fontWeight={bold ? 700 : 400}>
      {label}
    </Typography>
    <Typography
      variant={large ? 'body1' : 'body2'}
      fontWeight={bold ? 700 : 500}
      color={color ?? 'text.primary'}
    >
      {value}
    </Typography>
  </Box>
)

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArqueoCajaDetalleDialogProps {
  open: boolean
  caja: ArqueoCaja | null
  onClose: () => void
  canPrev?: boolean
  canNext?: boolean
  onPrev?: () => void
  onNext?: () => void
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

const ArqueoCajaDetalleDialog: FC<ArqueoCajaDetalleDialogProps> = ({
  open,
  caja,
  onClose,
  canPrev,
  canNext,
  onPrev,
  onNext,
}) => {
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null)
  const obsApertura = caja?.observaciones?.find((o) => o.accion === 'APERTURA_CAJA')
  const obsCierre = caja?.observaciones?.find((o) => o.accion === 'CIERRE_CAJA')

  const diferencia = caja?.diferencia ?? 0
  const diferenciaColor = diferencia === 0 ? '#16a34a' : diferencia > 0 ? '#2563eb' : '#dc2626'
  const montoReal = caja ? (caja.montoReal ?? caja.montoTeorico ?? 0) : 0
  const hasPdf = !!caja?.representacionGrafica?.pdf
  const hasRollo = !!caja?.representacionGrafica?.rollo

  // Línea de tiempo de movimientos: apertura + ingresos + retiros ordenados por hora
  const movimientos = useMemo(() => {
    if (!caja) return []
    type Movimiento = {
      fecha?: string
      tipo: 'apertura' | 'ingreso' | 'retiro'
      titulo: string
      subtitulo?: string
      monto: number
    }
    const lista: Movimiento[] = []
    // Apertura
    lista.push({
      fecha: obsApertura?.fecha ?? caja.fechaApertura,
      tipo: 'apertura',
      titulo: 'Apertura',
      subtitulo: obsApertura?.observacion,
      monto: caja.montoInicial ?? 0,
    })
    // Ingresos
    ;(caja.ingresos ?? []).forEach((ing: ArqueoCajaIngreso) => {
      lista.push({
        fecha: ing.fecha,
        tipo: 'ingreso',
        titulo: ing.motivo ?? 'Ingreso',
        subtitulo: ing.usuario ? `Por: ${ing.usuario}` : undefined,
        monto: ing.monto ?? 0,
      })
    })
    // Retiros
    ;(caja.retiros ?? []).forEach((ret: ArqueoCajaRetiro) => {
      const comp = ret.comprobante?.tipo ? `${ret.comprobante.tipo} #${ret.comprobante.numero}` : undefined
      const benef = ret.beneficiario ? `A: ${ret.beneficiario}` : undefined
      const sub = [comp, benef].filter(Boolean).join('  ')
      lista.push({
        fecha: ret.fecha,
        tipo: 'retiro',
        titulo: ret.motivo ?? 'Retiro',
        subtitulo: sub || undefined,
        monto: ret.monto ?? 0,
      })
    })
    lista.sort((a, b) => {
      const da = parseFechaDMY(a.fecha)?.getTime() ?? 0
      const db = parseFechaDMY(b.fecha)?.getTime() ?? 0
      return da - db
    })
    return lista
  }, [caja, obsApertura])

  const tieneComentarios = !!(obsApertura?.observacion || obsCierre?.observacion)
  const tieneMovimientos = movimientos.length > 0

  // Guard AFTER all hooks
  if (!caja) return null

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(4px)',
              backgroundColor: 'rgba(0,0,0,0.35)',
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
          },
        }}
      >
        {/* ─── HEADER con navegación ──────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            pt: 2.5,
            pb: 2,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          {/* Prev */}
          <Tooltip title="Anterior">
            <span>
              <IconButton size="small" onClick={onPrev} disabled={!canPrev} sx={{ mr: 1 }}>
                <ArrowBack fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          {/* Titulo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TaskAlt sx={{ color: 'primary.main', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                Detalles de {caja.cajaCodigo ?? `Caja ${caja.cajaId}`}
              </Typography>
              {caja.turnoCaja?.nombre && (
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Turno {caja.turnoCaja.nombre}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Next + Close */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Siguiente">
              <span>
                <IconButton size="small" onClick={onNext} disabled={!canNext}>
                  <ArrowForward fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', ml: 0.5 }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
          <Stack spacing={0} divider={<Divider />}>
            {/* ─── APERTURA / CIERRE ─────────────────────────────────────────── */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                px: 3,
                py: 2.5,
                bgcolor: (t) => alpha(t.palette.background.default, 0.6),
              }}
            >
              {/* Apertura */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.68rem' }}
                >
                  Apertura
                </Typography>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.4 }}>
                  {formatFechaHora(obsApertura?.fecha ?? caja.fechaApertura)}
                </Typography>
                {obsApertura?.observacion && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
                  >
                    "{obsApertura.observacion}"
                  </Typography>
                )}
              </Box>

              {/* Cierre */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.68rem' }}
                >
                  Cierre
                </Typography>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.4 }}>
                  {formatFechaHora(obsCierre?.fecha ?? caja.fechaCierre)}
                </Typography>
                {obsCierre?.usuario && (
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="primary.main"
                    display="block"
                    sx={{ mt: 0.2 }}
                  >
                    Sup: {obsCierre.usuario}
                  </Typography>
                )}
                {obsCierre?.observacion && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.3, fontStyle: 'italic' }}
                  >
                    "{obsCierre.observacion}"
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ─── RESUMEN DE ARQUEO ─────────────────────────────────────────── */}
            <Box sx={{ px: 3, py: 2.5 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                  border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ mb: 1.5 }}>
                  Resumen de Arqueo
                </Typography>

                <ResumenRow label="Monto Inicial:" value={fmtMoney(caja.montoInicial)} />

                {(caja.metodoPagoVenta ?? [])
                  .filter((m: ArqueoCajaMetodoPago) => (m.monto ?? 0) > 0)
                  .map((m: ArqueoCajaMetodoPago, i: number) => (
                    <ResumenRow
                      key={i}
                      label={`Ventas (${m.metodoPago?.descripcion ?? 'Otro'}):`}
                      value={fmtMoney(m.monto, true)}
                      color="#16a34a"
                    />
                  ))}

                {(caja.totalIngresos ?? 0) > 0 && (
                  <ResumenRow
                    label="Otros Ingresos de Caja:"
                    value={fmtMoney(caja.totalIngresos, true)}
                    color="#16a34a"
                  />
                )}

                {(caja.totalRetiros ?? 0) > 0 && (
                  <ResumenRow
                    label="Total Retiros/Gastos:"
                    value={`-${Number(caja.totalRetiros).toFixed(2)} BOB`}
                    color="#dc2626"
                  />
                )}

                <Divider sx={{ my: 1.2 }} />

                <ResumenRow label="Total Sistema Esperado:" value={fmtMoney(caja.montoTeorico)} bold />
                <ResumenRow label="Total Contado Real:" value={fmtMoney(montoReal)} bold large />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Typography variant="body2" fontWeight={700} color={diferenciaColor}>
                    Diferencia: {diferencia > 0 ? '+' : ''}
                    {Number(diferencia).toFixed(2)} BOB
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ─── COMENTARIOS DE SESION ─────────────────────────────────────── */}
            {tieneComentarios && (
              <Box sx={{ px: 3, py: 2.5 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ letterSpacing: 0.8, textTransform: 'uppercase', fontSize: '0.68rem' }}
                >
                  Comentarios de Sesion
                </Typography>
                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  {obsApertura?.observacion && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: (t) => alpha(t.palette.background.default, 0.8),
                        border: (t) => `1px solid ${t.palette.divider}`,
                      }}
                    >
                      <Typography variant="caption" fontWeight={700} display="block">
                        Apertura:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {obsApertura.observacion}
                      </Typography>
                    </Box>
                  )}
                  {obsCierre?.observacion && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: (t) => alpha(t.palette.background.default, 0.8),
                        border: (t) => `1px solid ${t.palette.divider}`,
                      }}
                    >
                      <Typography variant="caption" fontWeight={700} display="block">
                        Cierre:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {obsCierre.observacion}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            )}

            {/* ─── REGISTRO DE MOVIMIENTOS ───────────────────────────────────── */}
            {tieneMovimientos && (
              <Box sx={{ px: 3, py: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Registro de Movimientos
                </Typography>
                <Stack spacing={1}>
                  {movimientos.map((mov, i) => {
                    const isApertura = mov.tipo === 'apertura'
                    const isIngreso = mov.tipo === 'ingreso'
                    const montoColor = isApertura ? '#2563eb' : isIngreso ? '#16a34a' : '#dc2626'
                    const montoPrefix = isApertura ? '+' : isIngreso ? '+' : '-'

                    return (
                      <Box
                        key={i}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: (t) =>
                            alpha(
                              isApertura
                                ? t.palette.primary.main
                                : isIngreso
                                  ? t.palette.success.main
                                  : t.palette.error.main,
                              0.04,
                            ),
                          border: (t) =>
                            `1px solid ${alpha(
                              isApertura
                                ? t.palette.primary.main
                                : isIngreso
                                  ? t.palette.success.main
                                  : t.palette.error.main,
                              0.18,
                            )}`,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {mov.titulo}
                          </Typography>
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2, flexWrap: 'wrap' }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {formatHora(mov.fecha)}
                            </Typography>
                            {mov.subtitulo && (
                              <Typography variant="caption" color="text.disabled">
                                {mov.subtitulo}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={montoColor}
                          sx={{ whiteSpace: 'nowrap', ml: 2 }}
                        >
                          {montoPrefix}
                          {Number(mov.monto).toFixed(2)} BOB
                        </Typography>
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            )}

            {/* ─── FIN SECCIONES SCROLLEABLES ─── */}
          </Stack>
        </DialogContent>

        {/* ─── ACCIONES STICKY ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            gap: 1,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            borderTop: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: 'background.paper',

            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 3,
            },
          }}
        >
          {hasRollo && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Download sx={{ fontSize: '1rem !important' }} />}
              onClick={() => setPdfViewerUrl(caja.representacionGrafica!.rollo!)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.8rem',
                flex: '1 0 auto',
                minWidth: 140,
              }}
            >
              Descargar Rollo
            </Button>
          )}

          {hasPdf && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<PictureAsPdf sx={{ fontSize: '1rem !important' }} />}
              onClick={() => setPdfViewerUrl(caja.representacionGrafica!.pdf!)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.8rem',
                flex: '1 0 auto',
                minWidth: 120,
              }}
            >
              Descargar PDF
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            color="info"
            startIcon={<Email sx={{ fontSize: '1rem !important' }} />}
            disabled
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.8rem',
              flex: '1 0 auto',
              minWidth: 160,
            }}
          >
            Enviar Correo
          </Button>

          <Button
            size="small"
            variant="outlined"
            startIcon={<WhatsApp sx={{ fontSize: '1rem !important' }} />}
            disabled
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.8rem',
              flex: '1 0 auto',
              minWidth: 140,
              color: '#25D366',
              borderColor: alpha('#25D366', 0.4),
            }}
          >
            WhatsApp
          </Button>
        </Box>
      </Dialog>

      {/* Viewer PDF/Rollo */}
      <PdfViewerDialog open={!!pdfViewerUrl} pdfUrl={pdfViewerUrl} onClose={() => setPdfViewerUrl(null)} />
    </>
  )
}

export default ArqueoCajaDetalleDialog
