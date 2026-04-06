import { LoadingButton } from '@mui/lab'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
} from '@mui/material'
import React, { FunctionComponent, useState } from 'react'
import { StylesConfig } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { notError, notSuccess } from '../../../utils/notification'
import { swalException } from '../../../utils/swal'
import { apiFcvReenvioEmails } from '../api/apiReenviarFactura'
import { SalidaFactura } from '../types'

interface RestReenviarFacturaDialogProps {
  id?: string
  open: boolean
  factura: SalidaFactura | null
  onClose: (value?: boolean) => void
}

interface Option {
  label: string
  value: string
}

const RestReenviarFacturaDialog: FunctionComponent<RestReenviarFacturaDialogProps> = (props) => {
  const { factura, id, open, onClose, ...other } = props
  const [emails, setEmails] = useState<readonly Option[]>([])
  const [loading, setLoading] = useState(false)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const customStyles: StylesConfig<Option, true> = {
    control: (base) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
      color: theme.palette.text.primary,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: theme.palette.background.paper,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? theme.palette.action.hover : 'transparent',
      color: theme.palette.text.primary,
      cursor: 'pointer',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: theme.palette.action.selected,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: theme.palette.text.primary,
    }),
    input: (base) => ({
      ...base,
      color: theme.palette.text.primary,
    }),
    placeholder: (base) => ({
      ...base,
      color: theme.palette.text.secondary,
    }),
  }

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const onSubmit = async (f: SalidaFactura) => {
    if (emails.length === 0) {
      notError('Ingrese al menos un correo')
      setLoading(false)
      return
    }

    const invalidEmails = emails.filter((e) => !isValidEmail(e.value))
    if (invalidEmails.length > 0) {
      notError('Por favor, asegúrese de ingresar correos electrónicos válidos')
      setLoading(false)
      return
    }

    setLoading(true)

    if (!f.cuf) {
      notError('La factura no tiene código de control CUF')
      setLoading(false)
      return
    }

    const resp = await apiFcvReenvioEmails({
      cuf: f.cuf,
      emails: emails.map((item) => item.value),
    }).catch((err) => {
      swalException(err)
      setLoading(false)
      return false
    })

    if (resp) {
      setLoading(false)
      notSuccess('Notificación enviada correctamente')
      onClose()
    }
  }

  if (!factura) return null

  return (
    <>
      <Dialog
        id={id}
        sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '80vh' } }}
        maxWidth="sm"
        open={open}
        onClose={() => onClose()}
        {...other}
      >
        <DialogTitle>Reenviar Notificación Factura {factura.numeroFactura}</DialogTitle>
        <DialogContent dividers>
          <Box>
            <Typography variant={'body1'}>Nro. Factura: {factura.numeroFactura}</Typography>
            <Typography variant={'body1'}>Fecha Emisión: {factura.fechaEmision}</Typography>
            <Typography variant={'body1'}>Cliente: {factura.cliente?.razonSocial}</Typography>
            <Typography variant={'body1'}>Código de control: {factura.cuf || 'S/N'}</Typography>
            <Typography variant={'body1'}>Estado: {factura.state}</Typography>
          </Box>
          <Alert color={'info'} icon={false} sx={{ mt: 2 }}>
            Ingrese el / los correos a los que desea que se reenvíe la factura, presione enter pare
            registrar nuevo correo
          </Alert>
          <Box sx={{ mt: 2 }}>
            <CreatableSelect
              menuPosition={'fixed'}
              isMulti
              styles={customStyles}
              value={emails}
              onChange={(value) => setEmails(value)}
              placeholder={'Ingrese los correos...'}
              formatCreateLabel={(value) => `Adicionar  ${value}`}
              isValidNewOption={(inputValue) => isValidEmail(inputValue)}
              noOptionsMessage={() => 'Escriba un correo válido...'}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button color={'error'} disabled={loading} onClick={() => onClose()}>
            Cerrar
          </Button>
          <LoadingButton
            loading={loading}
            color={'primary'}
            size={'small'}
            variant={'contained'}
            onClick={() => onSubmit(factura)}
          >
            Enviar Notificación
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RestReenviarFacturaDialog
