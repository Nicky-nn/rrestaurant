import { Add, AttachMoney, Remove } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { FC, useMemo, useState } from 'react'

interface CalculadoraEfectivoDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (total: number) => void
}

const DENOMINACIONES = [
  { label: '200 BOB', valor: 200 },
  { label: '100 BOB', valor: 100 },
  { label: '50 BOB', valor: 50 },
  { label: '20 BOB', valor: 20 },
  { label: '10 BOB', valor: 10 },
  { label: '5 BOB', valor: 5 },
  { label: '2 BOB', valor: 2 },
  { label: '1 BOB', valor: 1 },
  { label: '50 cts', valor: 0.5 },
  { label: '20 cts', valor: 0.2 },
  { label: '10 cts', valor: 0.1 },
]

const CalculadoraEfectivoDialog: FC<CalculadoraEfectivoDialogProps> = ({ open, onClose, onConfirm }) => {
  const [cantidades, setCantidades] = useState<Record<number, number>>({})

  const handleIncrement = (valor: number) => {
    setCantidades((prev) => ({
      ...prev,
      [valor]: (prev[valor] || 0) + 1,
    }))
  }

  const handleDecrement = (valor: number) => {
    setCantidades((prev) => ({
      ...prev,
      [valor]: Math.max(0, (prev[valor] || 0) - 1),
    }))
  }

  const total = useMemo(() => {
    let sum = 0
    DENOMINACIONES.forEach((denom) => {
      sum += denom.valor * (cantidades[denom.valor] || 0)
    })
    return sum
  }, [cantidades])

  const handleConfirm = () => {
    onConfirm(total)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AttachMoney fontSize="small" />
        </Box>
        <Typography component="span" variant="h6" fontWeight={600} color="text.primary">
          Calculadora de Efectivo
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Grid container columnSpacing={4} rowSpacing={3}>
          {DENOMINACIONES.map((denom) => (
            <Grid
              key={denom.valor}
              size={{ xs: 12, sm: 6 }}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography color="text.secondary" fontWeight={500} fontSize="0.95rem">
                {denom.label}
              </Typography>

              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.5,
                  minWidth: 110,
                  justifyContent: 'space-between',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleDecrement(denom.valor)}
                  sx={{
                    bgcolor: 'action.hover',
                    p: 0.5,
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <Remove sx={{ fontSize: 16, color: 'text.secondary' }} />
                </IconButton>

                <Typography
                  sx={{
                    width: 30,
                    textAlign: 'center',
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  {cantidades[denom.valor] || 0}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => handleIncrement(denom.valor)}
                  sx={{
                    bgcolor: 'text.secondary',
                    p: 0.5,
                    '&:hover': { bgcolor: 'text.primary' },
                  }}
                >
                  <Add sx={{ fontSize: 16, color: 'background.paper' }} />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2, px: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1, color: 'text.primary' }}>
          Total: {total.toFixed(2)} BOB
        </Typography>

        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>

        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={total === 0}
          disableElevation
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CalculadoraEfectivoDialog
