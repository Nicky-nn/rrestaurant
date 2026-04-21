import { Calculate, Close, LockOpen, Person } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { FC, useEffect, useMemo, useState } from 'react'

import AppSelect, { AppSelectOption } from '../../../base/components/MySelect/AppSelect'
import useAuth from '../../../base/hooks/useAuth'
import useCajas from '../../../base/hooks/useCajas'
import { useAperturaCajaRegistro } from '../mutations/useAperturaCajaRegistro'
import { useCajaListado } from '../queries/useCajaListado'
import { useTurnoCajaListado } from '../queries/useTurnoCajaListado'
import CalculadoraEfectivoDialog from './CalculadoraEfectivoDialog'

/**
 * Selecciona el turno más apropiado según la hora actual.
 * Compara horaInicio y horaCierre (números 0-24).
 */
const seleccionarTurnoPorHora = (
  turnos: { _id?: string; nombre?: string; horaInicio?: number; horaCierre?: number }[],
) => {
  const horaActual = new Date().getHours()
  for (const turno of turnos) {
    const inicio = turno.horaInicio ?? 0
    const cierre = turno.horaCierre ?? 24
    if (horaActual >= inicio && horaActual < cierre) return turno._id ?? ''
  }
  return turnos[0]?._id ?? ''
}

interface AperturaCajaDialogProps {
  open: boolean
  onSuccess: () => void
  onClose?: () => void
}

