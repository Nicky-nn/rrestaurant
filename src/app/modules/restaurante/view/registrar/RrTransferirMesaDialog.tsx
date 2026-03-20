import { Close, South, SyncAltOutlined } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { FunctionComponent, useMemo, useState } from 'react'

import { MesaUI } from '../../interfaces/mesa.interface'
import { useRestEspacioPorSucursal } from '../../queries/useRestEspacioPorSucursal'
import { useRestPedidoMesasOcupadas } from '../../queries/useRestPedidoMesasOcupadas'

export interface RrTransferirMesaDialogProps {
  open: boolean
  onClose: () => void
  mesaSeleccionada: MesaUI
  onTransferir: (nuevaMesaNombre: string, nuevoUbicacionId: string | null) => Promise<any>
  user: any
  isPending?: boolean
}

const RrTransferirMesaDialog: FunctionComponent<RrTransferirMesaDialogProps> = ({
  open,
  onClose,
  mesaSeleccionada,
  onTransferir,
  user,
  isPending = false,
}) => {
  const cdSuc = user.sucursal.codigo
  const ubiActual = mesaSeleccionada?.pedido?.mesa?.ubicacion || 'salon_principal'

  const [espacioId, setEspacioId] = useState(ubiActual)
  const [mesaDestino, setMesaDestino] = useState('')

  const { data: espRaw = [] } = useRestEspacioPorSucursal({ codigoSucursal: cdSuc })
  const espacios = useMemo(() => espRaw.filter((e) => !e.default), [espRaw])
  const origenStr = espacios.find((e) => e._id === ubiActual)?.descripcion || 'Salón Principal'

  const { data: ocupadas = [] } = useRestPedidoMesasOcupadas(
    { codigoSucursal: cdSuc, espacioId: espacioId === 'salon_principal' ? undefined : espacioId },
    { enabled: open },
  )

  const mesasLibres = useMemo(() => {
    const realEspacio = espacioId === 'salon_principal' ? null : espacioId
    const nroMesas = espacios.find((e) => e._id === realEspacio)?.nroMesas || 50
    const ocup = new Set(ocupadas.filter((m) => m.mesa?.ubicacion === realEspacio).map((m) => m.mesa?.nombre))
    return Array.from({ length: Number(nroMesas) }, (_, i) => String(i + 1)).filter(
      (m) =>
        !ocup.has(m) &&
        !(
          m === mesaSeleccionada.value && realEspacio === (mesaSeleccionada?.pedido?.mesa?.ubicacion || null)
        ),
    )
  }, [espacioId, espacios, ocupadas, mesaSeleccionada])

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SyncAltOutlined /> Transferir Pedido
        </Box>
        <IconButton onClick={onClose} disabled={isPending} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}
        >
          <Typography variant="overline" color="text.secondary">
            Origen
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {origenStr} - {mesaSeleccionada.label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', my: -3, zIndex: 1 }}>
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 0.5,
              borderRadius: '50%',
              border: '1px dashed',
              borderColor: 'divider',
              display: 'flex',
            }}
          >
            <South color="action" fontSize="small" />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'info.main',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="overline" color="info.main" textAlign="center">
            Destino
          </Typography>

          <TextField
            select
            size="small"
            label="Salón Destino"
            value={espacioId}
            onChange={(e) => {
              setEspacioId(e.target.value)
              setMesaDestino('')
            }}
            disabled={isPending}
          >
            <MenuItem value="salon_principal">Salón Principal</MenuItem>
            {espacios.map((e) => (
              <MenuItem key={e._id} value={e._id || ''}>
                {e.descripcion || 'Sin Nombre'}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Mesa Destino"
            value={mesaDestino ?? ''}
            onChange={(e) => setMesaDestino(e.target.value)}
            disabled={isPending || !mesasLibres.length}
          >
            <MenuItem value="" disabled>
              {mesasLibres.length ? 'Seleccione mesa' : 'Sin mesas libres'}
            </MenuItem>
            {mesasLibres.map((m) => (
              <MenuItem key={m} value={m}>
                Mesa {m}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} disabled={isPending} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onTransferir(mesaDestino, espacioId === 'salon_principal' ? null : espacioId)}
          disabled={!mesaDestino || isPending}
          disableElevation
        >
          {isPending ? 'Procesando...' : 'Transferir'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RrTransferirMesaDialog
