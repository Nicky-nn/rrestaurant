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
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Dialog from '@mui/material/Dialog'
import { FunctionComponent, useEffect, useState } from 'react'

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

const PdfViewerDialog: FunctionComponent<PdfViewerDialogProps> = ({ open, pdfUrl, onClose }) => {
  const { li } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const licenciaActiva = li?.activo === true

  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('Comanda')
  const [imprimiendo, setImprimiendo] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)

  // Resetear el loading cuando cambia el PDF o se abre el dialog
  useEffect(() => {
    if (open) setIframeLoading(true)
  }, [pdfUrl, open])

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
      fullScreen={isMobile} // Pantalla completa en móviles para mejor experiencia
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          height: isMobile ? '100%' : '95vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        },
      }}
    >
      {/* Barra superior */}
      <AppBar position="relative" color="default" elevation={1} sx={{ flexShrink: 0 }}>
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            Vista previa
          </Typography>
          <IconButton edge="end" onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Contenido principal Adaptable */}
      <Stack direction={isMobile ? 'column' : 'row'} sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Panel de impresión (Arriba en móvil, Izquierda en desktop) */}
        {licenciaActiva && (
          <Box
            sx={{
              width: isMobile ? '100%' : 240,
              flexShrink: 0,
              borderRight: isMobile ? 'none' : '1px solid',
              borderBottom: isMobile ? '1px solid' : 'none',
              borderColor: 'divider',
              p: 2,
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              alignItems: isMobile ? 'center' : 'stretch',
              gap: 2,
              overflowX: 'auto',
            }}
          >
            {!isMobile && (
              <Stack spacing={0.5}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Print fontSize="small" color="primary" />
                  Imprimir
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Selecciona el destino
                </Typography>
              </Stack>
            )}

            <FormControl fullWidth={!isMobile} size="small" sx={{ minWidth: isMobile ? 120 : 'auto' }}>
              <InputLabel>Grupo</InputLabel>
              <AppSelect
                label="Grupo"
                options={GRUPOS_IMPRESION}
                value={grupoSeleccionado}
                onChange={(e) => setGrupoSeleccionado(e.target.value as string)}
              />
            </FormControl>

            <Button
              fullWidth={!isMobile}
              variant="contained"
              size="medium"
              startIcon={imprimiendo ? <CircularProgress size={16} color="inherit" /> : <Print />}
              disabled={imprimiendo || !pdfUrl}
              onClick={handleImprimir}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {imprimiendo ? '...' : 'Imprimir'}
            </Button>
          </Box>
        )}

        {/* Visor de PDF con Loading State */}
        <Box sx={{ flex: 1, position: 'relative', bgcolor: '#525659', display: 'flex' }}>
          {pdfUrl ? (
            <>
              {iframeLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  <CircularProgress size={40} />
                  <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
                    Cargando documento...
                  </Typography>
                </Box>
              )}
              <iframe
                src={`${pdfUrl}#toolbar=1`} // Forzar barra de herramientas del PDF
                width="100%"
                height="100%"
                style={{
                  border: 'none',
                  opacity: iframeLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                }}
                title="PDF Viewer"
                onLoad={() => setIframeLoading(false)}
              />
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                color: 'white',
              }}
            >
              <Typography>No se pudo cargar el archivo.</Typography>
            </Box>
          )}
        </Box>
      </Stack>
    </Dialog>
  )
}

export default PdfViewerDialog
