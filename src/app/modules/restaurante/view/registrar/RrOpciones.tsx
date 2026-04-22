import CloseIcon from '@mui/icons-material/Close'
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined'
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined'
import PrintIcon from '@mui/icons-material/Print'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import pdfMake from 'pdfmake/build/pdfmake'

import PdfViewerDialog from '../../../reporte/components/PdfViewerDialog'
;(pdfMake as any).fonts = {
  Roboto: {
    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
}

import {
  alpha,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { Grid } from '@mui/system'
import { FunctionComponent, useEffect, useState } from 'react'

import { FormTextField } from '../../../../base/components/Form'
import { swalClose, swalException, swalLoading } from '../../../../utils/swal'
import { registerClient } from '../../../clients/api/registerClient'
import { updateClient } from '../../../clients/api/updateClient'
import InputSearchClients from '../../../clients/components/InputSearchClients'
import { ClientApiInputProps, ClientProps } from '../../../clients/interfaces/client'
import {
  ESTADO_MESA,
  MesaUI,
  OpcionesParaLlevar,
  TIPO_PEDIDO,
  TipoPedido,
} from '../../interfaces/mesa.interface'

// ─────────────────────────────────────────────────────────────
// Constantes y tipos
// ─────────────────────────────────────────────────────────────
const DIRECCION_EMPTY = {
  calle: '',
  numero: '',
  apartamento: '',
  barrio: '',
  referenciasAdicionales: '',
}

type DireccionLocal = typeof DIRECCION_EMPTY

type MetodoDelivery = 'PROPIO' | 'PEDIDOS_YA'

// ─────────────────────────────────────────────────────────────
// Sub-componente reutilizable: Buscador + Dirección editable
// Se usa tanto en LLEVAR como en DELIVERY (modo PROPIO)
// ─────────────────────────────────────────────────────────────
interface ClienteDireccionPanelProps {
  cliente: ClientProps | null
  onClienteChange: (c: ClientProps | null) => void
  onEditableClienteChange: (c: ClientApiInputProps | null) => void
  direccionLocal: DireccionLocal
  onDireccionFieldChange: (field: keyof DireccionLocal, val: string) => void
}

const ClienteDireccionPanel: FunctionComponent<ClienteDireccionPanelProps> = ({
  cliente,
  onClienteChange,
  onEditableClienteChange,
  direccionLocal,
  onDireccionFieldChange,
}) => {
  const theme = useTheme()
  return (
    <Box>
      <InputSearchClients
        value={cliente}
        withCreditLine={false}
        onClientSelect={onClienteChange}
        onListShowed={() => {}}
        autoSelectDefaultCode="00"
        editable={true}
        onChangeEditable={onEditableClienteChange}
      />

      {/* Bloque sin edición para cliente 00 */}
      {cliente && cliente.codigoCliente === '00' && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: alpha(theme.palette.text.disabled, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2">
                <strong>Razón Social:</strong> {cliente.razonSocial}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2">
                <strong>Documento:</strong> {cliente.numeroDocumento}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Dirección editable (solo para clientes que no son el 00) */}
      {cliente && cliente.codigoCliente !== '00' && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: alpha(theme.palette.info.main, 0.04),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            textTransform="uppercase"
            sx={{ display: 'block', mb: 1.5 }}
          >
            Dirección
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 8 }}>
              <TextField
                fullWidth
                size="small"
                label="Calle/Avenida"
                value={direccionLocal.calle}
                onChange={(e) => onDireccionFieldChange('calle', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Número"
                value={direccionLocal.numero}
                onChange={(e) => onDireccionFieldChange('numero', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Barrio/Zona"
                value={direccionLocal.barrio}
                onChange={(e) => onDireccionFieldChange('barrio', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Piso/Apartamento"
                value={direccionLocal.apartamento}
                onChange={(e) => onDireccionFieldChange('apartamento', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Referencias Adicionales"
                value={direccionLocal.referenciasAdicionales}
                onChange={(e) => onDireccionFieldChange('referenciasAdicionales', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────
// Props del componente principal
// ─────────────────────────────────────────────────────────────
interface RrOpcionesProps {
  open: boolean
  onClose: () => void
  tipoPedido: TipoPedido
  setTipoPedido: (tipo: TipoPedido) => void
  mesaSeleccionada?: MesaUI | null
  opcionesLlevar?: OpcionesParaLlevar | null
  setOpcionesLlevar: (opciones: OpcionesParaLlevar | null) => void
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const buildClienteApiBase = (cliente: ClientProps): ClientApiInputProps => ({
  codigoTipoDocumentoIdentidad: Number(cliente.tipoDocumentoIdentidad?.codigoClasificador) || 1,
  nombres: cliente.nombres || '',
  apellidos: cliente.apellidos || '',
  razonSocial: cliente.razonSocial || '',
  numeroDocumento: cliente.numeroDocumento || '',
  complemento: cliente.complemento || '',
  email: cliente.email || '',
  telefono: cliente.telefono || '',
})

const parseDireccion = (raw: string | undefined): DireccionLocal => {
  try {
    const p = JSON.parse(raw || '{}')
    return {
      calle: p.calle || '',
      numero: p['número'] || p.numero || '',
      apartamento: p.apartamento || '',
      barrio: p.barrio || '',
      referenciasAdicionales: p.referenciasAdicionales || '',
    }
  } catch {
    return DIRECCION_EMPTY
  }
}

const serializeDireccion = (d: DireccionLocal): string =>
  JSON.stringify({
    calle: d.calle,
    número: d.numero,
    apartamento: d.apartamento,
    barrio: d.barrio,
    referenciasAdicionales: d.referenciasAdicionales,
  })

const hasDireccionChanged = (a: DireccionLocal, b: DireccionLocal): boolean =>
  a.calle !== b.calle ||
  a.numero !== b.numero ||
  a.apartamento !== b.apartamento ||
  a.barrio !== b.barrio ||
  a.referenciasAdicionales !== b.referenciasAdicionales

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
const RrOpciones: FunctionComponent<RrOpcionesProps> = ({
  open,
  onClose,
  tipoPedido,
  setTipoPedido,
  mesaSeleccionada,
  opcionesLlevar,
  setOpcionesLlevar,
}) => {
  const theme = useTheme()

  // ── Tipo de pedido LOCAL — no se propaga al padre hasta guardar ──
  const [tipoPedidoLocal, setTipoPedidoLocal] = useState<TipoPedido>(tipoPedido)

  // ── Estado compartido LLEVAR / DELIVERY-PROPIO ──
  const [cliente, setCliente] = useState<ClientProps | null>(opcionesLlevar?.cliente || null)
  const [horaRecojo, setHoraRecojo] = useState(opcionesLlevar?.horaRecojo || '')
  const [solicitarUtensilios, setSolicitarUtensilios] = useState(opcionesLlevar?.solicitarUtensilios || false)
  const [editableCliente, setEditableCliente] = useState<ClientApiInputProps | null>(null)
  const [direccionLocal, setDireccionLocal] = useState<DireccionLocal>(DIRECCION_EMPTY)

  // ── Estado específico DELIVERY ──
  const [metodoDelivery, setMetodoDelivery] = useState<MetodoDelivery>('PROPIO')
  const [codigoOrdenApp, setCodigoOrdenApp] = useState('')
  const [nombreRepartidor, setNombreRepartidor] = useState('')

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const handleImprimirCliente = async () => {
    if (!cliente || cliente.codigoCliente === '00') return

    const d = direccionLocal
    const contentData: any[] = [{ text: 'Cliente', style: 'header' }]

    // Razón Social + Documento (siempre, los más importantes)
    const row1: any[] = []
    if (cliente.razonSocial)
      row1.push({
        width: '*',
        stack: [
          { text: 'Razón Social', style: 'label' },
          { text: cliente.razonSocial, style: 'value' },
        ],
      })
    if (cliente.numeroDocumento)
      row1.push({
        width: '*',
        stack: [
          { text: 'Documento', style: 'label' },
          { text: cliente.numeroDocumento, style: 'value' },
        ],
      })
    if (row1.length) contentData.push({ columns: row1, columnGap: 8, margin: [0, 4, 0, 0] })

    // Teléfono + Email
    const row2: any[] = []
    if (cliente.telefono)
      row2.push({
        width: '*',
        stack: [
          { text: 'Teléfono', style: 'label' },
          { text: cliente.telefono, style: 'value' },
        ],
      })
    if (cliente.email)
      row2.push({
        width: '*',
        stack: [
          { text: 'Email', style: 'label' },
          { text: cliente.email, style: 'value' },
        ],
      })
    if (row2.length) contentData.push({ columns: row2, columnGap: 8, margin: [0, 4, 0, 0] })

    // Dirección
    const hasDirInfo = d.calle || d.numero || d.barrio || d.apartamento || d.referenciasAdicionales
    if (hasDirInfo) {
      contentData.push({
        canvas: [{ type: 'line', x1: 0, y1: 2, x2: 207, y2: 2, lineWidth: 0.5, lineColor: '#cccccc' }],
        margin: [0, 4, 0, 4],
      })

      const row3: any[] = []
      if (d.calle)
        row3.push({
          width: '*',
          stack: [
            { text: 'Calle/Ave.', style: 'label' },
            { text: d.calle, style: 'value' },
          ],
        })
      if (d.numero)
        row3.push({
          width: '*',
          stack: [
            { text: 'Número', style: 'label' },
            { text: d.numero, style: 'value' },
          ],
        })
      if (row3.length) contentData.push({ columns: row3, columnGap: 8, margin: [0, 0, 0, 2] })

      const row4: any[] = []
      if (d.barrio)
        row4.push({
          width: '*',
          stack: [
            { text: 'Zona/Barrio', style: 'label' },
            { text: d.barrio, style: 'value' },
          ],
        })
      if (d.apartamento)
        row4.push({
          width: '*',
          stack: [
            { text: 'Apto.', style: 'label' },
            { text: d.apartamento, style: 'value' },
          ],
        })
      if (row4.length) contentData.push({ columns: row4, columnGap: 8, margin: [0, 0, 0, 2] })

      if (d.referenciasAdicionales)
        contentData.push({
          stack: [
            { text: 'Referencias', style: 'label' },
            { text: d.referenciasAdicionales, style: 'value' },
          ],
          margin: [0, 0, 0, 2],
        })
    }

    // Delivery PedidosYa
    if (
      tipoPedidoLocal === TIPO_PEDIDO.DELIVERY &&
      metodoDelivery === 'PEDIDOS_YA' &&
      (codigoOrdenApp || nombreRepartidor)
    ) {
      contentData.push({
        canvas: [{ type: 'line', x1: 0, y1: 2, x2: 207, y2: 2, lineWidth: 0.5, lineColor: '#cccccc' }],
        margin: [0, 4, 0, 4],
      })
      const rowEnt: any[] = []
      if (codigoOrdenApp)
        rowEnt.push({
          width: '*',
          stack: [
            { text: 'Orden (App)', style: 'label' },
            { text: codigoOrdenApp, style: 'value' },
          ],
        })
      if (nombreRepartidor)
        rowEnt.push({
          width: '*',
          stack: [
            { text: 'Repartidor', style: 'label' },
            { text: nombreRepartidor, style: 'value' },
          ],
        })
      if (rowEnt.length) contentData.push({ columns: rowEnt, columnGap: 8 })
    }

    const pdfDefinition = {
      pageSize: { width: 227, height: 'auto' },
      pageMargins: [10, 10, 10, 10],
      content: contentData,
      styles: {
        header: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
        label: { fontSize: 8, bold: true, color: '#555555' },
        value: { fontSize: 9 },
      },
      defaultStyle: { fontSize: 9 },
    }

    swalLoading('Generando PDF...')
    const blob = await pdfMake.createPdf(pdfDefinition as any).getBlob()
    swalClose()
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(URL.createObjectURL(blob))
  }

  // Sincronizar al abrir (incluye datos de delivery previos)
  useEffect(() => {
    if (open) {
      setTipoPedidoLocal(tipoPedido) // restaurar tipo al valor guardado del padre
      setCliente(opcionesLlevar?.cliente || null)
      setHoraRecojo(opcionesLlevar?.horaRecojo || '')
      setSolicitarUtensilios(opcionesLlevar?.solicitarUtensilios || false)
      setMetodoDelivery(opcionesLlevar?.metodoDelivery || 'PROPIO')
      setCodigoOrdenApp(opcionesLlevar?.codigoOrdenApp || '')
      setNombreRepartidor(opcionesLlevar?.nombreRepartidor || '')
    }
  }, [open, opcionesLlevar, tipoPedido])

  // Parsear dirección cuando cambia el cliente
  useEffect(() => {
    if (cliente && cliente.codigoCliente !== '00') {
      setDireccionLocal(parseDireccion(cliente.direccion))
    } else {
      setDireccionLocal(DIRECCION_EMPTY)
    }
  }, [cliente])

  const setDireccionField = (field: keyof DireccionLocal, val: string) =>
    setDireccionLocal((prev) => ({ ...prev, [field]: val }))

  // ── Guardar cliente (crear o actualizar) con dirección ──
  const saveClienteConDireccion = async (): Promise<ClientProps | null> => {
    if (!cliente || cliente.codigoCliente === '00') return cliente

    const dirOriginal = parseDireccion(cliente.direccion)
    const direccionCambio = hasDireccionChanged(direccionLocal, dirOriginal)
    const huboCambios = editableCliente != null || direccionCambio
    if (!huboCambios) return cliente

    const direccionJson = serializeDireccion(direccionLocal)
    const base = editableCliente ?? buildClienteApiBase(cliente)
    const payload: ClientApiInputProps = { ...base, direccion: direccionJson }

    if (cliente._id === 'NEW') {
      const resp = await registerClient(payload)
      return resp as unknown as ClientProps
    } else {
      await updateClient(cliente._id, payload)
      return { ...cliente, ...payload, direccion: direccionJson }
    }
  }

  // ── Handler principal ── propaga al padre solo al guardar ──
  const handleGuardar = async () => {
    if (tipoPedidoLocal === TIPO_PEDIDO.SALON) {
      setTipoPedido(tipoPedidoLocal) // propagar cambio al padre
      onClose()
      return
    }

    if (tipoPedidoLocal === TIPO_PEDIDO.LLEVAR) {
      if (cliente && cliente.codigoCliente !== '00') {
        try {
          swalLoading('Guardando cliente...')
          const clienteGuardado = await saveClienteConDireccion()
          swalClose()
          setOpcionesLlevar({ cliente: clienteGuardado, horaRecojo, solicitarUtensilios })
        } catch (e: any) {
          swalClose()
          swalException(e)
          return
        }
      } else {
        setOpcionesLlevar({ cliente, horaRecojo, solicitarUtensilios })
      }
    }

    if (tipoPedidoLocal === TIPO_PEDIDO.DELIVERY) {
      const deliveryExtra = { metodoDelivery, codigoOrdenApp, nombreRepartidor }
      if (metodoDelivery === 'PROPIO' && cliente && cliente.codigoCliente !== '00') {
        try {
          swalLoading('Guardando cliente...')
          const clienteGuardado = await saveClienteConDireccion()
          swalClose()
          setOpcionesLlevar({ cliente: clienteGuardado, horaRecojo, solicitarUtensilios, ...deliveryExtra })
        } catch (e: any) {
          swalClose()
          swalException(e)
          return
        }
      } else {
        setOpcionesLlevar({ cliente, horaRecojo, solicitarUtensilios, ...deliveryExtra })
      }
    }

    setTipoPedido(tipoPedidoLocal) // propagar tipo al padre solo al guardar
    onClose()
  }

  // ── Tarjeta de selección de tipo de pedido ──
  const OptionCard = ({ tipo, titulo, Icon }: { tipo: TipoPedido; titulo: string; Icon: any }) => {
    const isSelected = tipoPedidoLocal === tipo
    return (
      <Paper
        variant="outlined"
        onClick={() => setTipoPedidoLocal(tipo)}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: 3,
          borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
          backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
          color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: isSelected
              ? alpha(theme.palette.primary.main, 0.08)
              : alpha(theme.palette.action.hover, 0.1),
          },
        }}
      >
        <Icon sx={{ fontSize: 32, mb: 1, color: 'inherit' }} />
        <Typography variant="body2" fontWeight="700" color="inherit">
          {titulo}
        </Typography>
      </Paper>
    )
  }

  // ── Helper estado mesa ──
  const getEstadoTexto = () => {
    if (!mesaSeleccionada) return 'Sin seleccionar'
    if (mesaSeleccionada.estado === ESTADO_MESA.LIBRE) return 'Libre'
    if (
      mesaSeleccionada.estado === ESTADO_MESA.OCUPADO ||
      mesaSeleccionada.estado === ESTADO_MESA.OCUPADO_OTRO
    )
      return 'Ocupado (con orden)'
    return mesaSeleccionada.estado
  }

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick') return
        onClose()
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Detalles de la Orden
          {cliente && cliente.codigoCliente !== '00' && (
            <IconButton
              size="small"
              color="primary"
              onClick={handleImprimirCliente}
              title="Imprimir Cliente"
              sx={{ ml: 0.5 }}
            >
              <PrintIcon fontSize="small" />
            </IconButton>
          )}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Selector tipo de pedido */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 4 }}>
            <OptionCard tipo={TIPO_PEDIDO.SALON} titulo="Salón" Icon={StorefrontOutlinedIcon} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <OptionCard tipo={TIPO_PEDIDO.LLEVAR} titulo="Para Llevar" Icon={LocalMallOutlinedIcon} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <OptionCard tipo={TIPO_PEDIDO.DELIVERY} titulo="Delivery" Icon={DeliveryDiningOutlinedIcon} />
          </Grid>
        </Grid>

        {/* ── SALÓN ── */}
        {tipoPedidoLocal === TIPO_PEDIDO.SALON &&
          (() => {
            const getAreaUbicacion = (): string => {
              if (mesaSeleccionada?.pedido?.mesa?.ubicacion) {
                return mesaSeleccionada.pedido.mesa.ubicacion
              }
              try {
                const cached = localStorage.getItem('ubicacion')
                if (cached) return JSON.parse(cached)?.descripcion || 'Principal'
              } catch {
                /* ignorar */
              }
              return 'Principal'
            }

            return (
              <Stack spacing={2}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
                  Información de Mesa
                </Typography>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Nombre
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {mesaSeleccionada?.label || 'Ninguna'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Estado
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {getEstadoTexto()}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Área / Ubicación
                      </Typography>
                      <Chip
                        label={getAreaUbicacion()}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Cliente en Mesa
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {mesaSeleccionada?.pedido?.cliente?.razonSocial || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            )
          })()}

        {/* ── PARA LLEVAR ── */}
        {tipoPedidoLocal === TIPO_PEDIDO.LLEVAR && (
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
              Datos del Cliente
            </Typography>
            <ClienteDireccionPanel
              cliente={cliente}
              onClienteChange={setCliente}
              onEditableClienteChange={setEditableCliente}
              direccionLocal={direccionLocal}
              onDireccionFieldChange={setDireccionField}
            />
            <FormTextField
              label="Hora de recojo aproximado"
              type="time"
              value={horaRecojo}
              onChange={(e) => setHoraRecojo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={solicitarUtensilios}
                  onChange={(e) => setSolicitarUtensilios(e.target.checked)}
                  color="primary"
                />
              }
              label="Solicitar utensilios y/o servilletas"
            />
          </Stack>
        )}

        {/* ── DELIVERY ── */}
        {tipoPedidoLocal === TIPO_PEDIDO.DELIVERY && (
          <Stack spacing={2.5}>
            {/* Selector de método */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                textTransform="uppercase"
                sx={{ display: 'block', mb: 1 }}
              >
                Método de Envío
              </Typography>
              <ButtonGroup fullWidth variant="outlined" size="medium">
                <Button
                  onClick={() => setMetodoDelivery('PROPIO')}
                  variant={metodoDelivery === 'PROPIO' ? 'contained' : 'outlined'}
                  sx={{ fontWeight: 700, borderRadius: '8px 0 0 8px' }}
                >
                  Propio
                </Button>
                <Button
                  onClick={() => setMetodoDelivery('PEDIDOS_YA')}
                  variant={metodoDelivery === 'PEDIDOS_YA' ? 'contained' : 'outlined'}
                  sx={{ fontWeight: 700, borderRadius: '0 8px 8px 0' }}
                >
                  PedidosYa
                </Button>
              </ButtonGroup>
            </Box>

            <Divider />

            {/* PROPIO: reutiliza el mismo panel de LLEVAR */}
            {metodoDelivery === 'PROPIO' && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
                  Datos del Cliente
                </Typography>
                <ClienteDireccionPanel
                  cliente={cliente}
                  onClienteChange={setCliente}
                  onEditableClienteChange={setEditableCliente}
                  direccionLocal={direccionLocal}
                  onDireccionFieldChange={setDireccionField}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={solicitarUtensilios}
                      onChange={(e) => setSolicitarUtensilios(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Solicitar utensilios y/o servilletas"
                />
              </Stack>
            )}

            {/* PEDIDOS YA: campos específicos de la plataforma */}
            {metodoDelivery === 'PEDIDOS_YA' && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
                  Información de Entrega
                </Typography>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      textTransform="uppercase"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      Código de Orden (App)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ej. #A4F9"
                      value={codigoOrdenApp}
                      onChange={(e) => setCodigoOrdenApp(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      textTransform="uppercase"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      Nombre del Repartidor
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Quien retira..."
                      value={nombreRepartidor}
                      onChange={(e) => setNombreRepartidor(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ borderRadius: 8, textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 4, boxShadow: 'none' }}
        >
          Guardar Detalles
        </Button>
      </DialogActions>

      <PdfViewerDialog open={!!pdfUrl} pdfUrl={pdfUrl || ''} onClose={() => setPdfUrl(null)} />
    </Dialog>
  )
}

export default RrOpciones
