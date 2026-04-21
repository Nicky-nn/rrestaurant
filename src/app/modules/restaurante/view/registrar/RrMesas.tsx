import { TableRestaurant } from '@mui/icons-material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CloseIcon from '@mui/icons-material/Close'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptIcon from '@mui/icons-material/Receipt'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import dayjs from 'dayjs'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'

import useAuth from '../../../../base/hooks/useAuth'
import { useHorizontalDragScroll } from '../../../../base/hooks/useHorizontalDragScroll'
import { ESTADO_MESA, MesaUI, TIPO_PEDIDO } from '../../interfaces/mesa.interface'

const COLORS = {
  focused: '#FFC107',
  libre: '#BAE1BB',
  libreHover: '#8CCF9B',
  ocupado: '#EF9999',
  ocupadoHover: '#E57373',
  ocupadoOtro: '#F5DEB3',
  ocupadoOtroHover: '#EEBC7B',
  deliveryTag: '#F4E790',
  llevarTag: '#C2F490',
}

interface MesaCardProps {
  mesa: MesaUI
  index: number
  isFocused: boolean
  showAsGrid: boolean
  onClick: (mesa: MesaUI, index: number) => void
  /** Pedido directo de mesaSeleccionada (solo para la tarjeta enfocada).
   *  Permite reflejar cambios de cliente y otros datos locales de inmediato,
   *  sin esperar el refetch del servidor. */
  selectedPedido?: any
  codigoSucursal?: number
}

const areEqual = (prev: MesaCardProps, next: MesaCardProps) => {
  return (
    prev.index === next.index &&
    prev.isFocused === next.isFocused &&
    prev.showAsGrid === next.showAsGrid &&
    prev.mesa.estado === next.mesa.estado &&
    prev.mesa.pedido?._id === next.mesa.pedido?._id &&
    prev.mesa.usuarioOcupante === next.mesa.usuarioOcupante &&
    prev.mesa.value === next.mesa.value &&
    prev.mesa.pedido?.numeroOrden === next.mesa.pedido?.numeroOrden &&
    prev.mesa.pedido?.createdAt === next.mesa.pedido?.createdAt &&
    // Comparar por el cliente del pedido proveniente del servidor
    prev.mesa.pedido?.cliente?.razonSocial === next.mesa.pedido?.cliente?.razonSocial &&
    // Comparar por selectedPedido (estado local) para capturar cambios de cliente
    // que aún no llegaron al refetch del servidor.
    prev.selectedPedido?.cliente?.razonSocial === next.selectedPedido?.cliente?.razonSocial &&
    prev.codigoSucursal === next.codigoSucursal
  )
}