const AperturaCajaDialog: FC<AperturaCajaDialogProps> = ({ open, onSuccess, onClose }) => {
  const { user } = useAuth()
  const { refetchCajas, refetchArqueoActivo } = useCajas()
  const { usuario, sucursal, puntoVenta } = user

  // Query cajas disponibles filtradas por estado CERRADO + punto de venta + sucursal + usuario
  const queryStr = `state=CERRADO&puntoVenta.codigo=${puntoVenta.codigo}&sucursal.codigo=${sucursal.codigo}&usuarios.usuario=${usuario}`
  const { data: cajaConnection, isLoading: loadingCajas } = useCajaListado(
    { limit: 50, query: queryStr },
    { enabled: open },
  )
  const cajas = useMemo(() => cajaConnection?.docs ?? [], [cajaConnection?.docs])

  // Query turnos
  const { data: turnos = [], isLoading: loadingTurnos } = useTurnoCajaListado({}, { enabled: open })

  // Mutation apertura
  const { mutate: abrirCaja, isPending } = useAperturaCajaRegistro()

  // Form state
  const [cajaId, setCajaId] = useState('')
  const [turnoId, setTurnoId] = useState('')
  const [montoInicial, setMontoInicial] = useState<string>('0')
  const [observacion, setObservacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [openCalc, setOpenCalc] = useState(false)

  // Auto-seleccionar caja si hay solo una
  useEffect(() => {
    if (cajas.length === 1 && !cajaId) setCajaId(cajas[0]._id ?? '')
  }, [cajas, cajaId])

  // Auto-seleccionar turno por hora actual
  useEffect(() => {
    if (turnos.length > 0 && !turnoId) {
      setTurnoId(seleccionarTurnoPorHora(turnos))
    }
  }, [turnos, turnoId])

  const cajaOptions: AppSelectOption[] = useMemo(
    () => cajas.map((c) => ({ value: c._id ?? '', label: `Caja ${c.codigo}` })),
    [cajas],
  )

  const turnoOptions: AppSelectOption[] = useMemo(
    () => turnos.map((t) => ({ value: t._id ?? '', label: t.nombre ?? '' })),
    [turnos],
  )

  const handleSubmit = () => {
    setError(null)
    if (!cajaId) return setError('Selecciona una caja')
    if (!turnoId) return setError('Selecciona un turno')

    const monto = parseFloat(montoInicial) || 0

    abrirCaja(
      {
        cajaId,
        entidad: {
          codigoSucursal: sucursal.codigo,
          codigoPuntoVenta: puntoVenta.codigo,
        },
        modulo: 'REST',
        input: {
          montoInicial: monto,
          turnoCajaId: turnoId,
          observacion: observacion || undefined,
        },
      },
      {
        onSuccess: async () => {
          await Promise.all([refetchCajas(), refetchArqueoActivo()])
          setEsVisible(false)
          onSuccess()
        },
        onError: (e: any) => {
          const msg = e?.response?.errors?.[0]?.message ?? e?.message ?? 'Error al abrir la caja'
          setError(msg)
        },
      },
    )
  }

  const [esVisible, setEsVisible] = useState(open)

  useEffect(() => {
    setEsVisible(open)
  }, [open])

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setEsVisible(false)
    }
  }

  return (
    <Dialog
      open={esVisible}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      onClose={handleClose}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          boxShadow: '0px 20px 40px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1, position: 'relative' }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
          }}
        >
          <Close />
        </IconButton>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1.5} pt={1}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: (theme) => `${theme.palette.primary.main}1A`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockOpen sx={{ fontSize: 32, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            Apertura de Caja
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ px: 1 }}>
            Selecciona la caja, el turno y el monto base para comenzar a operar.
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 4 }, pb: 4 }}>
        <Stack spacing={3} mt={2}>
          {/* SUPERVISOR (CURRENT USER) */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              display="block"
              mb={1}
              sx={{ letterSpacing: 0.5 }}
            >
              RESPONSABLE / SUPERVISOR
            </Typography>
            <TextField
              size="small"
              value={usuario || 'Desconocido'}
              disabled
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: (theme) => theme.palette.action.hover,
                  '& .Mui-disabled': {
                    color: 'text.primary',
                    WebkitTextFillColor: 'unset',
                  },
                },
              }}
            />
          </Box>

          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            {/* CAJA */}
            <Box flex={1}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                display="block"
                mb={1}
                sx={{ letterSpacing: 0.5 }}
              >
                CAJA DISPONIBLE
              </Typography>
              <FormControl fullWidth size="small">
                <AppSelect
                  value={cajaId}
                  onChange={(e) => setCajaId(e.target.value as string)}
                  options={cajaOptions}
                  disabled={loadingCajas}
                  sx={{ borderRadius: 2, bgcolor: (theme) => theme.palette.action.hover }}
                />
              </FormControl>
            </Box>

            {/* TURNO */}
            <Box flex={1}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                display="block"
                mb={1}
                sx={{ letterSpacing: 0.5 }}
              >
                TURNO
              </Typography>
              <FormControl fullWidth size="small">
                <AppSelect
                  value={turnoId}
                  onChange={(e) => setTurnoId(e.target.value as string)}
                  options={turnoOptions}
                  disabled={loadingTurnos}
                  sx={{ borderRadius: 2, bgcolor: (theme) => theme.palette.action.hover }}
                />
              </FormControl>
            </Box>
          </Box>

          {/* MONTO INICIAL */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              display="block"
              mb={1}
              sx={{ letterSpacing: 0.5 }}
            >
              MONTO INICIAL EN EFECTIVO
            </Typography>
            <FormControl fullWidth size="small">
              <OutlinedInput
                value={montoInicial}
                onChange={(e) => {
                  let val = e.target.value
                  if (val.includes('.')) {
                    const parts = val.split('.')
                    if (parts[1].length > 2) {
                      val = `${parts[0]}.${parts[1].slice(0, 2)}`
                    }
                  }
                  setMontoInicial(val)
                }}
                onBlur={() => {
                  const val = parseFloat(montoInicial)
                  if (!isNaN(val)) {
                    // Formatear si falta algún cero, pero ya no redondea si está limitado a 2 decimales
                    const parts = montoInicial.split('.')
                    if (!parts[1]) setMontoInicial(`${Math.floor(val)}.00`)
                    else if (parts[1].length === 1) setMontoInicial(`${parts[0]}.${parts[1]}0`)
                  }
                }}
                type="number"
                inputProps={{ min: 0, step: '10' }}
                placeholder="0.00"
                sx={{
                  borderRadius: 2,
                  bgcolor: (theme) => theme.palette.action.hover,
                  fontWeight: 700,
                  color: 'text.secondary',
                  fontSize: '1.2rem',
                  py: 0.5,
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mr: 1 }}>
                      BOB
                    </Typography>
                    <IconButton onClick={() => setOpenCalc(true)} edge="end">
                      <Calculate sx={{ color: 'text.secondary' }} />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Box>

          {/* OBSERVACION */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              display="block"
              mb={1}
              sx={{ letterSpacing: 0.5 }}
            >
              OBSERVACIÓN (OPCIONAL)
            </Typography>
            <TextField
              size="small"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Cambio en monedas y billetes chicos..."
              fullWidth
              InputProps={{
                sx: {
                  borderRadius: 2,
                  bgcolor: (theme) => theme.palette.action.hover,
                },
              }}
            />
          </Box>

          {error && (
            <Typography variant="caption" color="error.main" fontWeight="bold">
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            size="large"
            color="primary"
            fullWidth
            startIcon={<LockOpen sx={{ fontSize: 20 }} />}
            onClick={handleSubmit}
            disabled={isPending || loadingCajas || loadingTurnos}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: '1.05rem',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2.5,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            {isPending ? 'Abriendo...' : 'Abrir Caja y Comenzar'}
          </Button>
        </Stack>
      </DialogContent>

      <CalculadoraEfectivoDialog
        open={openCalc}
        onClose={() => setOpenCalc(false)}
        onConfirm={(total) => setMontoInicial(total.toFixed(2))}
      />
    </Dialog>
  )
}

export default AperturaCajaDialog
