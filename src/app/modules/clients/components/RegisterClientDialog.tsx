import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material'
import { useConfirm } from 'material-ui-confirm'
import { FunctionComponent, useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { logg } from '../../../utils/helper'
import { notError, notSuccess } from '../../../utils/notification'
import { swalClose, swalException, swalLoading } from '../../../utils/swal'
import { apiCliente99001Registro } from '../api/apiCliente99001Registro'
import { registerClient } from '../api/registerClient'
import { CLIENT_DEFAULT_INPUT, ClientInputProps } from '../interfaces/client'
import {
  CLIENTE_99001_DEFAULT_INPUT,
  Cliente99001InputProps,
  generarCodigoCliente99001,
} from '../interfaces/client99001'
import { registerClientComposeService } from '../services/registerClientComposeService'
import { cliente99001InputValidator } from '../validator/cliente99001InputValidator'
import { clienteInputValidator } from '../validator/clienteInputValidator'
import Cliente99001FormBody from './Cliente99001FormBody'
import ClientFormBody from './ClientFormBody'

interface RegisterClientProps {
  id: string
  open: boolean
  onClose: (isRegisterSuccess: boolean) => void
}

type Props = RegisterClientProps

/**
 * Dialogo de registro de cliente — soporta cliente normal y cliente 99001 mediante tabs
 */
const RegisterClientDialog: FunctionComponent<Props> = (props) => {
  const { onClose, open, ...other } = props

  const [tabIndex, setTabIndex] = useState(0)

  // Formulario cliente normal
  const form = useForm<ClientInputProps>({
    defaultValues: CLIENT_DEFAULT_INPUT,
    resolver: yupResolver<any, any, any>(clienteInputValidator),
  })

  // Formulario cliente 99001
  const form99001 = useForm<Cliente99001InputProps>({
    defaultValues: CLIENTE_99001_DEFAULT_INPUT(),
    resolver: yupResolver<any, any, any>(cliente99001InputValidator),
  })

  const confirm = useConfirm()

  // Regenerar código cada vez que el dialog se abre
  useEffect(() => {
    if (open) {
      form99001.setValue('codigoCliente', generarCodigoCliente99001())
    }
  }, [open])

  // ------- Submit cliente normal -------
  const onSubmit: SubmitHandler<ClientInputProps> = async (input) => {
    try {
      const clientApiInput = registerClientComposeService(input)
      const { confirmed } = await confirm()
      if (!confirmed) return

      swalLoading()
      const { clienteCreate } = await registerClient(clientApiInput)
      if (clienteCreate) {
        notSuccess()
        form.reset()
        onClose(true)
      }
    } catch (error: any) {
      if (error instanceof MyGraphQlError) {
        notError(error.message)
      } else if (error !== undefined) {
        swalException(error)
      }
    } finally {
      swalClose()
    }
  }

  // ------- Submit cliente 99001 -------
  const onSubmit99001: SubmitHandler<Cliente99001InputProps> = async (input) => {
    try {
      const { confirmed } = await confirm()
      if (!confirmed) return

      swalLoading()
      const result = await apiCliente99001Registro({
        razonSocial: input.razonSocial,
        nombres: '',
        apellidos: '',
        email: input.email,
        codigoCliente: input.codigoCliente,
      })
      if (result) {
        notSuccess()
        form99001.reset(CLIENTE_99001_DEFAULT_INPUT())
        onClose(true)
      }
    } catch (error: any) {
      if (error instanceof MyGraphQlError) {
        notError(error.message)
      } else if (error !== undefined) {
        swalException(error)
      }
    } finally {
      swalClose()
    }
  }

  const onError = (errors: any, e: any) => logg(errors, e)

  const handleCancel = () => {
    form.reset()
    form99001.reset(CLIENTE_99001_DEFAULT_INPUT())
    onClose(false)
  }

  const isTab99001 = tabIndex === 1
  const isFormValid = isTab99001 ? form99001.formState.isValid : form.formState.isValid
  const handleSubmit = isTab99001
    ? form99001.handleSubmit(onSubmit99001, onError)
    : form.handleSubmit(onSubmit, onError)

  return (
    <>
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '80vh' } }}
        maxWidth="sm"
        open={open}
        {...other}
      >
        <DialogTitle>Registro Nuevo Cliente</DialogTitle>

        <Tabs
          value={tabIndex}
          onChange={(_, val) => setTabIndex(val)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Cliente Normal" />
          <Tab label="Cliente 99001" />
        </Tabs>

        <DialogContent dividers>
          {tabIndex === 0 && <ClientFormBody form={form} />}
          {tabIndex === 1 && <Cliente99001FormBody form={form99001} />}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button autoFocus color={'error'} onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant={'contained'} disabled={!isFormValid}>
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RegisterClientDialog
