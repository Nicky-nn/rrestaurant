import { LoadingButton } from '@mui/lab'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  TextField,
} from '@mui/material'
import React, { FunctionComponent, useEffect, useState } from 'react'

import { notError, notSuccess } from '../../../utils/notification'
import { swalException } from '../../../utils/swal'
import { apiUsuariosListado } from '../../restaurante/mutations/apiUsuariosListado'
import { useEnviarFacturaWhatsapp } from '../../restaurante/view/registrar/useEnviarFacturaWhatsapp'
import { ArqueoCaja } from '../types'

interface ArqueoCajaWhatsappDialogProps {
  id?: string
  open: boolean
  caja: ArqueoCaja | null
  onClose: () => void
}

const ArqueoCajaWhatsappDialog: FunctionComponent<ArqueoCajaWhatsappDialogProps> = ({
  open,
  caja,
  onClose,
  id,
}) => {
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<any[]>([])
  const [selectedUsuarios, setSelectedUsuarios] = useState<string[]>([])
  const [telefonosModificados, setTelefonosModificados] = useState<Record<string, string>>({})
  const [formato, setFormato] = useState<'pdf' | 'rollo'>('pdf')
  const { sendFactura, isPending } = useEnviarFacturaWhatsapp()

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await apiUsuariosListado({
          limit: 1000,
          page: 0,
          reverse: true,
          query: '',
        })
        const docs = response.docs || []
        setUsuariosDisponibles(docs)

        // Pre-seleccionar responsables
        if (caja?.responsables && caja.responsables.length > 0) {
          const responsables = docs.filter((u: any) => caja.responsables?.includes(u.usuario))
          setSelectedUsuarios(responsables.map((r: any) => r.usuario))
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
      }
    }
    if (open) {
      cargarUsuarios()
    } else {
      setSelectedUsuarios([])
      setTelefonosModificados({})
      setFormato('pdf')
    }
  }, [open, caja])

  const onSubmit = async () => {
    if (selectedUsuarios.length === 0) {
      notError('Debe seleccionar al menos un usuario para enviar el mensaje')
      return
    }

    const urlPdf = caja?.representacionGrafica?.[formato]

    if (!urlPdf) {
      notError(`El reporte de caja no tiene un enlace de descarga en formato ${formato.toUpperCase()}`)
      return
    }

    try {
      let enviados = 0
      for (const usuario of selectedUsuarios) {
        const telefono =
          telefonosModificados[usuario] !== undefined
            ? telefonosModificados[usuario]
            : usuariosDisponibles.find((u) => u.usuario === usuario)?.telefono

        if (!telefono) continue

        await sendFactura({
          telefono: telefono,
          urlPdf: urlPdf,
          nombreFactura: `Cierre de Caja ${caja.cajaCodigo || caja.cajaId || ''}`.trim(),
          mensajePersonalizado: `Hola ${usuario || ''}, le adjuntamos el reporte de cierre de caja en formato ${formato.toUpperCase()}.`,
        })
        enviados++
      }

      if (enviados === 0) {
        notError('Ninguno de los usuarios seleccionados tiene un número de teléfono válido registrado.')
      } else {
        notSuccess(`Reporte enviado correctamente a ${enviados} usuario(s) por WhatsApp.`)
        onClose()
      }
    } catch (err) {
      swalException(err)
    }
  }

  if (!caja) return null

  return (
    <Dialog
      id={id}
      sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '80vh' } }}
      maxWidth="sm"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Enviar Cierre de Caja {caja.cajaCodigo} por WhatsApp</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Typography variant="body1">Caja: {caja.cajaCodigo || caja.cajaId}</Typography>
          <Typography variant="body1">Fecha Cierre: {caja.fechaCierre}</Typography>
          <Typography variant="body1">Turno: {caja.turnoCaja?.nombre || 'S/N'}</Typography>
        </Box>
        <Alert color="info" icon={false} sx={{ mt: 2 }}>
          Seleccione los usuarios responsables a los que desea enviar el documento y el formato del archivo.
        </Alert>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="select-usuarios-label">Usuarios a enviar</InputLabel>
            <Select
              labelId="select-usuarios-label"
              multiple
              value={selectedUsuarios}
              onChange={(e) => {
                const { value } = e.target
                setSelectedUsuarios(typeof value === 'string' ? value.split(',') : value)
              }}
              input={<OutlinedInput label="Usuarios a enviar" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      onDelete={() => {
                        setSelectedUsuarios((prev) => prev.filter((item) => item !== value))
                      }}
                      onMouseDown={(event) => {
                        event.stopPropagation()
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {usuariosDisponibles.map((user) => (
                <MenuItem key={user.usuario} value={user.usuario}>
                  <Checkbox checked={selectedUsuarios.indexOf(user.usuario) > -1} />
                  <ListItemText
                    primary={`${user.usuario} ${user.telefono ? `(${user.telefono})` : '(Sin teléfono)'}`}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="formato-archivo-label">Formato de Archivo</InputLabel>
            <Select
              labelId="formato-archivo-label"
              value={formato}
              label="Formato de Archivo"
              onChange={(e) => setFormato(e.target.value as 'pdf' | 'rollo')}
            >
              <MenuItem value="pdf">PDF (Medio Oficio)</MenuItem>
              <MenuItem value="rollo">Rollo (Ticket)</MenuItem>
            </Select>
          </FormControl>

          {selectedUsuarios.length > 0 && (
            <Box sx={{ mt: 1, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 1.5, display: 'block' }}>
                TELÉFONOS A ENVIAR (Puede modificarlos si es necesario)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedUsuarios.map((usuario) => {
                  const originalUser = usuariosDisponibles.find((u) => u.usuario === usuario)
                  const telefonoActual =
                    telefonosModificados[usuario] !== undefined
                      ? telefonosModificados[usuario]
                      : originalUser?.telefono || ''

                  return (
                    <TextField
                      key={usuario}
                      fullWidth
                      size="small"
                      label={`Teléfono de ${usuario}`}
                      placeholder="+591 71234567"
                      value={telefonoActual}
                      onChange={(e) => {
                        setTelefonosModificados((prev) => ({
                          ...prev,
                          [usuario]: e.target.value,
                        }))
                      }}
                    />
                  )
                })}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button color="error" disabled={isPending} onClick={onClose}>
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

export default ArqueoCajaWhatsappDialog
