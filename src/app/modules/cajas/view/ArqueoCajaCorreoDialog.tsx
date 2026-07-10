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
import { apiArqueoCajaCorreo } from '../../restaurante/mutations/apiArqueoCajaCorreo'
import { ArqueoCaja } from '../types'

interface ArqueoCajaCorreoDialogProps {
  id?: string
  open: boolean
  caja: ArqueoCaja | null
  onClose: () => void
}

const ArqueoCajaCorreoDialog: FunctionComponent<ArqueoCajaCorreoDialogProps> = ({
  open,
  caja,
  onClose,
  id,
}) => {
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<any[]>([])
  const [selectedUsuarios, setSelectedUsuarios] = useState<string[]>([])
  const [correosModificados, setCorreosModificados] = useState<Record<string, string>>({})
  const [formato, setFormato] = useState<'pdf' | 'rollo'>('pdf')
  const [isPending, setIsPending] = useState(false)

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
      setCorreosModificados({})
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
      setIsPending(true)

      const emailsToSend: string[] = []

      for (const usuario of selectedUsuarios) {
        const correo =
          correosModificados[usuario] !== undefined
            ? correosModificados[usuario]
            : usuariosDisponibles.find((u) => u.usuario === usuario)?.correo

        if (correo && correo.trim() !== '') {
          emailsToSend.push(correo.trim())
        }
      }

      if (emailsToSend.length === 0) {
        notError('Ninguno de los usuarios seleccionados tiene un correo electrónico válido registrado.')
        setIsPending(false)
        return
      }

      const nombreArchivo = `Cierre_de_Caja_${caja.cajaCodigo || caja.cajaId || ''}.pdf`

      await apiArqueoCajaCorreo({
        titulo: `Cierre de Caja ${caja.cajaCodigo || caja.cajaId || ''}`,
        mensaje: `Se adjunta el reporte de cierre de caja en formato ${formato.toUpperCase()}.`,
        urlArchivo: [
          {
            filename: nombreArchivo,
            href: urlPdf,
          },
        ],
        email: emailsToSend,
      })

      notSuccess(`Reporte enviado correctamente a ${emailsToSend.length} correo(s).`)
      onClose()
    } catch (err) {
      swalException(err)
    } finally {
      setIsPending(false)
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
      <DialogTitle>Enviar Cierre de Caja {caja.cajaCodigo} por Correo</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Typography variant="body1">Caja: {caja.cajaCodigo || caja.cajaId}</Typography>
          <Typography variant="body1">Fecha Cierre: {caja.fechaCierre}</Typography>
          <Typography variant="body1">Turno: {caja.turnoCaja?.nombre || 'S/N'}</Typography>
        </Box>
        <Alert color="info" icon={false} sx={{ mt: 2 }}>
          Seleccione los usuarios responsables a los que desea enviar el documento por correo electrónico.
        </Alert>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="select-usuarios-correo-label">Usuarios a enviar</InputLabel>
            <Select
              labelId="select-usuarios-correo-label"
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
                    primary={`${user.usuario} ${user.correo ? `(${user.correo})` : '(Sin correo)'}`}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="formato-archivo-correo-label">Formato de Archivo</InputLabel>
            <Select
              labelId="formato-archivo-correo-label"
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
                CORREOS A ENVIAR (Puede modificarlos si es necesario)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedUsuarios.map((usuario) => {
                  const originalUser = usuariosDisponibles.find((u) => u.usuario === usuario)
                  const correoActual =
                    correosModificados[usuario] !== undefined
                      ? correosModificados[usuario]
                      : originalUser?.correo || ''

                  return (
                    <TextField
                      key={usuario}
                      fullWidth
                      size="small"
                      label={`Correo de ${usuario}`}
                      placeholder="ejemplo@correo.com"
                      value={correoActual}
                      onChange={(e) => {
                        setCorreosModificados((prev) => ({
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
          color="primary"
          size="small"
          variant="contained"
          onClick={onSubmit}
        >
          Enviar Correo
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default ArqueoCajaCorreoDialog
