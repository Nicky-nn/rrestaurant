import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from '@mui/material'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'

import useAuth from '../../../base/hooks/useAuth'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { getEntidadInput } from '../../../utils/getEntidadInput'
import { swalClose, swalException, swalLoading } from '../../../utils/swal'
import { useRestPedidoAnular } from '../mutations/useRestPedidoAnular'
import { RestPedido } from '../types'

interface RestAnularPedidoDialogProps {
  open: boolean
  pedido: RestPedido | null
  onClose: (anulado?: boolean) => void
}

const RestAnularPedidoDialog: FunctionComponent<RestAnularPedidoDialogProps> = ({
  open,
  pedido,
  onClose,
}) => {
  const { user } = useAuth()
  const entidad = useMemo(() => getEntidadInput(user), [user])
  const [motivo, setMotivo] = useState('')
  const { mutateAsync: anularPedido, isPending } = useRestPedidoAnular()

  useEffect(() => {
    if (open) setMotivo('')
  }, [open])

  const handleConfirm = async () => {
    if (!pedido?._id || !motivo.trim()) return
    swalLoading('Anulando pedido...')
    try {
      await anularPedido({ id: pedido._id, entidad, descripcionMotivo: motivo.trim() })
      swalClose()
      onClose(true)
    } catch (err: any) {
      swalClose()
      swalException(new MyGraphQlError(err))
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="xs">
      <DialogTitle>Anular Pedido</DialogTitle>
      <DialogContent>
        {pedido && (
          <Box
            sx={(theme) => ({
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor:
                theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[50],
            })}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle2">Pedido #{pedido.numeroPedido}</Typography>

              <Chip
                label={pedido.state}
                size="small"
                color="warning"
                variant="outlined" // mejor en oscuro
              />
            </Box>

            <Divider sx={{ my: 0.75 }} />

            {pedido.mesa?.nombre && (
              <Typography variant="body2" color="text.secondary">
                Mesa: <strong>{pedido.mesa.nombre}</strong>
              </Typography>
            )}

            {pedido.fechaDocumento && (
              <Typography variant="body2" color="text.secondary">
                Fecha: <strong>{pedido.fechaDocumento}</strong>
              </Typography>
            )}

            {pedido.montoTotal != null && (
              <Typography variant="body2" color="text.secondary">
                Monto total: <strong>Bs {pedido.montoTotal.toFixed(2)}</strong>
              </Typography>
            )}
          </Box>
        )}

        <TextField
          autoFocus
          fullWidth
          multiline
          rows={3}
          label="Motivo de anulación"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} disabled={isPending}>
          Cancelar
        </Button>
        <LoadingButton
          color="error"
          variant="contained"
          loading={isPending}
          disabled={!motivo.trim()}
          onClick={handleConfirm}
        >
          Anular
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default RestAnularPedidoDialog
