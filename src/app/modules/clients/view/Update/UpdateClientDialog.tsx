import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useConfirm } from 'material-ui-confirm'
import { FunctionComponent, useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { MyGraphQlError } from '../../../../base/services/GraphqlError'
import { actionForm } from '../../../../interfaces'
import { logg } from '../../../../utils/helper'
import { notError, notSuccess } from '../../../../utils/notification'
import { swalClose, swalException, swalLoading } from '../../../../utils/swal'
import { apiCliente99001Actualizar } from '../../api/apiCliente99001Actualizar'
import { updateClient } from '../../api/updateClient'
import Cliente99001FormBody from '../../components/Cliente99001FormBody'
import ClientFormBody from '../../components/ClientFormBody'
import { CLIENT_DEFAULT_INPUT, ClientInputProps, ClientProps } from '../../interfaces/client'
import { CLIENTE_99001_DEFAULT_INPUT, Cliente99001InputProps } from '../../interfaces/client99001'
import { clientDecomposeService } from '../../services/clientDecomposeService'
import { updateClientComposeService } from '../../services/updateClientComposeService'
import { cliente99001InputValidator } from '../../validator/cliente99001InputValidator'
import { clienteInputValidator } from '../../validator/clienteInputValidator'

interface UpdateClientProps {
  id: string
  open: boolean
  client: ClientProps | null
  is99001?: boolean
  onClose: (isUpdateSuccess: boolean) => void
}

type Props = UpdateClientProps

const UpdateClientDialog: FunctionComponent<Props> = (props) => {
  const { onClose, open, client, is99001 = false, ...other } = props

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

  useEffect(() => {
    if (open && client) {
      if (is99001) {
        form99001.reset({
          razonSocial: client.razonSocial ?? '',
          email: client.email ?? '',
          codigoCliente: client.codigoCliente ?? '',
        })
      } else {
        form.reset(clientDecomposeService(client, actionForm.UPDATE))
      }
    }
  }, [open])

  const confirm = useConfirm()

  // ------- Submit cliente normal -------
  const onSubmit: SubmitHandler<ClientInputProps> = async (input) => {
    try {
      const clientApiInput = updateClientComposeService(input)
      const { confirmed } = await confirm()
      if (!confirmed) return

      swalLoading()
      const { clienteUpdate } = await updateClient(client!._id, clientApiInput)
      if (clienteUpdate) {
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
      const result = await apiCliente99001Actualizar(client!._id, {
        razonSocial: input.razonSocial,
        email: input.email,
      })
      if (result) {
        notSuccess()
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

  const isFormValid = is99001 ? form99001.formState.isValid : form.formState.isValid
  const handleSubmit = is99001
    ? form99001.handleSubmit(onSubmit99001, onError)
    : form.handleSubmit(onSubmit, onError)

  const handleCancel = () => {
    form.reset()
    onClose(false)
  }

  return (
    <>
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '80vh' } }}
        maxWidth="sm"
        open={open}
        {...other}
      >
        <DialogTitle>Actualizar Cliente {client?.razonSocial}</DialogTitle>
        <DialogContent dividers>
          {is99001 ? <Cliente99001FormBody form={form99001} /> : <ClientFormBody form={form} />}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button autoFocus color={'error'} onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant={'contained'} disabled={!isFormValid}>
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UpdateClientDialog
