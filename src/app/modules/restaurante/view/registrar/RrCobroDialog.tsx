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
  CircularProgress,
  Dialog,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'

import { useMetodosPago } from '../../queries/useMetodosPago'
import { MetodoPago } from '../../types'

export interface PagoRealizado {
  id: string
  metodoId: number
  metodoNombre: string
  monto: number
}

export interface RrCobroDialogProps {
  open: boolean
  onClose: () => void
  totalAPagar: number
  pagosRealizados?: PagoRealizado[]
  onAddPago?: (metodoId: number, metodoNombre: string, monto: number) => void
  onRemovePago?: (id: string) => void
  onFinalizar?: () => void
  onFacturar?: () => void
}

const formatPrice = (value: number): string => `BOB ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const RrCobroDialog: FunctionComponent<RrCobroDialogProps> = ({
  open,
  onClose,
  totalAPagar = 0,
  pagosRealizados = [],
  onAddPago,
  onRemovePago,
  onFinalizar,
  onFacturar,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const { data: metodosData, isLoading: metodosLoading } = useMetodosPago({})
  const metodosPago = useMemo(() => metodosData || [], [metodosData])

  const [metodoSeleccionado, setMetodoSeleccionado] = useState<number | null>(null)
  const [metodoSeleccionadoObj, setMetodoSeleccionadoObj] = useState<MetodoPago | null>(null)

  useEffect(() => {
    if (metodosPago.length > 0 && !metodoSeleccionado) {
      setMetodoSeleccionado(metodosPago[0].codigoClasificador ?? null)
      setMetodoSeleccionadoObj(metodosPago[0])
    }
  }, [metodosPago, metodoSeleccionado])

  const [montoIngresado, setMontoIngresado] = useState<string>('0')

  const totalPagado = pagosRealizados.reduce((acc, p) => acc + p.monto, 0)
  const restante = Math.max(0, totalAPagar - totalPagado)
  const vuelto = Math.max(0, totalPagado - totalAPagar)

  const handleMetodoClick = (metodo: MetodoPago) => {
    if (metodo.codigoClasificador) setMetodoSeleccionado(metodo.codigoClasificador)
    setMetodoSeleccionadoObj(metodo)
  }

  const handleTeclado = (valor: string) => {
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
    const monto = parseFloat(montoIngresado)
    if (monto > 0 && onAddPago && metodoSeleccionado && metodoSeleccionadoObj) {
      onAddPago(metodoSeleccionado, metodoSeleccionadoObj.descripcion || 'Pago', monto)
      setMontoIngresado('0')
    }
  }

  const iconPorMetodo = (nombre: string = '') => {
    const n = nombre.toLowerCase()
    if (n.includes('efectivo') || n.includes('cash')) return <MoneyOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} />
    if (n.includes('tarjeta') || n.includes('debito') || n.includes('credito')) return <CreditCardOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} />
    if (n.includes('qr')) return <QrCode2OutlinedIcon fontSize="small" sx={{ color: 'inherit' }} />
    if (n.includes('transferencia') || n.includes('bancaria')) return <SyncAltOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} />
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
    const nombreDisplay = formateaNombreMetodo(metodo.descripcion)
    
    return (
      <Button
        variant="outlined"
        onClick={() => handleMetodoClick(metodo)}
        title={metodo.descripcion} // Para ver el nombre completo al hacer hover
        sx={{
          flex: '1 1 auto',
          maxWidth: 140,
          flexDirection: 'column',
          p: 2,
          minWidth: 90,
          borderRadius: 3,
          textTransform: 'none',
          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
          borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
          color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
          '&:hover': {
            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.18) : theme.palette.action.hover,
            borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
          },
        }}
      >
        {iconPorMetodo(metodo.descripcion)}
        <Typography variant="caption" sx={{ mt: 1, fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.05em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', textAlign: 'center' }}>
          {nombreDisplay.toUpperCase()}
        </Typography>
      </Button>
    )
  }

  const PadButton = ({ valor, label, variant = 'default' }: any) => {
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
          if (valor === 'agregar') handleAgregarPago()
          else handleTeclado(valor)
        }}
        disabled={valor === 'agregar' && parseFloat(montoIngresado || '0') <= 0}
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
          }
        }}
      >
        {label || valor}
      </Button>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PaymentsOutlinedIcon sx={{ color: theme.palette.success.main, fontSize: 28, mr: 1 }} />
          <Typography variant="h6" fontWeight={800} sx={{ color: theme.palette.text.primary }}>
            Cobro
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.1em', mb: 0.5 }}>
          TOTAL A PAGAR
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.text.primary, mb: 3 }}>
          {formatPrice(totalAPagar)}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.1em', mb: 1.5 }}>
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
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, flex: 1 }}>
                {formateaNombreMetodo(pago.metodoNombre)}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.text.primary, mr: 1.5 }}>
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

        <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.1em', mb: 0.5 }}>
          RESTANTE
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? alpha(theme.palette.text.primary, 0.4) : '#cbd5e1', mb: 3 }}>
          {formatPrice(restante)}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.1em', mb: 0.5 }}>
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
            sx={{ bgcolor: theme.palette.action.hover, '&:hover': { bgcolor: alpha(theme.palette.action.active, 0.1) } }}
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
          <PadButton valor="1" />
          <PadButton valor="2" />
          <PadButton valor="3" />
          <PadButton valor="clear" label={formatPrice(parseFloat(montoIngresado || '0'))} variant="gray" />
          
          {/* Row 2 */}
          <PadButton valor="4" />
          <PadButton valor="5" />
          <PadButton valor="6" />
          <PadButton valor="backspace" label={<BackspaceOutlinedIcon />} variant="gray" />

          {/* Row 3 */}
          <PadButton valor="7" />
          <PadButton valor="8" />
          <PadButton valor="9" />
          <PadButton valor="exacto" label="Exacto" variant="purple" />

          {/* Row 4 */}
          <PadButton valor="0" />
          <PadButton valor="00" />
          <PadButton valor="." />
          <PadButton 
            valor="agregar" 
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 300 }}>+</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Agregar</Typography>
              </Box>
            } 
            variant="green" 
          />
        </Box>

        {/* Added dynamic showing of the actual inputted amount inside an imaginary box just for user reference (optional, not strictly in image, wait image doesn't show inputted amount explicitly, it just shows keypads). Wait, the user prompt just asks to replicate the image. The input amount isn't shown in the image except maybe we assume the keypad triggers the Add directly or requires "Agregar"? Yes "Agregar" adds it. Wait, does the image show the current inputted amount? The image doesn't have an input field! It just has the keys. The user just types and clicks exactly or "Agregar". If they type, where does the text go?
        Actually looking at the image: 1 2 3 $0.00. The $0.00 is a button, maybe it acts as displaying the current typed amount! In the screenshot it says "$0.00" on a grey background. If they type "14", it probably changes to "$14.00".
        Let's test this assumption. We can make the top right button of the keypad display the `montoIngresado`.
        In my code, `PadButton valor="clear" label="$0.00"`.
        I'll update the label to be `formatPrice(parseFloat(montoIngresado || "0"))`.
        */}

        {/* Footer Buttons */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onFinalizar}
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
            Finalizar (Ticket)
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={onFacturar}
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
  )
}

export default RrCobroDialog
