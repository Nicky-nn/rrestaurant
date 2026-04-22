import { AccountBalanceWallet, Calculate, Close } from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { FC, useEffect, useState } from 'react'

import useCajas from '../../../base/hooks/useCajas'
import { useAperturaCajaArquear } from '../mutations/useAperturaCajaArquear'
import { ArqueoCaja } from '../types'
import CalculadoraEfectivoDialog from './CalculadoraEfectivoDialog'

interface ArqueoCajaPaso1DialogProps {
  open: boolean
  onClose: () => void
  caja: ArqueoCaja
  onNext: (montoReal: number) => void
}

const formatMoney = (amount: number = 0) => `${Number(amount).toFixed(2)} BOB`

const ArqueoCajaPaso1Dialog: FC<ArqueoCajaPaso1DialogProps> = ({ open, onClose, caja, onNext }) => {
  const { refetchArqueoActivo } = useCajas()
  const theme = useTheme()
  const queryClient = useQueryClient()

  const { mutate: arquearCaja, isPending } = useAperturaCajaArquear()

  const [montoSist, setMontoSist] = useState<number>(0)
  const [montoReal, setMontoReal] = useState<string>('')
  const [observacion, setObservacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [openCalc, setOpenCalc] = useState(false)

  useEffect(() => {
    if (caja) {
      const teorico = (caja.montoInicial || 0) + (caja.totalIngresos || 0) - (caja.totalRetiros || 0)
      setMontoSist(teorico)
    }
  }, [caja])

  const resetForm = () => {
    setMontoReal('')
    setObservacion('')
    setError(null)
    setOpenCalc(false)
  }

  const handleClose = () => {
    if (isPending) return
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
    setError(null)
    const numericMontoReal = parseFloat(montoReal)

    if (isNaN(numericMontoReal) || numericMontoReal < 0) {
      setError('Por favor, ingresa el efectivo contado real.')
      return
    }

    // Wait, since the GraphQL mutation schema expects:
    // export interface AperturaCajaArquearInput { observacion?: string }
    // the mutation doesn't take montoReal. But the UI requires inputting it to verify right before closing!
    // However, I can't pass montoReal into input. Let's just pass `observacion` as allowed and proceed.
    arquearCaja(
      {
        id: caja._id!,
        input: {
          observacion: observacion.trim(),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['arqueoCajaListado'] })
          refetchArqueoActivo()
          const real = parseFloat(montoReal)
          resetForm()
          onNext(isNaN(real) ? 0 : real)
        },
        onError: (err: any) => {
          setError(err.message || 'Error al arquear caja')
        },
      },
    )
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: (theme) => theme.shadows[8],
          },
        }}
      >
        <DialogContent sx={{ p: 4, position: 'relative' }}>
          <IconButton
            onClick={handleClose}
            disabled={isPending}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
          >
            <Close />
          </IconButton>

          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <AccountBalanceWallet sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              Paso 1: Arqueo de Caja
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Ingresa el efectivo físico que hay en la caja registradora.
            </Typography>
          </Box>

          <Stack spacing={3}>
            {/* Breakdown box */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.divider, 0.04),
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
              }}
            >
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Monto Inicial:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ${formatMoney(caja?.montoInicial || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Ingresos:
                  </Typography>
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    +${formatMoney(caja?.totalIngresos || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Retiros:
                  </Typography>
                  <Typography variant="body2" color="error.main" fontWeight={600}>
                    -${formatMoney(caja?.totalRetiros || 0)}
                  </Typography>
                </Box>
                <Box sx={{ my: 1, borderBottom: '1px dashed', borderColor: 'divider' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    TOTAL SISTEMA ESPERADO:
                  </Typography>
                  <Typography variant="subtitle1" color="primary.main" fontWeight={800}>
                    ${formatMoney(montoSist)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                sx={{ letterSpacing: 0.5 }}
              >
                CONTADO REAL
              </Typography>
              <FormControl fullWidth size="small">
                <OutlinedInput
                  value={montoReal}
                  onChange={(e) => {
                    let val = e.target.value
                    if (val.includes('.')) {
                      const parts = val.split('.')
                      if (parts[1].length > 2) {
                        val = `${parts[0]}.${parts[1].slice(0, 2)}`
                      }
                    }
                    setMontoReal(val)
                  }}
                  onBlur={() => {
                    const val = parseFloat(montoReal)
                    if (!isNaN(val)) {
                      const parts = montoReal.split('.')
                      if (!parts[1]) setMontoReal(`${Math.floor(val)}.00`)
                      else if (parts[1].length === 1) setMontoReal(`${parts[0]}.${parts[1]}0`)
                    }
                  }}
                  type="number"
                  inputProps={{ min: 0, step: '0.1' }}
                  placeholder="0.00"
                  startAdornment={
                    <InputAdornment position="start">
                      <Typography variant="body1" color="text.secondary" fontWeight={700}>
                        BOB
                      </Typography>
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setOpenCalc(true)}
                        title="Calculadora de efectivo"
                        sx={{ color: 'text.secondary' }}
                      >
                        <Calculate fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    py: 0.5,
                  }}
                />
              </FormControl>
            </Box>

            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                sx={{ letterSpacing: 0.5 }}
              >
                OBSERVACIÓN DE ARQUEO (OPCIONAL)
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Justificación si hay sobrante/faltante u otra novedad..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                InputProps={{
                  sx: { borderRadius: 2, bgcolor: 'background.paper' },
                }}
              />
            </Box>

            {error && (
              <Typography variant="body2" color="error.main" fontWeight={600}>
                {error}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                color="inherit"
                disabled={isPending}
                onClick={handleClose}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: 'background.paper',
                  color: 'text.secondary',
                  borderColor: alpha(theme.palette.divider, 1),
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={isPending}
                onClick={handleSubmit}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: 'none',
                  },
                }}
              >
                {isPending ? 'Procesando...' : 'Siguiente'}
              </Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      <CalculadoraEfectivoDialog
        open={openCalc}
        onClose={() => setOpenCalc(false)}
        onConfirm={(total) => {
          setMontoReal(total.toFixed(2))
          setOpenCalc(false)
        }}
      />
    </>
  )
}

export default ArqueoCajaPaso1Dialog
