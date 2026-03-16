import AddIcon from '@mui/icons-material/Add'
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined'
import RemoveIcon from '@mui/icons-material/Remove'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import {
  Alert,
  alpha,
  Box,
  Button,
  IconButton,
  OutlinedInput,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { keyframes } from '@mui/system'
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import NumberSpinnerField from '../../../../base/components/NumberSpinnerField/NumberSpinnerField'
import { searchClientsApi } from '../../../clients/api/searchClients.api'
import InputSearchClients from '../../../clients/components/InputSearchClients'
import { ClientProps } from '../../../clients/interfaces/client'
import {
  ESTADO_MESA,
  MesaUI,
  OpcionesParaLlevar,
  TIPO_PEDIDO,
  TipoPedido,
} from '../../interfaces/mesa.interface'
import { ArticuloOperacion } from '../../types'
import RrOpciones from './RrOpciones'

// Declaración del web component lord-icon para TypeScript
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': {
        src?: string
        trigger?: string
        delay?: string | number
        state?: string
        colors?: string
        stroke?: string | number
        target?: string
        style?: React.CSSProperties
        className?: string
        key?: React.Key | null
      }
    }
  }
}

interface RrCarritoProps {
  mesaSeleccionada?: MesaUI | null
  onUpdateProduct?: (index: number, updatedItem: ArticuloOperacion) => void
  onRemoveProduct?: (index: number) => void
}

