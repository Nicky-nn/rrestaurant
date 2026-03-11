import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined'
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined'
import { alpha, Box, Button, Divider, Stack, Typography, useTheme } from '@mui/material'
import { FunctionComponent, useMemo, useState } from 'react'

import MontoMonedaTexto from '../../../../base/components/PopoverMonto/MontoMonedaTexto'
import { MesaUI } from '../../interfaces/mesa.interface'

interface RrAccionesProps {
  mesaSeleccionada?: MesaUI | null
}

/**
 * RrAcciones
 * Panel de acciones del pedido.
 * Contiene botones para confirmar, cancelar, imprimir u otras operaciones finales del pedido.
 */
const RrAcciones: FunctionComponent<RrAccionesProps> = ({ mesaSeleccionada }) => {
  const theme = useTheme()
  const [descuento, setDescuento] = useState<number>(0)
  const [giftcard, setGiftcard] = useState<number>(0)

  const subtotal = useMemo(() => {
    let sub = 0
    if (mesaSeleccionada?.pedido?.productos) {
      mesaSeleccionada.pedido.productos.forEach((p) => {
        const isCortesia = p.cortesia || false
        if (isCortesia) return

        const precio = p.articuloPrecio?.valor ?? p.articuloPrecio?.monedaPrecio?.precio ?? 0
        const cantidad = p.articuloPrecio?.cantidad ?? p.articuloPrecioBase?.cantidad ?? 1
        sub += Number(precio) * Number(cantidad)

        if (p.complementos) {
          p.complementos.forEach((c) => {
            const cPrecio = c.articuloPrecio?.valor ?? c.articuloPrecio?.monedaPrecio?.precio ?? 0
            const cQty = c.articuloPrecio?.cantidad ?? c.articuloPrecioBase?.cantidad ?? 1
            sub += Number(cPrecio) * Number(cQty)
          })
        }
      })
    }
    return sub
  }, [mesaSeleccionada])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Resumen Totales */}
      <Box sx={{ px: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Subtotal
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {subtotal.toFixed(2)} BOB
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Descuento
          </Typography>
          <MontoMonedaTexto
            monto={descuento}
            editar={true}
            onChange={(val) => setDescuento(val || 0)}
            sigla="BOB"
            montoProps={{ sx: { color: 'error.main', fontWeight: 600, fontSize: '0.875rem' } }}
            siglaProps={{ sx: { color: 'error.main', fontSize: '0.75rem' } }}
            buttonProps={{ sx: { color: 'error.main', py: 0, minHeight: 0 } }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            GiftCard
          </Typography>
          <MontoMonedaTexto
            monto={giftcard}
            editar={true}
            onChange={(val) => setGiftcard(val || 0)}
            sigla="BOB"
            montoProps={{ sx: { color: 'error.main', fontWeight: 600, fontSize: '0.875rem' } }}
            siglaProps={{ sx: { color: 'error.main', fontSize: '0.75rem' } }}
            buttonProps={{ sx: { color: 'error.main', py: 0, minHeight: 0 } }}
          />
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            Total
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            {Math.max(0, subtotal - descuento - giftcard).toFixed(2)} BOB
          </Typography>
        </Box>
      </Box>

      {/* Acciones */}
      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              borderColor: 'divider',
              color: 'text.secondary',
              bgcolor: 'background.paper',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'divider',
              },
            }}
          >
            <ReceiptLongOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            Cuenta
          </Button>
          <Button
            variant="outlined"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              borderColor: 'divider',
              color: 'text.secondary',
              bgcolor: 'background.paper',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'divider',
              },
            }}
          >
            <CallSplitOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            Dividir
          </Button>
          <Button
            variant="outlined"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              borderColor: 'divider',
              color: 'text.secondary',
              bgcolor: 'background.paper',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'divider',
              },
            }}
          >
            <SyncAltOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            Transferir
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            variant="contained"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              bgcolor: alpha(theme.palette.error.main, 0.08),
              color: 'error.main',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.12),
                boxShadow: 'none',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            <DeleteOutlineOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              bgcolor: '#f0f4ff', // Light bluish purple
              color: '#4f46e5', // Indigo color
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'transparent',
              '&:hover': {
                bgcolor: '#e0e7ff',
                boxShadow: 'none',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            <RoomServiceOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            {!mesaSeleccionada?.pedido || mesaSeleccionada.pedido._id?.startsWith('nuevo-') ? 'Registrar' : 'Actualizar'}
          </Button>
          <Button
            variant="contained"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              bgcolor: '#2e7d32', // Solid Green
              color: '#ffffff',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 4px 14px 0 rgba(46, 125, 50, 0.39)', // Nice green shadow
              border: '1px solid',
              borderColor: 'transparent',
              '&:hover': {
                bgcolor: '#1b5e20',
                boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            <PaymentsOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            Cobrar
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

export default RrAcciones