const MesaCard = memo(
  ({ mesa, index, isFocused, showAsGrid, onClick, selectedPedido, codigoSucursal }: MesaCardProps) => {
    const { user } = useAuth()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const estado = mesa.estado
    const usuarioOcupante = mesa.usuarioOcupante

    // Para la tarjeta enfocada usar selectedPedido (estado local más reciente).
    // Para el resto, usar el pedido del options (datos del servidor).
    const pedido = selectedPedido ?? mesa.pedido
    const isClickable = estado !== ESTADO_MESA.OCUPADO_OTRO

    const getBackgroundColor = () => {
      if (isFocused) return isDark ? '#c79100' : COLORS.focused
      if (estado === ESTADO_MESA.LIBRE) return isDark ? 'rgba(76, 175, 80, 0.4)' : '#BAE1BB'
      if (estado === ESTADO_MESA.OCUPADO_OTRO) return isDark ? 'rgba(255, 152, 0, 0.4)' : '#F5DEB3'
      return isDark ? 'rgba(244, 67, 54, 0.4)' : '#EF9999'
    }

    const getHoverColor = () => {
      if (estado === ESTADO_MESA.LIBRE) return isDark ? 'rgba(76, 175, 80, 0.6)' : '#8CCF9B'
      if (estado === ESTADO_MESA.OCUPADO_OTRO) return isDark ? 'rgba(255, 152, 0, 0.6)' : '#EEBC7B'
      return isDark ? 'rgba(244, 67, 54, 0.6)' : '#E57373'
    }

    let formattedTime = '--:--'
    if (pedido?.createdAt) {
      if (dayjs(pedido.createdAt).isValid()) {
        formattedTime = dayjs(pedido.createdAt).format('HH:mm')
      } else if (dayjs(pedido.createdAt, 'DD/MM/YYYY HH:mm:ss').isValid()) {
        formattedTime = dayjs(pedido.createdAt, 'DD/MM/YYYY HH:mm:ss').format('HH:mm')
      }
    }

    return (
      <Card
        sx={{
          width: showAsGrid ? 140 : 120,
          height: showAsGrid ? 90 : 70,
          flexShrink: showAsGrid ? 'initial' : 0,
          cursor: isClickable ? 'pointer' : 'not-allowed',
          opacity: estado === ESTADO_MESA.OCUPADO_OTRO ? 0.7 : 1,
          backgroundColor: getBackgroundColor(),
          border: isDark ? `1px solid ${getHoverColor()}` : '1px solid transparent',
          position: 'relative',
          transition: 'all 0.2s',
          '&:hover': isClickable
            ? {
                backgroundColor: isFocused ? (isDark ? '#e6a800' : COLORS.focused) : getHoverColor(),
                transform: 'translateY(-2px)',
                boxShadow: 2,
              }
            : {},
        }}
        onClick={() => isClickable && onClick(mesa, index)}
      >
        {/* Badges de tipo de pedido */}
        {pedido?.tipo === TIPO_PEDIDO.DELIVERY && (
          <Box
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              backgroundColor: COLORS.deliveryTag,
              borderRadius: '50%',
              p: 0.5,
              zIndex: 2,
            }}
          >
            <DeliveryDiningIcon fontSize="small" />
          </Box>
        )}
        {pedido?.tipo === TIPO_PEDIDO.LLEVAR && (
          <Box
            sx={{
              position: 'absolute',
              top: 2,
              left: estado === ESTADO_MESA.OCUPADO_OTRO ? 60 : 2,
              backgroundColor: COLORS.llevarTag,
              borderRadius: '50%',
              p: 0.5,
              zIndex: 2,
            }}
          >
            <TakeoutDiningIcon fontSize="small" />
          </Box>
        )}

        {/* Marca de agua - Número */}
        <Typography
          variant="h2"
          sx={{
            position: 'absolute',
            bottom: showAsGrid ? -15 : -10,
            left: 5,
            opacity: isDark ? 0.2 : 0.1,
            fontWeight: 'bold',
            fontSize: showAsGrid ? 70 : 60,
            color: isDark ? '#ffffff' : (estado === ESTADO_MESA.LIBRE ? '#006400' : '#7A0000'),
          }}
        >
          {mesa.value}
        </Typography>

        {/* Marca de agua - Icono */}
        <TableRestaurant
          sx={{
            position: 'absolute',
            bottom: showAsGrid ? -8 : -5,
            right: 5,
            opacity: isDark ? 0.2 : 0.1,
            fontSize: showAsGrid ? 55 : 45,
            color: isDark ? '#ffffff' : (estado === ESTADO_MESA.LIBRE ? '#006400' : '#7A0000'),
          }}
        />

        <CardContent sx={{ p: '8px !important', height: '100%', zIndex: 2 }}>
          {pedido && estado === ESTADO_MESA.OCUPADO ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}
                >
                  <ReceiptIcon fontSize="small" sx={{ mr: 0.5 }} />
                  {pedido.numeroOrden}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}
                >
                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                  {formattedTime}
                </Typography>
              </Box>
              {pedido.cliente && (
                <Tooltip title={pedido.cliente.razonSocial} placement="bottom" arrow>
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.8rem',
                    }}
                  >
                    <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {pedido.cliente.razonSocial}
                  </Typography>
                </Tooltip>
              )}
              {usuarioOcupante &&
                (pedido?.usumod || usuarioOcupante).toLowerCase() !== (user?.usuario || '').toLowerCase() && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.65rem',
                      mt: 0.25,
                      color: 'text.secondary',
                      fontWeight: 'bold',
                      lineHeight: 1.2,
                    }}
                  >
                    {pedido?.usumod ? `Mod: ${pedido.usumod}` : `Por: ${usuarioOcupante}`}
                  </Typography>
                )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {estado === ESTADO_MESA.OCUPADO_OTRO ? 'Ocupada' : 'Libre'}
              </Typography>
              {estado === ESTADO_MESA.OCUPADO_OTRO &&
                usuarioOcupante &&
                (pedido?.usumod || usuarioOcupante).toLowerCase() !== (user?.usuario || '').toLowerCase() && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.7rem',
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                    {pedido?.usumod ? `Mod: ${pedido.usumod}` : usuarioOcupante}
                  </Typography>
                )}
            </Box>
          )}
        </CardContent>
      </Card>
    )
  },
  areEqual,
)

