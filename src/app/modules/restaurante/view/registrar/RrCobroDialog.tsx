import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined'
import CloseIcon from '@mui/icons-material/Close'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import MoneyOutlinedIcon from '@mui/icons-material/MoneyOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined'
import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { AnimatePresence, motion } from 'framer-motion'
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react'

import MontoMonedaTexto from '../../../../base/components/PopoverMonto/MontoMonedaTexto'
import { useMetodosPago } from '../../queries/useMetodosPago'
import { MetodoPago } from '../../types'

export interface PagoRealizado {
  id: string
  metodoId: number
  metodoNombre: string
  monto: number
  numeroTarjeta?: string
}

export interface RrCobroDialogProps {
  open: boolean
  onClose: () => void
  isProcessing?: boolean
  subtotal?: number
  descuento?: number
  giftcard?: number
  onDescuentoChange?: (val: number) => void
  onGiftcardChange?: (val: number) => void
  totalAPagar: number
  pagosRealizados?: PagoRealizado[]
  onAddPago?: (metodoId: number, metodoNombre: string, monto: number, numeroTarjeta?: string) => void
  onRemovePago?: (id: string) => void
  onFinalizar?: (metodoDefectoId?: number, metodoDefectoNombre?: string, numeroTarjeta?: string) => void
  onFacturar?: (metodoDefectoId?: number, metodoDefectoNombre?: string, numeroTarjeta?: string) => void
  /** Texto informativo del cliente, solo se muestra si no es el cliente 00 */
  clienteInfo?: string
}

