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
} from '@mui/material'
import dayjs from 'dayjs'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'

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
    prev.mesa.pedido?.createdAt === next.mesa.pedido?.createdAt
  )
}

const MesaCard = memo(({ mesa, index, isFocused, showAsGrid, onClick }: MesaCardProps) => {
  const { estado, pedido, usuarioOcupante } = mesa
  const isClickable = estado !== ESTADO_MESA.OCUPADO_OTRO

  const getBackgroundColor = () => {
    if (isFocused) return COLORS.focused
    if (estado === ESTADO_MESA.LIBRE) return COLORS.libre
    if (estado === ESTADO_MESA.OCUPADO_OTRO) return COLORS.ocupadoOtro
    return COLORS.ocupado
  }

  const getHoverColor = () => {
    if (estado === ESTADO_MESA.LIBRE) return COLORS.libreHover
    if (estado === ESTADO_MESA.OCUPADO_OTRO) return COLORS.ocupadoOtroHover
    return COLORS.ocupadoHover
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
        position: 'relative',
        transition: 'background-color 0.2s',
        '&:hover': isClickable
          ? {
              backgroundColor: getHoverColor(),
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
          opacity: 0.1,
          fontWeight: 'bold',
          fontSize: showAsGrid ? 70 : 60,
          color: estado === ESTADO_MESA.LIBRE ? '#006400' : '#7A0000',
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
          opacity: 0.1,
          fontSize: showAsGrid ? 55 : 45,
          color: estado === ESTADO_MESA.LIBRE ? '#006400' : '#7A0000',
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
          </>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {estado === ESTADO_MESA.OCUPADO_OTRO ? 'Ocupada' : 'Libre'}
            </Typography>
            {estado === ESTADO_MESA.OCUPADO_OTRO && usuarioOcupante && (
              <Typography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                {usuarioOcupante}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}, areEqual)

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

  // Auto-selección: cuando cambian las mesas (por espacio o por polling),
  // seleccionar la primera libre si no hay selección o si la actual fue tomada por otro.
  useEffect(() => {
    if (!options.length) return
    const current = selectedOptionRef.current

    if (current) {
      const mesaActual = options.find((o) => o._id === current._id)
      // Si la mesa sigue siendo mía o libre, no hacer nada
      if (mesaActual && mesaActual.estado !== ESTADO_MESA.OCUPADO_OTRO) return

      // La mesa fue tomada por otro usuario durante el polling
      const primeraLibre = options.find((m) => m.estado === ESTADO_MESA.LIBRE)
      if (primeraLibre) {
        const idx = options.findIndex((m) => m._id === primeraLibre._id)
        setFocusedIndex(idx)
        setSelectedOption(primeraLibre)
        setSnackbar({
          open: true,
          message: `Mesa ${current.value} fue ocupada. Se cambió automáticamente a Mesa ${primeraLibre.value}`,
          severity: 'warning',
        })
      } else {
        setSelectedOption(null)
        setFocusedIndex(-1)
        setSnackbar({
          open: true,
          message: 'Su mesa fue ocupada y no hay mesas libres disponibles',
          severity: 'warning',
        })
      }
      return
    }

    // Sin selección (entrada inicial o cambio de espacio): auto-seleccionar primera libre
    const primeraLibre = options.find((m) => m.estado === ESTADO_MESA.LIBRE)
    if (primeraLibre) {
      const idx = options.findIndex((m) => m._id === primeraLibre._id)
      setFocusedIndex(idx)
      setSelectedOption(primeraLibre)
      setSnackbar({
        open: true,
        message: `Mesa ${primeraLibre.value} seleccionada automáticamente`,
        severity: 'info',
      })
    } else {
      setSnackbar({
        open: true,
        message: 'No hay mesas libres disponibles',
        severity: 'warning',
      })
    }
  }, [options, setFocusedIndex, setSelectedOption]) // setters de useState son estables, no causan bucles

  // Sincronizar focusedIndex cuando cambia selectedOption desde el padre
  useEffect(() => {
    if (!selectedOption || !options.length) return
    const idx = options.findIndex((o) => o._id === selectedOption._id)
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
                    mesa={mesa}
                    index={index}
                    isFocused={focusedIndex === index}
                    showAsGrid={showAsGrid}
                    onClick={handleMesaClick}
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
                    mesa={mesa}
                    index={index}
                    isFocused={focusedIndex === index}
                    showAsGrid={showAsGrid}
                    onClick={handleMesaClick}
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