interface RrMesasProps {
  isLoading?: boolean
  options?: MesaUI[]
  focusedIndex?: number
  setFocusedIndex?: (index: number) => void
  setSelectedOption?: (option: MesaUI | null) => void
  selectedOption?: MesaUI | null
  codigoSucursal?: number
  showInDialog?: boolean
  dialogOpen?: boolean
  onDialogClose?: () => void
  showAsGrid?: boolean
  dialogTitle?: string
  onManualSelection?: (option: MesaUI) => void
  bgColor?: string
  /** Pedido confirmado (guardado en servidor). Solo se actualiza al hacer click en una
   *  mesa o al guardar/actualizar el pedido. NO cambia con ediciones locales del input. */
  confirmedPedido?: any
}

const RrMesas: React.FC<RrMesasProps> = ({
  isLoading = false,
  options = [],
  focusedIndex = -1,
  setFocusedIndex = () => {},
  setSelectedOption = () => {},
  selectedOption = null,
  showInDialog = false,
  dialogOpen = false,
  onDialogClose,
  showAsGrid = false,
  dialogTitle = 'Seleccionar Mesa',
  onManualSelection,
  bgColor = 'transparent',
  confirmedPedido,
}) => {
  const { ref, handlers, style } = useHorizontalDragScroll()
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'warning' | 'info'
  }>({ open: false, message: '', severity: 'success' })

  // Ref para acceder a selectedOption sin que sea dep del useEffect de auto-selección
  const selectedOptionRef = React.useRef(selectedOption)
  selectedOptionRef.current = selectedOption

  const mesasOcupadas = useMemo(
    () => options.filter((m) => m.estado === ESTADO_MESA.OCUPADO).length,
    [options],
  )

  const { user }: any = useAuth()

  const codigoSucursal = user?.sucursal?.codigo

  // Auto-selección: cuando cambian las mesas (por espacio o por polling),
  // seleccionar la primera libre si no hay selección o si la actual fue tomada por otro.
  useEffect(() => {
    if (!options.length || isLoading) return
    const current = selectedOptionRef.current

    if (current) {
      const mesaActual = options.find((o) => o.value === current.value)

      let tomadaPorOtro = false
      if (mesaActual) {
        if (mesaActual.estado === ESTADO_MESA.OCUPADO_OTRO) {
          tomadaPorOtro = true
        } else if (current.estado === ESTADO_MESA.LIBRE && mesaActual.estado === ESTADO_MESA.OCUPADO) {
          // Si estaba libre localmente (porque acabamos de pagar/cancelar) pero el query
          // todavía reporta OCUPADA (datos stale), verificamos de quién es:
          // Si NO somos nosotros mismos, alguien más la tomó rápido y nos expulsa.
          // Si somos NOSOTROS, es casi seguro el estado anterior que aún no desapareció.
          if ((mesaActual.usuarioOcupante || '').toLowerCase() !== (user?.usuario || '').toLowerCase()) {
            tomadaPorOtro = true
          }
        }
      }

      // Si la mesa sigue siendo editable por nosotros y no fue tomada por otro
      if (mesaActual && !tomadaPorOtro) return

      // La mesa fue tomada por otro punto de venta durante el polling
      const primeraLibre = options.find((m) => m.estado === ESTADO_MESA.LIBRE)
      if (primeraLibre) {
        const idx = options.findIndex((m) => m._id === primeraLibre._id)
        setFocusedIndex(idx)
        setSelectedOption(primeraLibre)
        setSnackbar({
          open: true,
          message: `La mesa ${current.value} fue ocupada. Cambiando a Mesa ${primeraLibre.value}`,
          severity: 'warning',
        })
      } else {
        setSelectedOption(null)
        setFocusedIndex(-1)
        setSnackbar({
          open: true,
          message: 'La mesa seleccionada fue ocupada por alguien más y no hay mesas libres.',
          severity: 'warning',
        })
      }
      return
    }

    // Sin selección (entrada inicial o cambio de espacio): auto-seleccionar primera editable
    // Prioriza seleccionar una LIBRE, pero si no hay, permite seleccionar un OCUPADO tuyo.
    const primeraLibre = options.find((m) => m.estado === ESTADO_MESA.LIBRE)
    const primeraDisponible = primeraLibre || options.find((m) => m.estado !== ESTADO_MESA.OCUPADO_OTRO)

    if (primeraDisponible) {
      const idx = options.findIndex((m) => m._id === primeraDisponible._id)
      setFocusedIndex(idx)
      setSelectedOption(primeraDisponible)
      // Evitar mensaje cuando es tu propia mesa, pero avisar si es una libre
      if (primeraDisponible.estado === ESTADO_MESA.LIBRE) {
        setSnackbar({
          open: true,
          message: `Mesa ${primeraDisponible.value} seleccionada automáticamente`,
          severity: 'info',
        })
      }
    } else {
      setSnackbar({
        open: true,
        message: 'No hay mesas libres disponibles',
        severity: 'warning',
      })
    }
  }, [options, setFocusedIndex, setSelectedOption, isLoading, user?.usuario]) // setters de useState son estables, no causan bucles

  // Sincronizar focusedIndex cuando cambia selectedOption desde el padre
  useEffect(() => {
    if (!selectedOption || !options.length) return
    const idx = options.findIndex((o) => o.value === selectedOption.value)
    if (idx >= 0 && idx !== focusedIndex) setFocusedIndex(idx)
  }, [selectedOption, options, focusedIndex, setFocusedIndex])

  const handleMesaClick = useCallback(
    (mesa: MesaUI, index: number) => {
      setFocusedIndex(index)
      setSelectedOption(mesa)
      onManualSelection?.(mesa)
      if (showInDialog) onDialogClose?.()
    },
    [setFocusedIndex, setSelectedOption, onManualSelection, showInDialog, onDialogClose],
  )

  const renderContent = () => (
    <Paper
      elevation={0}
      sx={{
        background: bgColor,
        transition: 'background-color 0.5s ease',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
      }}
    >
      <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
        {showAsGrid ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 1,
              p: 1,
              height: '100%',
              overflowY: 'auto',
            }}
          >
            {isLoading
              ? Array.from({ length: 15 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" width={140} height={90} sx={{ borderRadius: 1 }} />
                ))
              : options.map((mesa, index) => (
                  <MesaCard
                    key={mesa._id}
                    mesa={
                      focusedIndex === index && selectedOption?.value === mesa.value ? selectedOption : mesa
                    }
                    index={index}
                    isFocused={focusedIndex === index}
                    showAsGrid={showAsGrid}
                    onClick={handleMesaClick}
                    selectedPedido={focusedIndex === index ? confirmedPedido : undefined}
                    codigoSucursal={codigoSucursal}
                  />
                ))}
          </Box>
        ) : (
          <Box ref={ref} {...handlers} sx={{ ...style, display: 'flex', gap: 1, overflowX: 'auto', p: 0.5 }}>
            {isLoading
              ? Array.from({ length: 15 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width={120}
                    height={70}
                    sx={{ flexShrink: 0, borderRadius: 1 }}
                  />
                ))
              : options.map((mesa, index) => (
                  <MesaCard
                    key={mesa._id}
                    mesa={
                      focusedIndex === index && selectedOption?.value === mesa.value ? selectedOption : mesa
                    }
                    index={index}
                    isFocused={focusedIndex === index}
                    showAsGrid={showAsGrid}
                    onClick={handleMesaClick}
                    selectedPedido={focusedIndex === index ? confirmedPedido : undefined}
                    codigoSucursal={codigoSucursal}
                  />
                ))}
          </Box>
        )}
      </Box>
      {/* Barra de info: mesas ocupadas + mesa actual */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1,
          py: 0.4,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <RestaurantIcon sx={{ fontSize: 15, color: 'error.light' }} />
        <Typography sx={{ fontWeight: 700, lineHeight: 1 }}>Ocupadas: {mesasOcupadas}</Typography>
      </Box>
    </Paper>
  )

  return (
    <>
      {showInDialog ? (
        <Dialog open={dialogOpen} onClose={onDialogClose} maxWidth="xl" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {dialogTitle}
            <IconButton onClick={onDialogClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>{renderContent()}</DialogContent>
        </Dialog>
      ) : (
        renderContent()
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ minWidth: 300 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default RrMesas
