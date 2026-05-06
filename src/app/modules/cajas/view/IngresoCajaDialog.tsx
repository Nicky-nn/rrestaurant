import { Calculate, CallReceived, Close } from '@mui/icons-material'
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
import { FC, useState } from 'react'

import AppSelect, { AppSelectOption } from '../../../base/components/MySelect/AppSelect'
import useAuth from '../../../base/hooks/useAuth'
import useCajas from '../../../base/hooks/useCajas'
import { useAperturaCajaIngresar } from '../mutations/useAperturaCajaIngresar'
import CalculadoraEfectivoDialog from './CalculadoraEfectivoDialog'
import NumberSpinnerField from '../../../base/components/NumberSpinnerField/NumberSpinnerField'

interface IngresoCajaDialogProps {
  open: boolean
  onClose: () => void
  cajaId: string
  supervisores?: string[]
}

const IngresoCajaDialog: FC<IngresoCajaDialogProps> = ({ open, onClose, cajaId, supervisores = [] }) => {
  const { user } = useAuth()
  const { refetchArqueoActivo } = useCajas()
  const theme = useTheme()
  const queryClient = useQueryClient()

  const { mutate: registrarIngreso, isPending } = useAperturaCajaIngresar()

  const [monto, setMonto] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')
  const [aprobador, setAprobador] = useState(supervisores[0] || user.usuario)
  const [error, setError] = useState<string | null>(null)
  const [openCalc, setOpenCalc] = useState(false)

  const resetForm = () => {
    setMonto(null)
    setMotivo('')
    setAprobador(supervisores[0] || user.usuario)
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
    const numericMonto = monto || 0

    if (isNaN(numericMonto) || numericMonto <= 0) {
      setError('Por favor, ingresa un monto válido mayor a 0.')
      return
    }
    if (!motivo.trim()) {
      setError('Por favor, ingresa un motivo.')
      return
    }

    registrarIngreso(
      {
        id: cajaId,
        input: {
          monto: numericMonto,
          motivo: motivo.trim(),
          aprobador,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['arqueoCajaListado'] })
          refetchArqueoActivo()
          resetForm()
          onClose()
        },
        onError: (err: any) => {
          setError(err.message || 'Error al registrar el ingreso')
        },
      },
    )
  }

  const supervisorOptions: AppSelectOption[] = Array.from(new Set([...supervisores, user.usuario])).map(
    (s) => ({
      value: s,
      label: s === user.usuario ? `${s} (Tú)` : s,
    }),
  )

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
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.15),
                color: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <CallReceived sx={{ fontSize: 28, transform: 'rotate(-90deg)' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              Registrar Ingreso
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                sx={{ letterSpacing: 0.5 }}
              >
                MONTO DEL INGRESO
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                <NumberSpinnerField
                  fullWidth
                  value={monto}
                  onChange={(val) => setMonto(val)}
                  min={0}
                  step={10}
                  unit="BOB"
                  placeholder="0.00"
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      py: 0.5,
                    }
                  }}
                />
                <IconButton 
                  onClick={() => setOpenCalc(true)} 
                  title="Calculadora de efectivo"
                  color="primary"
                  sx={{ 
                    bgcolor: (theme) => `${theme.palette.primary.main}1A`, 
                    borderRadius: 2,
                    width: 53,
                    height: 53
                  }}
                >
                  <Calculate />
                </IconButton>
              </Box>
            </Box>

            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                sx={{ letterSpacing: 0.5 }}
              >
                MOTIVO
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Efectivo extra para cambio..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                InputProps={{
                  sx: { borderRadius: 2, bgcolor: 'background.paper' },
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                sx={{ letterSpacing: 0.5 }}
              >
                APROBADO POR
              </Typography>
              <FormControl fullWidth size="small">
                <AppSelect
                  options={supervisorOptions}
                  value={aprobador}
                  onChange={(e) => setAprobador(e.target.value as string)}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    '.MuiNativeSelect-select': {
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      borderRadius: 2,
                      py: '8.5px',
                    },
                    '&::before': { borderColor: alpha(theme.palette.divider, 1) },
                    '&::after': { borderColor: 'primary.main' },
                  }}
                />
              </FormControl>
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
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'success.dark',
                    boxShadow: 'none',
                  },
                }}
              >
                {isPending ? 'Registrando...' : 'Registrar Ingreso'}
              </Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      <CalculadoraEfectivoDialog
        open={openCalc}
        onClose={() => setOpenCalc(false)}
        onConfirm={(total) => {
          setMonto(total)
          setOpenCalc(false)
        }}
      />
    </>
  )
}

export default IngresoCajaDialog