const formatPrice = (value: number): string =>
  `BOB ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const RrCobroDialog: FunctionComponent<RrCobroDialogProps> = ({
  open,
  onClose,
  isProcessing = false,
  subtotal = 0,
  descuento = 0,
  giftcard = 0,
  onDescuentoChange,
  onGiftcardChange,
  totalAPagar = 0,
  pagosRealizados = [],
  onAddPago,
  onRemovePago,
  onFinalizar,
  onFacturar,
  clienteInfo,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const { data: metodosData, isLoading: metodosLoading } = useMetodosPago({})
  const metodosPago = useMemo(() => metodosData || [], [metodosData])

  const [metodoSeleccionado, setMetodoSeleccionado] = useState<number | null>(null)
  const [metodoSeleccionadoObj, setMetodoSeleccionadoObj] = useState<MetodoPago | null>(null)
  const [facturaTarjetaOpen, setFacturaTarjetaOpen] = useState<boolean>(false)
  const [numeroTarjetaFacturar, setNumeroTarjetaFacturar] = useState<string>('')

  useEffect(() => {
    if (metodosPago.length > 0 && !metodoSeleccionado) {
      setMetodoSeleccionado(metodosPago[0].codigoClasificador ?? null)
      setMetodoSeleccionadoObj(metodosPago[0])
    }
  }, [metodosPago, metodoSeleccionado])

  useEffect(() => {
    if (open && metodosPago.length > 0) {
      setMetodoSeleccionado(metodosPago[0].codigoClasificador ?? null)
      setMetodoSeleccionadoObj(metodosPago[0])
    }
  }, [open, metodosPago])

  // Si tenemos subtotal, calculamos el total dinámicamente para que se actualice
  // en tiempo real al modificar descuento/giftcard desde el propio diálogo.
  const totalCalculado = subtotal > 0 ? Math.max(0, subtotal - descuento - giftcard) : totalAPagar

  const [montoIngresado, setMontoIngresado] = useState<string>('0')

  const totalPagado = pagosRealizados.reduce((acc, p) => acc + p.monto, 0)
  const restante = Math.max(0, totalCalculado - totalPagado)
  const vuelto = Math.max(0, totalPagado - totalCalculado)

  const handleMetodoClick = (metodo: MetodoPago) => {
    if (isProcessing) return
    if (metodo.codigoClasificador) setMetodoSeleccionado(metodo.codigoClasificador)
    setMetodoSeleccionadoObj(metodo)
  }

  const handleTeclado = (valor: string) => {
    if (isProcessing) return
    if (valor === 'clear') {
      setMontoIngresado('0')
    } else if (valor === 'backspace') {
      setMontoIngresado((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'))
    } else if (valor === 'exacto') {
      setMontoIngresado(restante.toString())
    } else if (valor === '.') {
      setMontoIngresado((prev) => {
        if (!prev.includes('.')) {
          return prev + '.'
        }
        return prev
      })
    } else {
      setMontoIngresado((prev) => {
        const nextValue = prev === '0' && valor !== '00' ? valor : prev + valor

        // Evitar montos absurdamente gigantes
        if (parseFloat(nextValue) > 999999) return prev

        // Evitar más de 2 decimales
        if (nextValue.includes('.') && nextValue.split('.')[1].length > 2) return prev

        return nextValue
      })
    }
  }

  const handleAgregarPago = () => {
    if (isProcessing) return
    const monto = parseFloat(montoIngresado)
    if (monto > 0 && onAddPago && metodoSeleccionado && metodoSeleccionadoObj) {
      onAddPago(metodoSeleccionado, metodoSeleccionadoObj.descripcion || 'Pago', monto)
      setMontoIngresado('0')
    }
  }

  const generarNumeroTarjetaAleatorio = () =>
    Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('')

  const ejecutarFacturacion = (numeroTarjeta?: string) => {
    if (onFacturar) {
      onFacturar(metodoSeleccionado || 1, metodoSeleccionadoObj?.descripcion || 'Efectivo', numeroTarjeta)
    }
  }

  const handleFacturarClick = () => {
    if (isProcessing) return
    if (metodoSeleccionado === 2) {
      setFacturaTarjetaOpen(true)
      return
    }
    ejecutarFacturacion()
  }

  const handleConfirmarFacturacionConTarjeta = () => {
    if (isProcessing) return
    ejecutarFacturacion(numeroTarjetaFacturar)
    setFacturaTarjetaOpen(false)
    setNumeroTarjetaFacturar('')
  }

  const handleCancelarTarjetaDialog = () => {
    if (isProcessing) return
    setFacturaTarjetaOpen(false)
    setNumeroTarjetaFacturar('')
  }

  const handleGenerarTarjeta = () => {
    if (isProcessing) return
    setNumeroTarjetaFacturar(generarNumeroTarjetaAleatorio())
  }

  const handleTecladoTarjeta = (valor: string) => {
    if (isProcessing) return
    if (valor === 'clear') {
      setNumeroTarjetaFacturar('')
      return
    }

    if (valor === 'backspace') {
      setNumeroTarjetaFacturar((prev) => prev.slice(0, -1))
      return
    }

    setNumeroTarjetaFacturar((prev) => {
      if (prev.length >= 8) return prev
      return `${prev}${valor}`
    })
  }

  const iconPorMetodo = (nombre: string = '') => {
    const n = nombre.toLowerCase()
    if (n.includes('efectivo') || n.includes('cash'))
      return <MoneyOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} />
    if (n.includes('tarjeta') || n.includes('debito') || n.includes('credito'))
      return <CreditCardOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} />
    if (n.includes('qr')) return <QrCode2OutlinedIcon fontSize="small" sx={{ color: 'inherit' }} />
    if (n.includes('transferencia') || n.includes('bancaria'))
      return <SyncAltOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} />
    return <StorefrontOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} />
  }

  const formateaNombreMetodo = (nombre: string = '') => {
    if (nombre.length > 14) {
      return nombre.substring(0, 14).trim() + '...'
    }
    return nombre
  }

  const MetodoButton = ({ metodo }: { metodo: MetodoPago }) => {
    const isSelected = metodoSeleccionado === metodo.codigoClasificador
    const nombreDisplay = formateaNombreMetodo(metodo.descripcion || '')
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleTooltipOpen = () => {
      setTooltipOpen(true)
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
      tooltipTimer.current = setTimeout(() => setTooltipOpen(false), 2000)
    }

    const handleTooltipClose = () => {
      setTooltipOpen(false)
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    }

    return (
      <Tooltip
        title={metodo.descripcion || ''}
        open={tooltipOpen}
        onClose={handleTooltipClose}
        onOpen={handleTooltipOpen}
        disableHoverListener={false}
        disableFocusListener
        disableTouchListener={false}
        PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, -4] } }] }}
        componentsProps={{ tooltip: { sx: { fontSize: '0.75rem' } } }}
      >
        <ButtonBase
          onClick={() => handleMetodoClick(metodo)}
          sx={{
            flex: '1 1 auto',
            maxWidth: 140,
            minWidth: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            p: 2,
            borderRadius: 3,
            border: '1px solid',
            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
            color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
            transition: 'background-color 0.2s, border-color 0.2s',
            '&:hover': {
              bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.18) : theme.palette.action.hover,
              borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
            },
          }}
        >
          {iconPorMetodo(metodo.descripcion)}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: '0.65rem',
              lineHeight: 1.2,
              letterSpacing: '0.02em',
              textAlign: 'center',
              color: 'inherit',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              maxWidth: '100%',
            }}
          >
            {nombreDisplay.toUpperCase()}
          </Typography>
        </ButtonBase>
      </Tooltip>
    )
  }

  const PadButton = ({ valor, label, variant = 'default', onPress, disabled }: any) => {
    let bgcolor = theme.palette.background.paper
    let color = theme.palette.text.primary
    let borderColor = theme.palette.divider
    let hoverBgColor = isDark ? alpha(theme.palette.text.primary, 0.08) : '#f1f5f9'

    if (variant === 'gray') {
      bgcolor = isDark ? alpha(theme.palette.action.disabledBackground, 0.5) : '#f8fafc'
      color = theme.palette.text.secondary
    } else if (variant === 'purple') {
      bgcolor = alpha(theme.palette.primary.main, 0.1)
      color = theme.palette.primary.main
      borderColor = 'transparent'
      hoverBgColor = alpha(theme.palette.primary.main, 0.18)
    } else if (variant === 'green') {
      bgcolor = '#4ade80' // Using an explicit green slightly vibrant for both modes if wanted, but lets use success
      bgcolor = theme.palette.success.main
      color = theme.palette.success.contrastText
      borderColor = 'transparent'
      hoverBgColor = theme.palette.success.dark
    }

    return (
      <Button
        fullWidth
        variant="outlined"
        onClick={() => {
          if (onPress) {
            onPress(valor)
            return
          }

          if (valor === 'agregar') handleAgregarPago()
          else handleTeclado(valor)
        }}
        disabled={disabled ?? (valor === 'agregar' && parseFloat(montoIngresado || '0') <= 0)}
        sx={{
          height: 64,
          borderRadius: 3,
          bgcolor,
          color,
          borderColor,
          fontSize: '1.25rem',
          fontWeight: 700,
          textTransform: 'none',
          '&:hover': {
            bgcolor: hoverBgColor,
            borderColor,
          },
          '&.Mui-disabled': {
            bgcolor: variant === 'green' ? alpha(theme.palette.success.main, 0.5) : undefined,
            color: variant === 'green' ? theme.palette.success.contrastText : undefined,
          },
        }}
      >
        {label || valor}
      </Button>
    )
  }

  const handleMainDialogClose = (_event: object, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (isProcessing) return
    if (reason === 'backdropClick') return
    onClose()
  }

  const handleTarjetaDialogClose = (_event: object, reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (isProcessing) return
    if (reason === 'backdropClick') return
    handleCancelarTarjetaDialog()
  }

  // console.log('ClienteInfo:', clienteInfo)

  return (
    <>
      <Dialog
        open={open}
        onClose={handleMainDialogClose}
        disableEscapeKeyDown={isProcessing}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            sx: { backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            height: 'auto',
            maxHeight: '90vh',
            minHeight: 550,
          },
        }}
      >
        {/* ── Left Panel: Summary ── */}
        <Box
          sx={{
            width: { xs: 0, sm: '35%' },
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            flexShrink: 0,
            bgcolor: isDark ? alpha(theme.palette.background.default, 0.5) : '#f8fafc',
            borderRight: '1px solid',
            borderColor: 'divider',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: clienteInfo ? 0.5 : 3 }}>
            <PaymentsOutlinedIcon sx={{ color: theme.palette.success.main, fontSize: 28, mr: 1 }} />
            <Typography variant="h6" fontWeight={800} sx={{ color: theme.palette.text.primary }}>
              Cobro
            </Typography>
          </Box>
          {clienteInfo && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                mb: 3,
                px: 1,
                py: 0.75,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                color="primary.main"
                sx={{ letterSpacing: '0.02em' }}
              >
                {clienteInfo}
              </Typography>
            </Box>
          )}

          {/* Subtotal, Descuento, GiftCard */}
          {subtotal > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                  Subtotal
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                  {formatPrice(subtotal)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                  Descuento
                </Typography>
                <MontoMonedaTexto
                  monto={descuento}
                  editar={!isProcessing}
                  onChange={(val) => onDescuentoChange?.(val || 0)}
                  sigla="BOB"
                  montoProps={{ sx: { color: 'error.main', fontWeight: 600, fontSize: '0.875rem' } }}
                  siglaProps={{ sx: { color: 'error.main', fontSize: '0.75rem' } }}
                  buttonProps={{ sx: { color: 'error.main', py: 0, minHeight: 0 } }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                  GiftCard
                </Typography>
                <MontoMonedaTexto
                  monto={giftcard}
                  editar={!isProcessing}
                  onChange={(val) => onGiftcardChange?.(val || 0)}
                  sigla="BOB"
                  montoProps={{ sx: { color: 'error.main', fontWeight: 600, fontSize: '0.875rem' } }}
                  siglaProps={{ sx: { color: 'error.main', fontSize: '0.75rem' } }}
                  buttonProps={{ sx: { color: 'error.main', py: 0, minHeight: 0 } }}
                />
              </Box>
              <Divider sx={{ mb: 1.5 }} />
            </>
          )}

          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.1em', mb: 0.5 }}
          >
            TOTAL A PAGAR
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.text.primary, mb: 3 }}>
            {formatPrice(totalCalculado)}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.1em', mb: 1.5 }}
          >
            PAGOS REALIZADOS
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, flex: 1 }}>
            {pagosRealizados.map((pago) => (
              <Box
                key={pago.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: theme.palette.background.paper,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Box sx={{ color: theme.palette.text.secondary, display: 'flex', mr: 1.5 }}>
                  {iconPorMetodo(pago.metodoNombre)}
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: theme.palette.text.primary, flex: 1 }}
                >
                  {formateaNombreMetodo(pago.metodoNombre)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 800, color: theme.palette.text.primary, mr: 1.5 }}
                >
                  {formatPrice(pago.monto)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onRemovePago && onRemovePago(pago.id)}
                  sx={{ color: theme.palette.error.main, p: 0.25 }}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            {pagosRealizados.length === 0 && (
              <Typography variant="body2" sx={{ color: theme.palette.text.disabled, fontStyle: 'italic' }}>
                No hay pagos.
              </Typography>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.1em', mb: 0.5 }}
          >
            RESTANTE
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: isDark ? alpha(theme.palette.text.primary, 0.4) : '#cbd5e1',
              mb: 3,
            }}
          >
            {formatPrice(restante)}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.1em', mb: 0.5 }}
          >
            CAMBIO (VUELTO)
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.success.main }}>
            {formatPrice(vuelto)}
          </Typography>
        </Box>

        {/* ── Right Panel: Input ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 3,
            overflow: 'hidden',
            bgcolor: theme.palette.background.paper,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              Agregar Pago
            </Typography>
            <IconButton
              onClick={onClose}
              disabled={isProcessing}
              sx={{
                bgcolor: theme.palette.action.hover,
                '&:hover': { bgcolor: alpha(theme.palette.action.active, 0.1) },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          {/* Payment Methods */}
          <Box sx={{ mb: 3 }}>
            {metodosLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {metodosPago.map((m) => (
                  <MetodoButton key={m.codigoClasificador} metodo={m} />
                ))}
              </Box>
            )}
          </Box>
          {/* Keypad */}
          <Box sx={{ mb: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
            {/* Row 1 */}
            <PadButton valor="1" disabled={isProcessing} />
            <PadButton valor="2" disabled={isProcessing} />
            <PadButton valor="3" disabled={isProcessing} />
            <PadButton
              valor="clear"
              label={formatPrice(parseFloat(montoIngresado || '0'))}
              variant="gray"
              disabled={isProcessing}
            />

            {/* Row 2 */}
            <PadButton valor="4" disabled={isProcessing} />
            <PadButton valor="5" disabled={isProcessing} />
            <PadButton valor="6" disabled={isProcessing} />
            <PadButton
              valor="backspace"
              label={<BackspaceOutlinedIcon />}
              variant="gray"
              disabled={isProcessing}
            />

            {/* Row 3 */}
            <PadButton valor="7" disabled={isProcessing} />
            <PadButton valor="8" disabled={isProcessing} />
            <PadButton valor="9" disabled={isProcessing} />
            <PadButton valor="exacto" label="Exacto" variant="purple" disabled={isProcessing} />

            {/* Row 4 */}
            <PadButton valor="0" disabled={isProcessing} />
            <PadButton valor="00" disabled={isProcessing} />
            <PadButton valor="." disabled={isProcessing} />
            <PadButton
              valor="agregar"
              onClick={handleAgregarPago}
              disabled={isProcessing || parseFloat(montoIngresado || '0') <= 0}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 300 }}>
                    +
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                    Agregar
                  </Typography>
                </Box>
              }
              variant="green"
            />
          </Box>
          {/* Footer Buttons */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                if (onFinalizar)
                  onFinalizar(metodoSeleccionado || 1, metodoSeleccionadoObj?.descripcion || 'Efectivo')
              }}
              disabled={isProcessing}
              fullWidth
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: isDark ? alpha(theme.palette.text.primary, 0.15) : '#1e293b',
                color: isDark ? theme.palette.text.primary : 'white',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { bgcolor: isDark ? alpha(theme.palette.text.primary, 0.25) : '#0f172a' },
              }}
            >
              <ReceiptLongOutlinedIcon sx={{ mr: 1 }} />
              Finalizar
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleFacturarClick}
              disabled={isProcessing}
              fullWidth
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { bgcolor: theme.palette.primary.dark },
              }}
            >
              <RequestQuoteOutlinedIcon sx={{ mr: 1 }} />
              Facturar
            </Button>
          </Stack>
        </Box>
      </Dialog>
      <Dialog
        open={facturaTarjetaOpen}
        onClose={handleTarjetaDialogClose}
        disableEscapeKeyDown={isProcessing}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: {
            sx: { backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' },
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          Tarjeta para facturación
          <IconButton onClick={handleCancelarTarjetaDialog} disabled={isProcessing} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ marginTop: 8, marginBottom: 12 }}
            >
              <Box
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.15),
                  borderRadius: 3,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                    backgroundColor: theme.palette.background.paper,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    borderRadius: 2,
                    boxShadow: 1,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <motion.div
                    initial={{ y: 35 }}
                    animate={{ y: 0 }}
                    transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse', ease: 'easeInOut' }}
                    style={{
                      width: 56,
                      height: 80,
                      backgroundColor: alpha(theme.palette.grey[300], 0.2),
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: theme.shadows[1],
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      paddingTop: 8,
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bottom: 16,
                      zIndex: 0,
                    }}
                  >
                    <Box
                      sx={{ width: 32, height: 4, backgroundColor: 'grey.400', borderRadius: 99, mb: 0.5 }}
                    />
                    <Box
                      sx={{ width: 20, height: 4, backgroundColor: 'grey.400', borderRadius: 99, mb: 1.5 }}
                    />
                    <Box
                      sx={{
                        width: 40,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Box sx={{ width: 12, height: 4, backgroundColor: 'grey.300', borderRadius: 99 }} />
                      <Box sx={{ width: 12, height: 4, backgroundColor: 'grey.300', borderRadius: 99 }} />
                    </Box>
                    <Box
                      sx={{
                        width: 40,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: '0.4rem', color: 'text.secondary', fontFamily: 'monospace' }}
                      >
                        VISA
                      </Typography>
                      <motion.span
                        animate={{
                          scale: [1, 1.1, 1],
                          backgroundColor: ['transparent', '#dbeafe', 'transparent'],
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{
                          fontSize: '0.42rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: theme.palette.primary.main,
                          padding: '0 2px',
                          borderRadius: 3,
                        }}
                      >
                        {numeroTarjetaFacturar ? `*${numeroTarjetaFacturar.slice(-4)}` : '*1234'}
                      </motion.span>
                    </Box>
                    <Box sx={{ width: 40, borderTop: '1px dashed', borderColor: 'grey.400', mt: 1 }} />
                  </motion.div>

                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: 24,
                      backgroundColor: 'grey.900',
                      borderTop: '2px solid',
                      borderTopColor: 'grey.800',
                      display: 'flex',
                      justifyContent: 'center',
                      pt: 0.5,
                      zIndex: 10,
                    }}
                  >
                    <Box sx={{ width: 24, height: 2, backgroundColor: 'grey.700', borderRadius: 99 }} />
                  </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <ReceiptLongOutlinedIcon sx={{ color: 'primary.main', fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: 'primary.dark', fontWeight: 700 }}>
                      Verifica el comprobante
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: 'primary.main', lineHeight: 1.45 }}>
                    Ingresa hasta 8 dígitos o usa Generar para crear un número automático.
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </AnimatePresence>

          <TextField
            autoFocus
            fullWidth
            type="tel"
            label="Número de tarjeta"
            placeholder="Hasta 8 dígitos"
            value={numeroTarjetaFacturar}
            onChange={(e) => setNumeroTarjetaFacturar(e.target.value.replace(/\D/g, '').slice(0, 8))}
            disabled={isProcessing}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 8,
            }}
            helperText="Puedes escribir o generar automáticamente."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleGenerarTarjeta}
                    disabled={isProcessing}
                    sx={{ minWidth: 88, textTransform: 'none' }}
                  >
                    Generar
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{ mt: 1, mb: 1.5 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            <PadButton valor="1" onPress={handleTecladoTarjeta} disabled={isProcessing} />
            <PadButton valor="2" onPress={handleTecladoTarjeta} disabled={isProcessing} />
            <PadButton valor="3" onPress={handleTecladoTarjeta} disabled={isProcessing} />
            <PadButton valor="4" onPress={handleTecladoTarjeta} disabled={isProcessing} />
            <PadButton valor="5" onPress={handleTecladoTarjeta} disabled={isProcessing} />
            <PadButton valor="6" onPress={handleTecladoTarjeta} disabled={isProcessing} />
            <PadButton valor="7" onPress={handleTecladoTarjeta} disabled={isProcessing} />
            <PadButton valor="8" onPress={handleTecladoTarjeta} disabled={isProcessing} />
            <PadButton valor="9" onPress={handleTecladoTarjeta} disabled={isProcessing} />
            <PadButton
              valor="clear"
              label="C"
              variant="gray"
              onPress={handleTecladoTarjeta}
              disabled={isProcessing}
            />
            <PadButton valor="0" onPress={handleTecladoTarjeta} disabled={isProcessing} />
            <PadButton
              valor="backspace"
              label={<BackspaceOutlinedIcon fontSize="small" />}
              variant="gray"
              onPress={handleTecladoTarjeta}
              disabled={isProcessing}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCancelarTarjetaDialog}
            variant="outlined"
            color="inherit"
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarFacturacionConTarjeta}
            variant="contained"
            disabled={isProcessing || numeroTarjetaFacturar.length === 0}
          >
            Facturar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RrCobroDialog
