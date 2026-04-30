import { LockOutlined, Payments } from '@mui/icons-material'
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
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { FC, useState } from 'react'

import AppSelect, { AppSelectOption } from '../../../base/components/MySelect/AppSelect'
import useAuth from '../../../base/hooks/useAuth'
import useCajas from '../../../base/hooks/useCajas'
import { useAperturaCajaCerrar } from '../mutations/useAperturaCajaCerrar'
import { ArqueoCaja, ArqueoCajaMetodoPago } from '../types'

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

  const supervisorOptions: AppSelectOption[] = Array.from(new Set([...supervisores, user.usuario])).map(
    (s) => ({ value: s, label: s }),
  )

  const [supervisor, setSupervisor] = useState<string>(
    (supervisorOptions[0]?.value as string) ?? user.usuario,
  )
  const [observacion, setObservacion] = useState('')
  const [error, setError] = useState<string | null>(null)

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

    const metodos = caja.metodoPagoVenta ?? []

    // When no methods registered send empty array; montoReal goes at root level
    const metodoPagoPayload = metodos.map((m: ArqueoCajaMetodoPago) => ({
      codigoMetodoPago: m.metodoPago?.codigoClasificador ?? 1,
      monto: m.monto ?? 0,
    }))

    cerrarCaja(
      {
        id: caja._id!,
        input: {
          metodoPago: metodoPagoPayload,
          montoReal,
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

  const metodos = caja.metodoPagoVenta ?? []

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
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
          Finaliza la sesión indicando el supervisor a cargo y un comentario final obligatorio.
        </Typography>

        <Stack spacing={2.5}>
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

          {/* Montos por método de pago */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.16),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
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

            {metodos.length === 0 ? (
              <Typography variant="caption" color="text.disabled" fontStyle="italic">
                No existen métodos de pago registrados
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {metodos.map((m: ArqueoCajaMetodoPago) => {
                  const label = m.metodoPago?.descripcion ?? 'Otro'
                  const montoSistema = m.monto ?? 0
                  return (
                    <Box
                      key={m.metodoPago?.codigoClasificador}
                      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {montoSistema.toFixed(2)} BOB
                      </Typography>
                    </Box>
                  )
                })}
              </Stack>
            )}
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
              rows={3}
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
          <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
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
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default CerrarCajaPaso2Dialog
