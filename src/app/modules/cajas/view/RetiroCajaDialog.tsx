import { Calculate, CallMade, Close } from '@mui/icons-material'
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
import PdfViewerDialog from '../../reporte/components/PdfViewerDialog'
import { useAperturaCajaRetirar } from '../mutations/useAperturaCajaRetirar'
import CalculadoraEfectivoDialog from './CalculadoraEfectivoDialog'

interface RetiroCajaDialogProps {
  open: boolean
  onClose: () => void
  cajaId: string
  supervisores?: string[]
}

const RetiroCajaDialog: FC<RetiroCajaDialogProps> = ({ open, onClose, cajaId, supervisores = [] }) => {
  const { user } = useAuth()
  const { refetchArqueoActivo } = useCajas()
  const theme = useTheme()
  const queryClient = useQueryClient()

  const { mutate: registrarRetiro, isPending } = useAperturaCajaRetirar()

  const [monto, setMonto] = useState<string>('')
  const [comprobanteTipo, setComprobanteTipo] = useState<string>('Recibo')
  const [comprobanteNumero, setComprobanteNumero] = useState('')
  const [beneficiario, setBeneficiario] = useState('')
  const [motivo, setMotivo] = useState('')
  const [aprobador, setAprobador] = useState(supervisores[0] || user.usuario)
  const [error, setError] = useState<string | null>(null)
  const [openCalc, setOpenCalc] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const resetForm = () => {
    setMonto('')
    setComprobanteTipo('Recibo')
    setComprobanteNumero('')
    setBeneficiario('')
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
    const numericMonto = parseFloat(monto)

    if (isNaN(numericMonto) || numericMonto <= 0) {
      setError('Por favor, ingresa un monto válido mayor a 0.')
      return
    }
    if (!beneficiario.trim()) {
      setError('Por favor, ingresa el beneficiario.')
      return
    }
    if (!motivo.trim()) {
      setError('Por favor, ingresa un motivo.')
      return
    }

    registrarRetiro(
      {
        id: cajaId,
        input: {
          monto: numericMonto,
          comprobanteTipo: comprobanteTipo.toUpperCase(),
          comprobanteNumero: comprobanteNumero.trim(),
          beneficiario: beneficiario.trim(),
          motivo: motivo.trim(),
          aprobador,
        },
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['arqueoCajaListado'] })
          refetchArqueoActivo()

          // Extraer URL del PDF del último retiro (el recién creado)
          const retiros = data?.retiros || []
          if (retiros.length > 0) {
            const ultimoRetiro = retiros[retiros.length - 1]
            if (ultimoRetiro?.representacionGrafica?.rollo) {
              setPdfUrl(ultimoRetiro.representacionGrafica.rollo)
            }
          }

          resetForm()
          onClose()
        },
        onError: (err: any) => {
          setError(err.message || 'Error al registrar el retiro')
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

  const comprobanteOptions: AppSelectOption[] = [
    { value: 'Recibo', label: 'Recibo' },
    { value: 'Factura', label: 'Factura' },
    { value: 'Nota', label: 'Nota' },
  ]

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
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.15),
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <CallMade sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              Registrar Retiro
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
                MONTO DEL RETIRO
              </Typography>
              <FormControl fullWidth size="small">
                <OutlinedInput
                  value={monto}
                  onChange={(e) => {
                    let val = e.target.value
                    if (val.includes('.')) {
                      const parts = val.split('.')
                      if (parts[1].length > 2) {
                        val = `${parts[0]}.${parts[1].slice(0, 2)}`
                      }
                    }
                    setMonto(val)
                  }}
                  onBlur={() => {
                    const val = parseFloat(monto)
                    if (!isNaN(val)) {
                      const parts = monto.split('.')
                      if (!parts[1]) setMonto(`${Math.floor(val)}.00`)
                      else if (parts[1].length === 1) setMonto(`${parts[0]}.${parts[1]}0`)
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

            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ letterSpacing: 0.5 }}
                >
                  COMPROBANTE
                </Typography>
                <FormControl fullWidth size="small">
                  <AppSelect
                    options={comprobanteOptions}
                    value={comprobanteTipo}
                    onChange={(e) => setComprobanteTipo(e.target.value as string)}
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

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ letterSpacing: 0.5 }}
                >
                  Nº COMPROBANTE
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="001-XXXX"
                  value={comprobanteNumero}
                  onChange={(e) => setComprobanteNumero(e.target.value)}
                  InputProps={{
                    sx: { borderRadius: 2, bgcolor: 'background.paper' },
                  }}
                />
              </Box>
            </Stack>

            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                sx={{ letterSpacing: 0.5 }}
              >
                BENEFICIARIO
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Nombre del proveedor o persona..."
                value={beneficiario}
                onChange={(e) => setBeneficiario(e.target.value)}
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
                MOTIVO
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Pago a proveedores..."
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
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'error.dark',
                    boxShadow: 'none',
                  },
                }}
              >
                {isPending ? 'Registrando...' : 'Registrar Retiro'}
              </Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      <CalculadoraEfectivoDialog
        open={openCalc}
        onClose={() => setOpenCalc(false)}
        onConfirm={(total) => {
          setMonto(total.toFixed(2))
          setOpenCalc(false)
        }}
      />

      <PdfViewerDialog open={!!pdfUrl} pdfUrl={pdfUrl} onClose={() => setPdfUrl(null)} />
    </>
  )
}

export default RetiroCajaDialog
