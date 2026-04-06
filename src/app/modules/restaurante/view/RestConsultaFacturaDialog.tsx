import {
  Close,
  DocumentScanner,
  InsertLink,
  IntegrationInstructions,
  PictureAsPdf,
} from '@mui/icons-material'
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Typography,
} from '@mui/material'
import { FunctionComponent, useState } from 'react'

import { numberWithCommasPlaces } from '../../../base/components/MyInputs/NumberInput'
import useOperaciones from '../../../base/hooks/useOperaciones'
import { SalidaFactura } from '../types'

interface RestConsultaFacturaDialogProps {
  factura: SalidaFactura | null
  open: boolean
  onClose: () => void
}

/**
 * Componente dialogo para visualizar y acceder a la representación gráfica de la Factura de Restaurante
 */
const RestConsultaFacturaDialog: FunctionComponent<RestConsultaFacturaDialogProps> = ({
  factura,
  open,
  onClose,
}) => {
  const operaciones = useOperaciones()
  const monedaPrimaria = operaciones?.articuloMoneda?.monedaPrimaria

  const [frameUrl, setFrameUrl] = useState<string | null>(null)

  const renderFactura = () => {
    if (!factura) {
      return (
        <Typography variant="body2" color="error">
          No hay factura seleccionada
        </Typography>
      )
    }

    return (
      <div className={'responsive-table'}>
        <table className={'table-dense'} style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ width: 140 }}>
                <Typography variant={'caption'} color="textSecondary">
                  Nro. de factura
                </Typography>
              </td>
              <td>{factura.numeroFactura}</td>
            </tr>
            <tr>
              <td>
                <Typography variant={'caption'} color="textSecondary">
                  Fecha de emisión
                </Typography>
              </td>
              <td>{factura.fechaEmision}</td>
            </tr>
            <tr>
              <td>
                <Typography variant={'caption'} color="textSecondary">
                  Cliente
                </Typography>
              </td>
              <td>{factura.cliente?.razonSocial}</td>
            </tr>
            <tr>
              <td>
                <Typography variant={'caption'} color="textSecondary">
                  Nro. Documento
                </Typography>
              </td>
              <td>{factura.cliente?.numeroDocumento}</td>
            </tr>
            <tr>
              <td>
                <Typography variant={'caption'} color="textSecondary">
                  Monto total
                </Typography>
              </td>
              <td>
                {numberWithCommasPlaces(factura.montoTotal || 0)}{' '}
                <strong>
                  {monedaPrimaria?.sigla || 'Bs.'} ( T.C. {numberWithCommasPlaces(factura.tipoCambio || 1)})
                </strong>
              </td>
            </tr>
            <tr>
              <td>
                <Typography variant={'caption'} color="textSecondary">
                  Estado
                </Typography>
              </td>
              <td>{factura.state}</td>
            </tr>
            {factura.representacionGrafica && (
              <tr>
                <td colSpan={2} style={{ paddingTop: 16 }}>
                  <ButtonGroup variant="outlined" aria-label="grupo de acciones de factura" fullWidth>
                    {factura.representacionGrafica.pdf && (
                      <Button
                        size={'small'}
                        startIcon={<PictureAsPdf />}
                        onClick={() => setFrameUrl(factura.representacionGrafica?.pdf || null)}
                      >
                        Pdf
                      </Button>
                    )}
                    {factura.representacionGrafica.rollo && (
                      <Button
                        size={'small'}
                        startIcon={<DocumentScanner />}
                        onClick={() => setFrameUrl(factura.representacionGrafica?.rollo || null)}
                      >
                        Rollo
                      </Button>
                    )}
                    {factura.representacionGrafica.xml && (
                      <Button
                        size={'small'}
                        startIcon={<IntegrationInstructions />}
                        component={Link}
                        target={'_blank'}
                        href={factura.representacionGrafica.xml}
                      >
                        Xml
                      </Button>
                    )}
                    {factura.representacionGrafica.sin && (
                      <Button
                        size={'small'}
                        startIcon={<InsertLink />}
                        component={Link}
                        target={'_blank'}
                        href={factura.representacionGrafica.sin}
                      >
                        S.I.N.
                      </Button>
                    )}
                  </ButtonGroup>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '100%', maxWidth: 500 } }}
        maxWidth="sm"
        open={open}
        onClose={onClose}
      >
        <DialogTitle>Consulta Factura {factura?.numeroFactura || ''}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Divider textAlign={'left'} sx={{ mb: 2 }}>
                <strong>Detalle de la Factura</strong>
              </Divider>
              {renderFactura()}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button color={'error'} onClick={onClose}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Visor de Documentos (PDF/Rollo) */}
      <Dialog
        open={!!frameUrl}
        onClose={() => setFrameUrl(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { height: '85vh' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 1,
          }}
        >
          Visualizador de Documento
          <IconButton aria-label="close" onClick={() => setFrameUrl(null)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {frameUrl && (
            <iframe
              src={frameUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Visor de Documento"
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setFrameUrl(null)} color="error" variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RestConsultaFacturaDialog
