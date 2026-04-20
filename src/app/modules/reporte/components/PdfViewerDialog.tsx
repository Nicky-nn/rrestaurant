import { Close, Print } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import Dialog from '@mui/material/Dialog'
import { FunctionComponent, useState } from 'react'

import { apiImprimirUrl } from '../../../base/api/apiImpresoras'
import AppSelect from '../../../base/components/MySelect/AppSelect'
import useAuth from '../../../base/hooks/useAuth'
import { decodePrintParams } from '../../../utils/licenciaHelper'
import { notDanger, notSuccess } from '../../../utils/notification'
import { swalException } from '../../../utils/swal'

const GRUPOS_IMPRESION = [
  { value: 'Comanda', label: 'Comanda' },
  { value: 'Cuenta', label: 'Cuenta' },
  { value: 'Factura', label: 'Factura' },
]

interface PdfViewerDialogProps {
  open: boolean
  pdfUrl: string | null
  onClose: () => void
}

/**
 * Dialog para visualizar el PDF generado y opcionalmente imprimirlo.
 * La sección de impresión solo se muestra si la licencia de impresión está ACTIVADA.
 */
const PdfViewerDialog: FunctionComponent<PdfViewerDialogProps> = ({ open, pdfUrl, onClose }) => {
  const { li } = useAuth()
  const licenciaActiva = li?.activo === true

  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('Comanda')
  const [imprimiendo, setImprimiendo] = useState(false)

  const handleImprimir = async () => {
    if (!pdfUrl) {
      notDanger('No hay PDF para imprimir')
      return
    }
    setImprimiendo(true)
    try {
      const params = decodePrintParams(li.licencia?.parametros ?? null)
      await apiImprimirUrl(params.host, pdfUrl, grupoSeleccionado)
      notSuccess(`Enviado al grupo "${grupoSeleccionado}"`)
    } catch (e: any) {
      swalException(e)
    } finally {
      setImprimiendo(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{ sx: { height: '95vh', display: 'flex', flexDirection: 'column' } }}
    >
      {/* Barra superior */}
      <AppBar position="relative" color="default" elevation={1} sx={{ flexShrink: 0 }}>
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Vista previa del PDF
          </Typography>
          <IconButton edge="end" onClick={onClose}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Contenido principal */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Panel izquierdo: impresión (solo si licencia activa) */}
        {licenciaActiva && (
          <Box
            sx={{
              width: 220,
              flexShrink: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Stack spacing={0.5}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Print fontSize="small" color="primary" />
                Imprimir PDF
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Selecciona el grupo de impresión registrado.
              </Typography>
            </Stack>

            <FormControl fullWidth size="small">
              <InputLabel>Grupo</InputLabel>
              <AppSelect
                label="Grupo"
                options={GRUPOS_IMPRESION}
                value={grupoSeleccionado}
                onChange={(e) => setGrupoSeleccionado(e.target.value as string)}
                size="small"
              />
            </FormControl>

            <Tooltip title={imprimiendo ? 'Enviando...' : ''}>
              <span>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={imprimiendo ? <CircularProgress size={14} color="inherit" /> : <Print />}
                  disabled={imprimiendo}
                  onClick={handleImprimir}
                >
                  {imprimiendo ? 'Enviando...' : 'Imprimir'}
                </Button>
              </span>
            </Tooltip>

            <Button
              fullWidth
              variant="text"
              size="small"
              color="inherit"
              onClick={onClose}
              sx={{ mt: 'auto' }}
            >
              Cerrar
            </Button>
          </Box>
        )}

        {/* Panel derecho: iframe PDF */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              style={{ border: 'none', display: 'block', flex: 1 }}
              title="PDF Viewer"
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  )
}

export default PdfViewerDialog
