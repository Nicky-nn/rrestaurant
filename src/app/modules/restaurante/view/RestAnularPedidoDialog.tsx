import { LoadingButton } from '@mui/lab'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'

import { useError } from '../../../base/contexts/ErrorProvider'
import useAuth from '../../../base/hooks/useAuth'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { getEntidadInput } from '../../../utils/getEntidadInput'
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
  const { showError } = useError()
  const entidad = useMemo(() => getEntidadInput(user), [user])
  const [motivo, setMotivo] = useState('')
  const { mutateAsync: anularPedido, isPending } = useRestPedidoAnular()

  useEffect(() => {
    if (open) setMotivo('')
  }, [open])

  const handleConfirm = async () => {
    if (!pedido?._id || !motivo.trim()) return
    try {
      await anularPedido({ id: pedido._id, entidad, descripcionMotivo: motivo.trim() })
      onClose(true)
    } catch (err: any) {
      showError(new MyGraphQlError(err))
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="xs">
      <DialogTitle>Anular Pedido</DialogTitle>
      <DialogContent>
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
