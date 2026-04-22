import { LoadingButton } from '@mui/lab'
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'

import useAuth from '../../../base/hooks/useAuth'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { getEntidadInput } from '../../../utils/getEntidadInput'
import { swalClose, swalException, swalLoading } from '../../../utils/swal'
import { client } from '../client'
import { useRestFacturaAnular } from '../mutations/useRestFacturaAnular'
import { useRestPedidoAnular } from '../mutations/useRestPedidoAnular'
import { RESTPEDIDOLISTADO } from '../queries/useRestPedidoListado'
import { useSinMotivoAnulacion } from '../queries/useSinMotivoAnulacion'
import { RestPedidoConnection, SalidaFactura, SinMotivoAnulacion } from '../types'

interface RestAnularFacturaDialogProps {
  open: boolean
  factura: SalidaFactura | null
  onClose: (anulado?: boolean) => void
}

const RestAnularFacturaDialog: FunctionComponent<RestAnularFacturaDialogProps> = ({
  open,
  factura,
  onClose,
}) => {
  const { user } = useAuth()
  const entidad = useMemo(() => getEntidadInput(user), [user])

  const [motivo, setMotivo] = useState<SinMotivoAnulacion | null>(null)
  const [step, setStep] = useState<'factura' | 'pedido'>('factura')
  const [pedidoId, setPedidoId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const { data: motivos = [], isLoading: motivosLoading } = useSinMotivoAnulacion({}, { enabled: open })

  const { mutateAsync: anularFactura, isPending: isPendingFactura } = useRestFacturaAnular()
  const { mutateAsync: anularPedido, isPending: isPendingPedido } = useRestPedidoAnular()

  useEffect(() => {
    if (open) {
      setMotivo(null)
      setStep('factura')
      setPedidoId(null)
    }
  }, [open])

  const handleAnularFactura = async () => {
    if (!factura?.cuf || !motivo) return

    swalLoading('Anulando factura...')

    try {
      await anularFactura({
        cuf: factura.cuf,
        codigoMotivo: Number(motivo.codigoClasificador),
        entidad,
        notificacion: false,
      })

      // Buscar pedido asociado
      if (factura.tipoVenta === 'REST' && factura.referencia) {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(factura.referencia)
        let resolvedId = isObjectId ? factura.referencia : null

        if (!resolvedId) {
          try {
            const res = await client.request<{ restPedidoListado: RestPedidoConnection }>(RESTPEDIDOLISTADO, {
              entidad,
              limit: 1,
              query: `numeroPedido=${factura.referencia}`,
            })
            resolvedId = res.restPedidoListado?.docs?.[0]?._id ?? null
          } catch {
            // ignorar error
          }
        }

        if (resolvedId) {
          swalClose()
          setPedidoId(resolvedId)
          setStep('pedido')
          return
        }
      }

      swalClose()
      setSuccessMsg('Factura anulada correctamente')
      onClose(true)
    } catch (err: any) {
      swalClose()
      swalException(new MyGraphQlError(err))
    }
  }

  const handleAnularPedido = async () => {
    if (!pedidoId) return

    swalLoading('Anulando pedido asociado...')

    try {
      await anularPedido({
        id: pedidoId,
        entidad,
        descripcionMotivo: motivo?.descripcion || 'Anulación de factura',
      })

      swalClose()
      setSuccessMsg('Pedido anulado correctamente')
      onClose(true)
    } catch (err: any) {
      swalClose()
      swalException(new MyGraphQlError(err))
    }
  }

  return (
    <>
      <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="xs">
        {step === 'factura' ? (
          <>
            <DialogTitle>Anular Factura Nro. {factura?.numeroFactura}</DialogTitle>
            <DialogContent>
              {factura && (
                <Box
                  sx={(theme) => ({
                    mb: 2,
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.background.default
                        : theme.palette.grey[50],
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
                    <Typography variant="subtitle2">Factura #{factura.numeroFactura}</Typography>

                    <Chip
                      label={factura.state || 'VALIDADA'}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Box>

                  <Divider sx={{ my: 0.75 }} />

                  {factura.fechaEmision && (
                    <Typography variant="body2" color="text.secondary">
                      Fecha emisión: <strong>{factura.fechaEmision}</strong>
                    </Typography>
                  )}

                  {factura.cliente?.razonSocial && (
                    <Typography variant="body2" color="text.secondary">
                      Cliente: <strong>{factura.cliente.razonSocial}</strong>
                    </Typography>
                  )}

                  {factura.montoTotal != null && (
                    <Typography variant="body2" color="text.secondary">
                      Monto total: <strong>Bs {factura.montoTotal.toFixed(2)}</strong>
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.disabled" sx={{ wordBreak: 'break-all' }}>
                    CUF: {factura.cuf}
                  </Typography>
                </Box>
              )}

              <Autocomplete
                options={motivos}
                loading={motivosLoading}
                value={motivo}
                onChange={(_, val) => setMotivo(val)}
                getOptionLabel={(o) => `${o.codigoClasificador} - ${o.descripcion}`}
                isOptionEqualToValue={(a, b) => a.codigoClasificador === b.codigoClasificador}
                renderInput={(params) => <TextField {...params} label="Motivo de anulación" autoFocus />}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => onClose()} disabled={isPendingFactura}>
                Cancelar
              </Button>
              <LoadingButton
                color="error"
                variant="contained"
                loading={isPendingFactura}
                disabled={!motivo}
                onClick={handleAnularFactura}
              >
                Anular Factura
              </LoadingButton>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>Factura anulada</DialogTitle>
            <DialogContent>
              <Typography variant="body2">
                La factura fue anulada correctamente. ¿Desea también anular el pedido asociado?
              </Typography>
              {/* Datos en resumen del pedido */}
              {pedidoId && (
                <Box
                  sx={(theme) => ({
                    mt: 2,
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.background.default
                        : theme.palette.grey[50],
                  })}
                >
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}
                  >
                    <Typography variant="subtitle2">Pedido #{factura?.referencia}</Typography>
                    <Chip label="FINALIZADO" size="small" color="warning" variant="outlined" />
                  </Box>
                  <Divider sx={{ my: 0.75 }} />
                  {factura?.cliente?.razonSocial && (
                    <Typography variant="body2" color="text.secondary">
                      Cliente: <strong>{factura.cliente.razonSocial}</strong>
                    </Typography>
                  )}
                  {factura?.montoTotal != null && (
                    <Typography variant="body2" color="text.secondary">
                      Monto total: <strong>Bs {factura.montoTotal.toFixed(2)}</strong>
                    </Typography>
                  )}
                  {factura?.fechaEmision && (
                    <Typography variant="body2" color="text.secondary">
                      Fecha: <strong>{factura.fechaEmision}</strong>
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => onClose(true)} disabled={isPendingPedido}>
                No, solo la factura
              </Button>
              <LoadingButton
                color="error"
                variant="contained"
                loading={isPendingPedido}
                onClick={handleAnularPedido}
              >
                Sí, anular pedido
              </LoadingButton>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // 👈 arriba centrado
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessMsg(null)} sx={{ width: '100%' }}>
          <AlertTitle>Éxito</AlertTitle>
          {successMsg}
        </Alert>
      </Snackbar>
    </>
  )
}

export default RestAnularFacturaDialog