const RrCarrito: FunctionComponent<RrCarritoProps> = ({
  mesaSeleccionada,
  onUpdateProduct,
  onRemoveProduct,
}) => {
  const theme = useTheme()
  const [openOpciones, setOpenOpciones] = useState(false)
  const [tipoPedido, setTipoPedido] = useState<TipoPedido>(TIPO_PEDIDO.SALON)
  const [opcionesLlevar, setOpcionesLlevar] = useState<OpcionesParaLlevar | null>(null)
  const [notaGeneral, setNotaGeneral] = useState('')
  const [initialCartState, setInitialCartState] = useState('')

  // Cache del cliente 00: se carga UNA sola vez al montar el componente.
  // Así al cambiar de mesa nunca se hace una llamada de red extra.
  const defaultClientRef = useRef<ClientProps | null>(null)
  const fetchDefaultClient = useCallback(() => {
    if (defaultClientRef.current) return
    searchClientsApi('00')
      .then((resp) => {
        const found = resp.find((c) => c.codigoCliente === '00') || resp[0] || null
        defaultClientRef.current = found
        // Si todavía no hay cliente seleccionado, aplicarlo
        setOpcionesLlevar((prev) => {
          if (prev?.cliente) return prev
          if (!found) return prev
          return { cliente: found, horaRecojo: '', solicitarUtensilios: false }
        })
      })
      .catch(() => {
        /* ignorar — sin internet simplemente no hay cliente 00 */
      })
  }, [])

  useEffect(() => {
    fetchDefaultClient()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Limpiamos los metadatos o llaves de GraphQL (como __typename) que alteran la igualdad del JSON
  const extractClienteData = (c: any) => {
    if (!c) return null
    return {
      _id: c._id,
      codigo: c.codigo,
      razonSocial: c.razonSocial,
      nit: c.nit,
    }
  }

  // Snapshot de productos: _id del item (único por fila en el carrito) + cantidad.
  // Usamos p._id como clave de sort, NO articuloId, porque puede haber varias filas
  // del mismo artículo (diferente nota/complemento) y articuloId se repite —
  // eso hacía el sort inestable y generaba falsos positivos en isOrderEdited.
  const extractProductosSnapshot = (productos: any[] | undefined) => {
    if (!productos?.length) return []
    return [...productos]
      .map((p) => ({
        _id: String(p._id ?? ''),
        qty: p.articuloPrecio?.cantidad ?? p.articuloPrecioBase?.cantidad ?? 1,
      }))
      .sort((a, b) => a._id.localeCompare(b._id))
  }

  const currentCartState = JSON.stringify({
    pedidoId: mesaSeleccionada?.pedido?._id || 'NUEVO',
    tipo: tipoPedido,
    nota: notaGeneral,
    cliente: extractClienteData(opcionesLlevar?.cliente),
    productos: extractProductosSnapshot(mesaSeleccionada?.pedido?.productos),
  })

  const isOrderEdited = initialCartState !== '' && initialCartState !== currentCartState

  const lastSyncRef = useRef({ mesaValue: '', pedidoId: '' })
  const lastSnapshotUpdateRef = useRef<number>(0)

  // Sincronizar datos del carrito según si la mesa ya tiene una orden existente.
  useEffect(() => {
    const nextMesaValue = mesaSeleccionada?.value || ''
    const nextPedidoId = mesaSeleccionada?.pedido?._id || 'NUEVO'

    const isSameMesa = lastSyncRef.current.mesaValue === nextMesaValue
    const isSamePedido = lastSyncRef.current.pedidoId === nextPedidoId

    const isLocalTransition =
      isSameMesa &&
      (lastSyncRef.current.pedidoId === 'NUEVO' || lastSyncRef.current.pedidoId.startsWith('nuevo-')) &&
      (nextPedidoId === 'NUEVO' || nextPedidoId.startsWith('nuevo-'))

    const currentSnapshotUpdate = (mesaSeleccionada?.pedido as any)?._forceSnapshotUpdate || 0
    const needsSnapshotUpdate = currentSnapshotUpdate > lastSnapshotUpdateRef.current

    const shouldSync =
      !isSameMesa ||
      (!isSamePedido && !isLocalTransition) ||
      // Force sync if the pedido just transitioned from 'nuevo-' to a real ID via 'Registrar'
      (lastSyncRef.current.pedidoId.startsWith('nuevo-') &&
        !nextPedidoId.startsWith('nuevo-') &&
        nextPedidoId !== 'NUEVO') ||
      // Or if it was explicitly updated via success callback
      needsSnapshotUpdate

    if (shouldSync) {
      lastSyncRef.current = { mesaValue: nextMesaValue, pedidoId: nextPedidoId }
      lastSnapshotUpdateRef.current = currentSnapshotUpdate

      if (mesaSeleccionada?.pedido) {
        // When pedidoRetornado arrives, we update the initial snapshot to remove the dirty state
        const _tipo = (mesaSeleccionada.pedido.tipo as TipoPedido) || TIPO_PEDIDO.SALON
        const _nota = mesaSeleccionada.pedido.nota || ''
        const _cliente = mesaSeleccionada.pedido.cliente || null

        setInitialCartState(
          JSON.stringify({
            pedidoId: mesaSeleccionada.pedido._id,
            tipo: _tipo,
            nota: _nota,
            cliente: extractClienteData(_cliente),
            productos: extractProductosSnapshot(mesaSeleccionada.pedido.productos),
          }),
        )

        setTipoPedido(_tipo)
        setNotaGeneral(_nota)

        if (_cliente) {
          setOpcionesLlevar({
            cliente: _cliente,
            horaRecojo: '',
            solicitarUtensilios: false,
          })
        } else {
          setOpcionesLlevar(null)
        }
      } else {
        // Mesa Libre / Nueva — usar el cliente 00 cacheado (sin llamada de red)
        const clienteDefault = defaultClientRef.current
        setInitialCartState(
          JSON.stringify({
            pedidoId: 'NUEVO',
            tipo: TIPO_PEDIDO.SALON,
            nota: '',
            cliente: extractClienteData(clienteDefault),
            productos: [],
          }),
        )
        setTipoPedido(TIPO_PEDIDO.SALON)
        setOpcionesLlevar(
          clienteDefault ? { cliente: clienteDefault, horaRecojo: '', solicitarUtensilios: false } : null,
        )
        setNotaGeneral('')
      }
    }
  }, [mesaSeleccionada])

  // Obtener el nombre del área desde localStorage (o default)
  const nombreArea = useMemo(() => {
    try {
      const cachedData = localStorage.getItem('ubicacion')
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        return parsed?.descripcion || 'Salón Principal'
      }
    } catch {
      // ignorar
    }
    return 'Salón Principal'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesaSeleccionada?.value]) // re-calcular solo si cambia de mesa

  const headerColor = useMemo(() => {
    if (!mesaSeleccionada) return theme.palette.primary.main
    switch (mesaSeleccionada.estado) {
      case ESTADO_MESA.LIBRE:
        return theme.palette.success.main
      case ESTADO_MESA.OCUPADO:
      case ESTADO_MESA.OCUPADO_OTRO:
        return theme.palette.warning.main
      default:
        return theme.palette.primary.main
    }
  }, [mesaSeleccionada, theme.palette])

  // Helpers para icono y textos según el tipo de pedido
  const HeaderIcon =
    tipoPedido === TIPO_PEDIDO.LLEVAR
      ? LocalMallOutlinedIcon
      : tipoPedido === TIPO_PEDIDO.DELIVERY
        ? DeliveryDiningOutlinedIcon
        : StorefrontOutlinedIcon

  const titleText =
    tipoPedido === TIPO_PEDIDO.LLEVAR
      ? 'Para Llevar'
      : tipoPedido === TIPO_PEDIDO.DELIVERY
        ? `Delivery – ${opcionesLlevar?.metodoDelivery === 'PEDIDOS_YA' ? 'PedidosYa' : 'Propio'}`
        : mesaSeleccionada?.label || 'Mesa no seleccionada'

  const subtitleText =
    tipoPedido === TIPO_PEDIDO.LLEVAR
      ? 'Pedido para recoger'
      : tipoPedido === TIPO_PEDIDO.DELIVERY
        ? opcionesLlevar?.metodoDelivery === 'PEDIDOS_YA' && opcionesLlevar?.nombreRepartidor
          ? `Repartidor: ${opcionesLlevar.nombreRepartidor}`
          : 'Envío a domicilio'
        : `Área: ${nombreArea}`

  return (
    <Paper sx={{ p: 1, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', mb: 0 }}>
      {mesaSeleccionada ? (
        <>
          {/* Header de Mesa (Diseño Nuevo) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1, // Padding interno reducido
              mb: 1, // Margen inferior reducido
              borderRadius: 2,
              border: `1px solid ${alpha(headerColor, 0.3)}`,
              bgcolor: alpha(headerColor, 0.05),
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* Icono de Tienda / Mesa */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(headerColor, 0.15),
                  color: headerColor,
                  width: 36, // Tamaño reducido
                  height: 36,
                  borderRadius: 1.5,
                }}
              >
                <HeaderIcon fontSize="small" />
              </Box>

              {/* Textos Mesa y Área */}
              <Box>
                <Typography variant="body1" fontWeight="700" color={headerColor} lineHeight={1.2}>
                  {isOrderEdited && (
                    <Typography component="span" sx={{ color: 'primary.main', fontWeight: 900, mr: 0.5 }}>
                      *
                    </Typography>
                  )}
                  {titleText}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0 }}>
                  {subtitleText}
                </Typography>
              </Box>
            </Stack>

            {/* Lápiz para opciones */}
            <IconButton size="small" sx={{ color: headerColor }} onClick={() => setOpenOpciones(true)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Buscador de cliente — siempre visible */}
          <Box sx={{ mb: 1 }}>
            <InputSearchClients
              hideLabel={true}
              value={opcionesLlevar?.cliente ?? null}
              withCreditLine={false}
              onClientSelect={(c) => {
                setOpcionesLlevar((prev) => ({
                  cliente: c,
                  horaRecojo: prev?.horaRecojo || '',
                  solicitarUtensilios: prev?.solicitarUtensilios || false,
                }))
              }}
              onListShowed={() => {}}
              editable={true}
              onChangeEditable={(modifications) => {
                if (modifications) {
                  setOpcionesLlevar((prev) => {
                    if (!prev?.cliente) return prev
                    const nextCliente = { ...prev.cliente, ...modifications }
                    if (JSON.stringify(prev.cliente) === JSON.stringify(nextCliente)) {
                      return prev
                    }
                    return { ...prev, cliente: nextCliente }
                  })
                }
              }}
            />
          </Box>

          {/* Detalles de Productos en el Carrito */}
          <Box
            sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}
          >
            {mesaSeleccionada.pedido?.productos?.length ? (
              mesaSeleccionada.pedido.productos.map((producto, index) => (
                <CartItem
                  key={`${producto.articuloId || index}-${index}`}
                  item={producto}
                  onUpdate={(updated) => onUpdateProduct?.(index, updated)}
                  onRemove={() => onRemoveProduct?.(index)}
                />
              ))
            ) : (
              <Box
                sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}
              >
                <EmptyCartIcon label="Selecciona productos del menú para comenzar la orden." />
              </Box>
            )}
          </Box>

          {/* Notas generales del pedido */}
          <Box
            sx={{
              mt: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1,
              bgcolor: 'background.paper',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: 'text.secondary',
                letterSpacing: 1,
                mb: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Notas generales del pedido
            </Typography>
            <TextField
              multiline
              fullWidth
              minRows={1}
              maxRows={4}
              placeholder="Notas"
              value={notaGeneral}
              onChange={(e) => setNotaGeneral(e.target.value)}
              InputProps={{
                sx: {
                  fontSize: '0.85rem',
                  p: 0.5,
                  bgcolor: '#fcfcfc',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Dialogo RrOpciones */}
          <RrOpciones
            open={openOpciones}
            onClose={() => setOpenOpciones(false)}
            tipoPedido={tipoPedido}
            setTipoPedido={setTipoPedido}
            mesaSeleccionada={mesaSeleccionada}
            opcionesLlevar={opcionesLlevar}
            setOpcionesLlevar={setOpcionesLlevar}
          />
        </>
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyCartIcon label="Selecciona una mesa" />
        </Box>
      )}
    </Paper>
  )
}

// ─── Íconos Lord Icon para carrito vacío ────────────────────────────────────

const LORD_ICONS = [
  'https://cdn.lordicon.com/njrwmskv.json',
  'https://cdn.lordicon.com/iewbcboh.json',
  'https://cdn.lordicon.com/bmafcihj.json',
]

const EmptyCartIcon = ({ label }: { label?: string }) => {
  const [iconIndex, setIconIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Cada 7 segundos inicia el ciclo: fade-out → cambia ícono → fade-in
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIconIndex((prev) => (prev + 1) % LORD_ICONS.length)
        setVisible(true)
      }, 900) // duración del fade-out antes de cambiar
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <lord-icon
          key={iconIndex}
          src={LORD_ICONS[iconIndex]}
          trigger="in"
          delay="300"
          state="in-unfold"
          style={{ width: '250px', height: '250px' }}
        />
      </Box>
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  )
}

