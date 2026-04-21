import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { FunctionComponent, useEffect, useState } from 'react'

import { FormTextField } from '../../../../base/components/Form'
import useAuth from '../../../../base/hooks/useAuth'
import { notDanger, notSuccess } from '../../../../utils/notification'
import { swalClose, swalException, swalLoading } from '../../../../utils/swal'
import { useImpresoraActualizar } from '../../mutations/useImpresoraActualizar'
import { useImpresoraRegistro } from '../../mutations/useImpresoraRegistro'
import { Impresora, ImpresoraInput } from '../../types'

interface Props {
  open: boolean
  impresora: Impresora | null
  onClose: (success?: boolean) => void
}

const ImpresoraFormDialog: FunctionComponent<Props> = ({ open, impresora, onClose }) => {
  const { user } = useAuth()

  const { mutateAsync: registerMutation } = useImpresoraRegistro()
  const { mutateAsync: updateMutation } = useImpresoraActualizar()

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [atributo1, setAtributo1] = useState('')
  const [atributo2, setAtributo2] = useState('')

  useEffect(() => {
    if (open) {
      if (impresora) {
        setNombre(impresora.nombre || '')
        setDescripcion(impresora.descripcion || '')
        setAtributo1(impresora.atributo1 || '')
        setAtributo2(impresora.atributo2 || '')
      } else {
        setNombre('')
        setDescripcion('')
        setAtributo1('')
        setAtributo2('')
      }
    }
  }, [open, impresora])

  const handleSave = async () => {
    if (!nombre.trim()) {
      notDanger('El nombre es obligatorio')
      return
    }

    swalLoading()
    try {
      const input: ImpresoraInput = { nombre, descripcion, atributo1, atributo2 }

      if (impresora?._id) {
        await updateMutation({ id: impresora._id, input })
        notSuccess('Impresora actualizada exitosamente.')
      } else {
        await registerMutation({
          entidad: {
            codigoSucursal: user?.sucursal?.codigo || 0,
            codigoPuntoVenta: user?.puntoVenta?.codigo || 0,
          },
          input,
        })
        notSuccess('Impresora registrada exitosamente.')
      }
      swalClose()
      onClose(true)
    } catch (error) {
      swalException(error)
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>{impresora ? 'Editar Impresora' : 'Nueva Impresora'}</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <FormTextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
            required
            autoFocus
          />
          <FormTextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={() => onClose(false)} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImpresoraFormDialog
