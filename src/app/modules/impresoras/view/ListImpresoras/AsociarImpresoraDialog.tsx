import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { FunctionComponent, useEffect, useState } from 'react'

import useAuth from '../../../../base/hooks/useAuth'
import { notSuccess } from '../../../../utils/notification'
import { swalClose, swalException, swalLoading } from '../../../../utils/swal'
import { Articulo } from '../../../restaurante/types'
import { useArticuloPrecioImpresoraUpsert } from '../../mutations/useArticuloPrecioImpresoraUpsert'
import { useImpresoraPorSucursal } from '../../queries/useImpresoraPorSucursal'

interface Props {
  open: boolean
  articulo: Articulo | null
  allArticulos: Articulo[]
  onClose: (success?: boolean) => void
}

const AsociarImpresoraDialog: FunctionComponent<Props> = ({ open, articulo, allArticulos, onClose }) => {
  const { user } = useAuth()
  const { data: impresoras = [], isLoading: loadingImpresoras } = useImpresoraPorSucursal({
    codigoSucursal: user?.sucursal?.codigo || 0,
  })

  const { mutateAsync } = useArticuloPrecioImpresoraUpsert()

  const [applyToCategory, setApplyToCategory] = useState(false)
  const [selectedImpresora, setSelectedImpresora] = useState<string>('')

  useEffect(() => {
    if (open) {
      setApplyToCategory(false)
      // Si el artículo ya tiene una impresora asociada, preseleccionar la primera
      if (articulo?.impresoras && articulo.impresoras.length > 0 && articulo.impresoras[0]._id) {
        setSelectedImpresora(articulo.impresoras[0]._id as string)
      } else {
        setSelectedImpresora('')
      }
    }
  }, [open, articulo])

  const handleClose = () => {
    onClose()
  }

  const handleSave = async () => {
    if (!articulo || !selectedImpresora) return

    swalLoading()
    try {
      const articulosAfectados = applyToCategory
        ? allArticulos.filter((a) => a.tipoArticulo?._id === articulo.tipoArticulo?._id)
        : [articulo]

      // Mapeamos y ejecutamos la mutation para cada artículo
      await Promise.all(
        articulosAfectados.map(async (art) => {
          if (!art.articuloPrecioId) return
          await mutateAsync({
            id: art.articuloPrecioId, // Se utiliza articuloPrecioId como indica la mutation
            input: {
              impresoraId: [selectedImpresora], // Sobrescribimos el arreglo con la impresora seleccionada
            },
          })
        }),
      )

      swalClose()
      notSuccess(`Se asoció la impresora a ${articulosAfectados.length} artículo(s).`)
      onClose(true)
    } catch (error) {
      swalException(error)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Asociar Impresora</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3}>
          <Typography variant="body1">
            <strong>Artículo base:</strong> {articulo?.nombreArticulo}
            <br />
            <strong>Categoría:</strong> {articulo?.tipoArticulo?.descripcion || 'Sin Categoría'}
          </Typography>

          <TextField
            select
            label="Impresora de Destino"
            variant="outlined"
            fullWidth
            value={selectedImpresora}
            onChange={(e) => setSelectedImpresora(e.target.value)}
            disabled={loadingImpresoras}
          >
            <MenuItem value="" disabled>
              Seleccione una impresora...
            </MenuItem>
            {impresoras.map((imp) => (
              <MenuItem key={imp._id} value={imp._id!}>
                {imp.nombre} {imp.descripcion ? `- ${imp.descripcion}` : ''}
              </MenuItem>
            ))}
          </TextField>

          <Box mt={1} p={2} border={1} borderColor="divider" borderRadius={2} bgcolor="background.default">
            <FormControlLabel
              control={
                <Switch
                  checked={applyToCategory}
                  onChange={(e) => setApplyToCategory(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" fontWeight="500">
                  Aplicar a todos los artículos de la categoría "{articulo?.tipoArticulo?.descripcion}"
                </Typography>
              }
            />
            {applyToCategory && (
              <Typography variant="caption" color="textSecondary" display="block" ml={4}>
                Esto actualizará la impresora de{' '}
                {allArticulos.filter((a) => a.tipoArticulo?._id === articulo?.tipoArticulo?._id).length}{' '}
                artículos listados en este momento.
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={!selectedImpresora}>
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AsociarImpresoraDialog
