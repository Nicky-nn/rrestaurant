import { LoadingButton } from '@mui/lab'
import {
  Alert,
  Autocomplete,
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

import { useError } from '../../../base/contexts/ErrorProvider'
import useAuth from '../../../base/hooks/useAuth'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { getEntidadInput } from '../../../utils/getEntidadInput'
import { swalClose, swalLoading } from '../../../utils/swal'
import { client } from '../client'
import { useRestFacturaAnular } from '../mutations/useRestFacturaAnular'
import { useRestPedidoAnular } from '../mutations/useRestPedidoAnular'
import { RESTFACTURALISTADO } from '../queries/useRestFacturaListado'
import { useSinMotivoAnulacion } from '../queries/useSinMotivoAnulacion'
import { RestFacturaConnection, RestPedido, SinMotivoAnulacion } from '../types'

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
  const [motivoFactura, setMotivoFactura] = useState<SinMotivoAnulacion | null>(null)
  const [facturaState, setFacturaState] = useState<string | null>(null)

  const tieneCuf = Boolean(pedido?.refDocumento)
  // Si la factura ya fue anulada previamente, no hay que volver a anularla
  const facturaYaAnulada = tieneCuf && Boolean(facturaState && facturaState.toUpperCase().includes('ANULAD'))
  const needsMotivoFactura = tieneCuf && !facturaYaAnulada

  const { data: motivos = [], isLoading: motivosLoading } = useSinMotivoAnulacion(
    {},
    { enabled: open && needsMotivoFactura },
  )
  const { mutateAsync: anularFactura, isPending: isPendingFactura } = useRestFacturaAnular()
  const { mutateAsync: anularPedido, isPending: isPendingPedido } = useRestPedidoAnular()
  const isPending = isPendingFactura || isPendingPedido

  useEffect(() => {
    if (open) {
      setMotivo('')
      setMotivoFactura(null)
      setFacturaState(null)
    }
  }, [open])

  // Consulta el estado actual de la factura para saber si ya fue anulada
  useEffect(() => {
    if (!open || !tieneCuf || !pedido?.refDocumento) return
    client
      .request<{ restFacturaListado: RestFacturaConnection }>(RESTFACTURALISTADO, {
        entidad,
        limit: 1,
        query: `cuf=${pedido.refDocumento}`,
      })
      .then((res) => {
        setFacturaState(res.restFacturaListado?.docs?.[0]?.state ?? null)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pedido?.refDocumento])

  const handleConfirm = async () => {
    if (!pedido?._id || !motivo.trim()) return
    if (needsMotivoFactura && !motivoFactura) return
    try {
      if (needsMotivoFactura && pedido.refDocumento) {
        swalLoading('Anulando factura asociada...')
        try {
          await anularFactura({
            cuf: pedido.refDocumento,
            codigoMotivo: Number(motivoFactura!.codigoClasificador),
            entidad,
            notificacion: false,
          })
        } catch (facturaErr: any) {
          const msg: string = new MyGraphQlError(facturaErr).message ?? ''
          // Si la factura ya estaba anulada, continuar con el pedido
          if (!msg.toLowerCase().includes('anulad')) {
            swalClose()
            showError(new MyGraphQlError(facturaErr))
            return
          }
        }
      }
      swalLoading('Anulando pedido...')
      await anularPedido({ id: pedido._id, entidad, descripcionMotivo: motivo.trim() })
      swalClose()
      onClose(true)
    } catch (err: any) {
      swalClose()
      showError(new MyGraphQlError(err))
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

        {tieneCuf && facturaYaAnulada && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Factura <strong>#{pedido?.refNroDocumento}</strong> ya fue anulada previamente.
          </Alert>
        )}

        {tieneCuf && !facturaYaAnulada && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Factura <strong>#{pedido?.refNroDocumento}</strong> asociada será anulada primero.
          </Alert>
        )}

        {needsMotivoFactura && (
          <Autocomplete
            options={motivos}
            loading={motivosLoading}
            value={motivoFactura}
            onChange={(_, val) => setMotivoFactura(val)}
            getOptionLabel={(o) => `${o.codigoClasificador} - ${o.descripcion}`}
            isOptionEqualToValue={(a, b) => a.codigoClasificador === b.codigoClasificador}
            renderInput={(params) => <TextField {...params} label="Motivo anulación factura" autoFocus />}
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          autoFocus={!tieneCuf}
          fullWidth
          multiline
          rows={3}
          label="Motivo anulación pedido"
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
          disabled={!motivo.trim() || (needsMotivoFactura && !motivoFactura)}
          onClick={handleConfirm}
        >
          Anular
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default RestAnularPedidoDialog
