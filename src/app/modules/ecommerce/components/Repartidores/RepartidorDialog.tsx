import { yupResolver } from '@hookform/resolvers/yup'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useRepartidoresQuery } from '../../hooks/useRepartidoresQuery'
import { RepartidorProps } from './RepartidoresTable'

interface RepartidorDialogProps {
  open: boolean
  onClose: () => void
  repartidor: RepartidorProps | null
}

const schema = yup.object({
  email: yup.string().email('Debe ser un correo válido').required('El correo es requerido'),
  vehiculo: yup.string().required('El vehículo es requerido'),
  status: yup.string().required('El estado es requerido'),
  esConfiable: yup.boolean().required(),
})

const RepartidorDialog: React.FC<RepartidorDialogProps> = ({ open, onClose, repartidor }) => {
  const isEditing = !!repartidor
  const { createRepartidorMutation, updateRepartidorMutation } = useRepartidoresQuery()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      vehiculo: 'CAMINANDO',
      status: 'PENDIENTE',
      esConfiable: false,
    },
  })

  useEffect(() => {
    if (open) {
      if (repartidor) {
        reset({
          email: repartidor.email,
          vehiculo: repartidor.vehiculo,
          status: repartidor.status,
          esConfiable: repartidor.esConfiable,
        })
      } else {
        reset({
          email: '',
          vehiculo: 'CAMINANDO',
          status: 'PENDIENTE',
          esConfiable: false,
        })
      }
    }
  }, [open, repartidor, reset])

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    try {
      if (isEditing && repartidor) {
        await updateRepartidorMutation.mutateAsync({
          id: repartidor.id,
          input: {
            vehiculo: data.vehiculo,
            status: data.status,
            esConfiable: data.esConfiable,
          },
        })
      } else {
        await createRepartidorMutation.mutateAsync({
          email: data.email,
          vehiculo: data.vehiculo,
          esConfiable: data.esConfiable,
        })
      }
      onClose()
    } catch (error) {
      console.error(error)
      // Mostrar alerta o snackbar de error
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Repartidor' : 'Nuevo Repartidor'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Correo Electrónico"
                fullWidth
                margin="normal"
                disabled={isEditing}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name="vehiculo"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.vehiculo}>
                <InputLabel id="vehiculo-label">Vehículo</InputLabel>
                <Select {...field} labelId="vehiculo-label" label="Vehículo">
                  <MenuItem value="CAMINANDO">Caminando</MenuItem>
                  <MenuItem value="BICICLETA">Bicicleta</MenuItem>
                  <MenuItem value="MOTO">Moto</MenuItem>
                  <MenuItem value="AUTO">Auto</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          {isEditing && (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.status}>
                  <InputLabel id="status-label">Estado</InputLabel>
                  <Select {...field} labelId="status-label" label="Estado">
                    <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                    <MenuItem value="ACTIVO">Activo</MenuItem>
                    <MenuItem value="INACTIVO">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          )}

          <Controller
            name="esConfiable"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                  />
                }
                label="Es Confiable (No pedir código de entrega)"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RepartidorDialog
