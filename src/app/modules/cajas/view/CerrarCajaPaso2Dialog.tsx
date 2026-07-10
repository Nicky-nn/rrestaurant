import { LockOutlined, Payments, DeleteOutline } from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Typography,
  useTheme,
  IconButton,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { FC, useState } from 'react'

import AppSelect, { AppSelectOption } from '../../../base/components/MySelect/AppSelect'
import useAuth from '../../../base/hooks/useAuth'
import useCajas from '../../../base/hooks/useCajas'
import { SecureComponent } from '../../../security'
import { useMetodosPago } from '../../restaurante/queries/useMetodosPago'
import { useAperturaCajaCerrar } from '../mutations/useAperturaCajaCerrar'
import { ArqueoCaja, ArqueoCajaMetodoPago } from '../types'
import NumberSpinnerField from '../../../base/components/NumberSpinnerField/NumberSpinnerField'

interface CerrarCajaPaso2DialogProps {
  open: boolean
  onClose: () => void
  onBack: () => void
  caja: ArqueoCaja
  montoReal?: number
  supervisores?: string[]
}

const CerrarCajaPaso2Dialog: FC<CerrarCajaPaso2DialogProps> = ({
  open,
  onClose,
  onBack,
  caja,
  montoReal = 0,
  supervisores = [],
}) => {
  const { user } = useAuth()
  const { refetchArqueoActivo, refetchCajas } = useCajas()
  const theme = useTheme()
  const queryClient = useQueryClient()

  const { mutate: cerrarCaja, isPending } = useAperturaCajaCerrar()
  const { data: metodosPagoData } = useMetodosPago({})

  const supervisorOptions: AppSelectOption[] = Array.from(new Set([...supervisores, user.usuario])).map(
    (s) => ({ value: s, label: s }),
  )

  const [supervisor, setSupervisor] = useState<string>(
    (supervisorOptions[0]?.value as string) ?? user.usuario,
  )
  const [observacion, setObservacion] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [metodosMostrados, setMetodosMostrados] = useState<number[]>(() => {
    const fromCaja = caja?.metodoPagoVenta?.map((mp) => mp.metodoPago?.codigoClasificador || 1) || []
    return Array.from(new Set(fromCaja))
  })

  const [montosPago, setMontosPago] = useState<Record<number, number | null>>(() => {
    const init: Record<number, number | null> = {}
    caja?.metodoPagoVenta?.forEach((mp) => {
      const cod = mp.metodoPago?.codigoClasificador || 1
      init[cod] = null
    })
    return init
  })

  const metodosDisponibles =
    metodosPagoData?.filter(
      (mp) => mp.codigoClasificador && !metodosMostrados.includes(mp.codigoClasificador),
    ) || []

  const reset = () => {
    setSupervisor((supervisorOptions[0]?.value as string) ?? user.usuario)
    setObservacion('')
    setError(null)
  }

  const handleClose = () => {
    if (isPending) return
    reset()
    onClose()
  }

  const handleSubmit = () => {
    if (!observacion.trim()) {
      setError('El comentario de cierre es obligatorio.')
      return
    }
    setError(null)

    // When no methods registered send empty array; montoReal goes at root level
    const metodoPagoPayload =
      metodosMostrados.length > 0
        ? metodosMostrados.map((cod) => ({
            codigoMetodoPago: cod,
            monto: montosPago[cod] || 0,
          }))
        : [{ codigoMetodoPago: 1, monto: 0 }]

    cerrarCaja(
      {
        id: caja._id!,
        input: {
          metodoPago: metodoPagoPayload,
          observacion: observacion.trim(),
          supervisor,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['arqueoCajaListado'] })
          refetchArqueoActivo()
          refetchCajas()
          reset()
          onClose()
        },
        onError: (err: any) => {
          setError(err.message || 'Error al cerrar la caja')
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, boxShadow: theme.shadows[8] } }}
    >
      <DialogContent sx={{ p: 4 }}>
        {/* Icon */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.text.primary, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <LockOutlined sx={{ fontSize: 22, color: 'text.primary' }} />
        </Box>

        {/* Title */}
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Paso 2: Confirmar Cierre
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          Ingresa el total por método de pago, asigna el supervisor y añade un comentario para finalizar el
          cierre.
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* LEFT COLUMN: Info & Actions */}
          <Stack spacing={2.5} sx={{ flex: 1 }}>
            {/* Supervisor */}
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                sx={{ fontSize: '0.65rem', letterSpacing: 1 }}
              >
                SUPERVISOR A CARGO
              </Typography>
              <AppSelect
                options={supervisorOptions}
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value as string)}
                size="small"
                fullWidth
                sx={{ mt: 0.5 }}
              />
            </Box>

            {/* Comentario obligatorio */}
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                sx={{ fontSize: '0.65rem', letterSpacing: 1 }}
              >
                COMENTARIO DE CIERRE{' '}
                <Box component="span" color="error.main">
                  *
                </Box>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                size="small"
                placeholder="Detalle o comentario final obligatorio..."
                value={observacion}
                onChange={(e) => {
                  setObservacion(e.target.value)
                  if (error) setError(null)
                }}
                error={!!error}
                helperText={error}
                sx={{ mt: 0.5 }}
              />
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', pt: 2 }}>
              <Button
                variant="outlined"
                size="large"
                disabled={isPending}
                onClick={() => {
                  reset()
                  onBack()
                }}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.divider, 1),
                  color: 'text.secondary',
                }}
              >
                Atrás
              </Button>
              <SecureComponent action="CERRAR_CAJA">
                <Button
                  variant="contained"
                  size="large"
                  disabled={isPending}
                  onClick={handleSubmit}
                  sx={{
                    flex: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: 'text.primary',
                    color: 'background.paper',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.text.primary, 0.85),
                      boxShadow: 'none',
                    },
                  }}
                >
                  {isPending ? 'Cerrando...' : 'Confirmar Cierre'}
                </Button>
              </SecureComponent>
            </Box>
          </Stack>

          {/* RIGHT COLUMN: Métodos de Pago */}
          <Stack spacing={2.5} sx={{ width: { xs: '100%', md: 420 } }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.16),
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexShrink: 0 }}>
                <Payments sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography
                  variant="overline"
                  color="primary.main"
                  fontWeight={700}
                  sx={{ letterSpacing: 0.5 }}
                >
                  Registrar Monto por Método de Pago
                </Typography>
              </Box>

              <Stack spacing={1.5} sx={{ maxHeight: 280, overflowY: 'auto', pr: 1 }}>
                {metodosMostrados.map((cod) => {
                  const fromCaja = caja?.metodoPagoVenta?.find(
                    (mp) => mp.metodoPago?.codigoClasificador === cod,
                  )
                  const isFromCaja = !!fromCaja
                  const fromData = metodosPagoData?.find((mp) => mp.codigoClasificador === cod)
                  const descripcion =
                    fromCaja?.metodoPago?.descripcion ||
                    fromData?.descripcion ||
                    (cod === 1 ? 'Efectivo' : 'Desconocido')
                  return (
                    <Box key={cod} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ flex: 1, fontWeight: 600 }}>
                        {descripcion}
                      </Typography>
                      <NumberSpinnerField
                        value={montosPago[cod] ?? null}
                        onChange={(val) => setMontosPago({ ...montosPago, [cod]: val })}
                        min={0}
                        step={10}
                        unit="Bs."
                        sx={{ width: 170, flexShrink: 0, bgcolor: 'background.paper', borderRadius: 1 }}
                      />
                      {!isFromCaja ? (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setMetodosMostrados((prev) => prev.filter((c) => c !== cod))
                            setMontosPago((prev) => {
                              const newMontos = { ...prev }
                              delete newMontos[cod]
                              return newMontos
                            })
                          }}
                          sx={{ width: 34, height: 34 }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      ) : (
                        <Box sx={{ width: 34 }} />
                      )}
                    </Box>
                  )
                })}

                {metodosDisponibles.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    <AppSelect
                      options={[
                        { value: 0, label: '+ Agregar otro método de pago...' },
                        ...metodosDisponibles.map((mp) => ({
                          value: mp.codigoClasificador!,
                          label: mp.descripcion!,
                        })),
                      ]}
                      value={0}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        if (val !== 0) {
                          setMetodosMostrados([...metodosMostrados, val])
                          setMontosPago({ ...montosPago, [val]: null })
                        }
                      }}
                      size="small"
                      fullWidth
                      sx={{ bgcolor: 'action.hover' }}
                    />
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default CerrarCajaPaso2Dialog