// ─── Sub-componente para item del carrito ───────────────────────────────────

// Entrada suave (0→1 en 25%) y salida lenta (1→0 en el 75% restante)
const pulseHighlight = keyframes`
  0%   { opacity: 0; }
  20%  { opacity: 1; }
  100% { opacity: 0; }
`

const CartItem = ({
  item,
  onUpdate,
  onRemove,
}: {
  item: ArticuloOperacion
  onUpdate: (updated: ArticuloOperacion) => void
  onRemove: () => void
}) => {
  const theme = useTheme()
  const [isEditing, setIsEditing] = useState(false)

  const originalCortesia = !!item.cortesia
  const originalPrecio = item.articuloPrecio?.valor ?? item.articuloPrecio?.monedaPrecio?.precio ?? 0
  const originalNota = item.nota || ''

  // Leemos la cantidad siempre desde el prop (estado global de RestRegistrar)
  const cantidad = item.articuloPrecio?.cantidad ?? item.articuloPrecioBase?.cantidad ?? 1

  // Flash en cualquier cambio de cantidad. Usamos un contador en vez de boolean:
  // al alternar entre pulseA y pulseB el browser siempre ve un nombre nuevo
  // y reinicia la animación desde el frame 0, sin importar clicks seguidos.
  const prevCantidadRef = useRef(cantidad)
  // Inicializar en 1 para disparar el flash inmediatamente al montar (primer ingreso al carrito)
  const [flashCount, setFlashCount] = useState(1)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; key: number }>({
    open: false,
    message: '',
    key: 0,
  })
  useEffect(() => {
    if (cantidad !== prevCantidadRef.current) {
      prevCantidadRef.current = cantidad
      setFlashCount((n) => n + 1)
    }
  }, [cantidad])

  const [isCortesia, setIsCortesia] = useState(originalCortesia)
  const [precioNum, setPrecioNum] = useState<number | null>(originalPrecio)
  const [descuentoNum, setDescuentoNum] = useState<number | null>(0)
  const [nota, setNota] = useState(originalNota)

  // Dispara actualización hacia arriba para la cantidad
  const handleCantidadChange = (next: number) => {
    setSnackbar((s) => ({
      open: true,
      message: `Modificando ${item.nombreArticulo} cantidad a ${next}`,
      key: s.key + 1,
    }))
    onUpdate({
      ...item,
      articuloPrecio: { ...(item.articuloPrecio || {}), cantidad: next },
      articuloPrecioBase: { ...(item.articuloPrecioBase || {}), cantidad: next },
    })
  }

  const sigla = item.articuloPrecio?.moneda?.sigla ?? item.articuloPrecioBase?.moneda?.sigla ?? '$'

  const isEdited =
    isCortesia !== originalCortesia ||
    precioNum !== originalPrecio ||
    nota !== originalNota ||
    descuentoNum !== 0

  const extras =
    item.complementos
      ?.map((c) => {
        const qty = c.articuloPrecio?.cantidad ?? c.articuloPrecioBase?.cantidad ?? 1
        return {
          nombre: c.nombreArticulo,
          cantidad: qty,
        }
      })
      .filter((extra) => Boolean(extra.nombre)) || []
  const notaRapidas = item.notaRapida?.map((nr) => nr.valor).filter(Boolean) || []

  // Custom notes separated by comma or dot
  const notasPersonalizadas = nota
    .split(/[,.]/)
    .map((n) => n.trim())
    .filter(Boolean)

  return (
    <Box
      sx={{
        position: 'relative',
        border: '1px solid',
        borderColor: isCortesia ? 'success.light' : 'divider',
        borderRadius: 2,
        p: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Overlay de flash — se desmonta/monta con key para reiniciar animación siempre */}
      {flashCount > 0 && (
        <Box
          key={`flash-${flashCount}`}
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 2,
            pointerEvents: 'none',
            bgcolor: 'rgba(76, 175, 80, 0.13)',
            border: '1.5px solid rgba(76, 175, 80, 0.55)',
            animation: `${pulseHighlight} 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
          }}
        />
      )}
      {/* Fila principal: Título y Botones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
        <Box sx={{ flexGrow: 1, pr: 1 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            {item.nombreArticulo}
            {isEdited && (
              <Typography component="span" sx={{ color: 'primary.main', fontWeight: 900, ml: 0.5 }}>
                *
              </Typography>
            )}
          </Typography>
          {isCortesia && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CardGiftcardOutlinedIcon sx={{ fontSize: '1rem', color: 'success.main' }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'success.main' }}>
                Cortesía (Gratis)
              </Typography>
            </Box>
          )}
          {!isCortesia && !isEditing && (
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'primary.main', mt: 0.5 }}>
              Precio: {sigla} {Number(precioNum || 0).toFixed(2)}
            </Typography>
          )}
        </Box>

        {/* Lado Derecho: Controles, Acciones y Total */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: 28 }}>
            {/* Controles de Cantidad */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
              <IconButton
                onClick={() => handleCantidadChange(Math.max(1, cantidad - 1))}
                size="small"
                sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' }, width: 24, height: 24 }}
              >
                <RemoveIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
              </IconButton>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, minWidth: 16, textAlign: 'center' }}>
                {cantidad}
              </Typography>
              <IconButton
                onClick={() => handleCantidadChange(cantidad + 1)}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                  width: 24,
                  height: 24,
                }}
              >
                <AddIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>

            {/* Acciones */}
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={() => setIsEditing(!isEditing)}
                sx={{
                  bgcolor: isEditing ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isEditing ? 'primary.main' : 'text.secondary',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  const next = !isCortesia
                  setIsCortesia(next)
                  onUpdate({ ...item, cortesia: next })
                }}
                sx={{
                  bgcolor: isCortesia ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                  color: isCortesia ? 'success.main' : 'text.secondary',
                  '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) },
                }}
              >
                <CardGiftcardOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={onRemove}
                sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: '1.1rem' }} />
              </IconButton>
            </Stack>
          </Box>

          {/* Fila del Total */}
          {!isCortesia && (
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
              Total: {sigla} {(Number(precioNum || 0) * cantidad - Number(descuentoNum || 0)).toFixed(2)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Caja de edición activa */}
      {isEditing && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: '#fcfcfc',
            p: 1,
            mb: 0.5,
            mt: 0.5,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  mb: 0.5,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                Precio Unitario
              </Typography>
              <NumberSpinnerField
                size="small"
                fullWidth
                value={precioNum}
                onChange={setPrecioNum}
                step={0.5}
                decimalScale={2}
                min={0}
                sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-input': { p: 1, fontSize: '0.85rem' } }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  mb: 0.5,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                Descuento ($)
              </Typography>
              {isCortesia ? (
                <OutlinedInput
                  size="small"
                  fullWidth
                  disabled
                  value="-"
                  sx={{
                    bgcolor: '#f5f5f5',
                    fontSize: '0.85rem',
                    '& .MuiOutlinedInput-input': { p: 1, textAlign: 'center', fontWeight: 'bold' },
                  }}
                />
              ) : (
                <NumberSpinnerField
                  size="small"
                  fullWidth
                  value={descuentoNum}
                  onChange={setDescuentoNum}
                  step={0.5}
                  decimalScale={2}
                  min={0}
                  sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-input': { p: 1, fontSize: '0.85rem' } }}
                />
              )}
            </Box>
          </Stack>
          <Box>
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'text.secondary',
                mb: 0.5,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Nota Personalizada
            </Typography>
            <OutlinedInput
              size="small"
              fullWidth
              placeholder="Ej. Sin sal, extra mayonesa..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              sx={{ bgcolor: '#fff', fontSize: '0.85rem', '& .MuiOutlinedInput-input': { p: 1 } }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                onUpdate({
                  ...item,
                  nota: nota,
                  cortesia: isCortesia,
                  articuloPrecio: {
                    ...(item.articuloPrecio || {}),
                    valor: precioNum || 0,
                  },
                  articuloPrecioBase: {
                    ...(item.articuloPrecioBase || {}),
                    valor: precioNum || 0,
                  },
                })
                setIsEditing(false)
              }}
            >
              Guardar Cambios
            </Button>
          </Box>
        </Box>
      )}

      {/* Extras y Notas (Pills) */}
      {(extras.length > 0 || notaRapidas.length > 0 || notasPersonalizadas.length > 0) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
          {extras.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', letterSpacing: 0.5 }}>
                EXTRAS:
              </Typography>
              {extras.map((extra, i) => (
                <Box
                  key={`extra-${i}`}
                  sx={{
                    px: 1,
                    py: 0.15,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.dark',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {extra.cantidad > 1 && (
                    <Typography component="span" sx={{ fontWeight: 800, mr: 0.5, color: 'primary.main' }}>
                      {extra.cantidad}x
                    </Typography>
                  )}
                  {extra.nombre}
                </Box>
              ))}
            </Box>
          )}

          {(notaRapidas.length > 0 || notasPersonalizadas.length > 0) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', letterSpacing: 0.5 }}>
                NOTA:
              </Typography>
              {notaRapidas.map((n, i) => (
                <Box
                  key={`nr-${i}`}
                  sx={{
                    px: 1,
                    py: 0.15,
                    bgcolor: '#fffde7',
                    color: '#f57f17',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {n}
                </Box>
              ))}
              {notasPersonalizadas.map((notaStr, i) => (
                <Box
                  key={`np-${i}`}
                  sx={{
                    px: 1,
                    py: 0.15,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'secondary.main',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {notaStr}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
      <Snackbar
        key={`snackbar-${snackbar.key}`}
        open={snackbar.open}
        autoHideDuration={1000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="standard" sx={{ minWidth: 220, boxShadow: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RrCarrito
