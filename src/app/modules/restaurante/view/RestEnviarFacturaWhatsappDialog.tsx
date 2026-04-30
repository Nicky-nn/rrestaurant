import { LoadingButton } from '@mui/lab'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import React, { FunctionComponent, useEffect, useState } from 'react'

import { notError, notSuccess } from '../../../utils/notification'
import { swalException } from '../../../utils/swal'
import { SalidaFactura } from '../types'
import { useEnviarFacturaWhatsapp } from './registrar/useEnviarFacturaWhatsapp'

interface RestEnviarFacturaWhatsappDialogProps {
  id?: string
  open: boolean
  factura: SalidaFactura | null
  onClose: (value?: boolean) => void
}

const RestEnviarFacturaWhatsappDialog: FunctionComponent<RestEnviarFacturaWhatsappDialogProps> = (props) => {
  const { factura, id, open, onClose, ...other } = props
  const [telefono, setTelefono] = useState('')
  const { sendFactura, isPending } = useEnviarFacturaWhatsapp()

  useEffect(() => {
    if (open && factura) {
      setTelefono(factura.cliente?.telefono || '')
    }
  }, [open, factura])

  const onSubmit = async () => {
    if (!telefono) {
      notError('Debe ingresar un número de teléfono')
      return
    }

    const pdfUrl = factura?.representacionGrafica?.pdf || ''
    
    if (!pdfUrl) {
      notError('La factura no tiene un enlace de descarga disponible')
      return
    }

    try {
      await sendFactura({
        telefono,
        urlPdf: pdfUrl,
        nombreFactura: `Factura ${factura?.cliente?.razonSocial || ''}`.trim()
      })
      notSuccess('Mensaje de WhatsApp enviado correctamente')
      onClose(true)
    } catch (err) {
      swalException(err)
    }
  }

  if (!factura) return null

  return (
    <Dialog
      id={id}
      sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '80vh' } }}
      maxWidth="sm"
      open={open}
      onClose={() => onClose()}
      {...other}
    >
      <DialogTitle>Enviar Factura {factura.numeroFactura} por WhatsApp</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Typography variant="body1">Nro. Factura: {factura.numeroFactura}</Typography>
          <Typography variant="body1">Fecha Emisión: {factura.fechaEmision}</Typography>
          <Typography variant="body1">Cliente: {factura.cliente?.razonSocial}</Typography>
        </Box>
        <Alert color="info" icon={false} sx={{ mt: 2 }}>
          Ingrese el número de teléfono al que desea enviar la factura por WhatsApp.
          Por defecto el código de país será 591, puede usar el formato "+56 91234567" si desea otro.
        </Alert>
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
            NÚMERO DE TELÉFONO
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="+591 71234567"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button color="error" disabled={isPending} onClick={() => onClose()}>
          Cerrar
        </Button>
        <LoadingButton
          loading={isPending}
          color="success"
          size="small"
          variant="contained"
          onClick={onSubmit}
        >
          Enviar WhatsApp
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default RestEnviarFacturaWhatsappDialog
