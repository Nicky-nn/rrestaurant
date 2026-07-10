import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined'
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined'
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Typography,
  alpha,
} from '@mui/material'
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import useAuth from '../../../base/hooks/useAuth'
import { useRestPedidoListado } from '../queries/useRestPedidoListado'
import { ArticuloOperacion, RestPedido } from '../types'
import { COCINA_PEDIDO_LISTO_EVENT, COCINA_PEDIDO_LISTO_KEY } from './cocinaEvents'

const COCINA_ESTADOS_KEY = 'restaurante:cocina:estados'

type CocinaPedidoEstado = 'PENDIENTE' | 'PREPARACION' | 'LISTO'

interface CocinaEstadoLocal {
  estado: CocinaPedidoEstado
  cambiosEntendidos?: boolean
  firmaCambios?: string
  firmaContenido?: string
}

interface CocinaPedidoListoPayload {
  id: string
  numero: number
  hora: string
  at: string
}

interface ProductoSnapshot {
  key: string
  nombre: string
  cantidad: number
  texto: string
  firmaDetalle: string
  eliminado?: boolean
}

const estadoColumnas: Array<{ estado: CocinaPedidoEstado; titulo: string; color: string; empty: string }> = [
  { estado: 'PENDIENTE', titulo: 'Pendientes', color: '#ff2d2d', empty: 'No hay órdenes pendientes' },
  {
    estado: 'PREPARACION',
    titulo: 'En Preparación',
    color: '#ff9800',
    empty: 'No hay órdenes en preparación',
  },
  { estado: 'LISTO', titulo: 'Listos', color: '#00b87a', empty: 'No hay órdenes listas' },
]

const leerEstados = (): Record<string, CocinaEstadoLocal> => {
  try {
    const raw = localStorage.getItem(COCINA_ESTADOS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const guardarEstados = (estados: Record<string, CocinaEstadoLocal>) => {
  localStorage.setItem(COCINA_ESTADOS_KEY, JSON.stringify(estados))
}

const formatFecha = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const getHoraPedido = (pedido: RestPedido) => {
  const fecha = pedido.updatedAt || pedido.fechaDocumento || pedido.createdAt || ''
  const match = fecha.match(/(\d{2}):(\d{2})/)
  if (!match) return ''
  const hours = Number(match[1])
  const minutes = match[2]
  const suffix = hours >= 12 ? 'p.m.' : 'a.m.'
  const hour12 = hours % 12 || 12
  return `${String(hour12).padStart(2, '0')}:${minutes} ${suffix}`
}

const getMesaPedido = (pedido: RestPedido) => {
  if (pedido.tipo === 'LLEVAR') return 'Para llevar'
  if (pedido.tipo === 'DELIVERY') return 'Delivery'
  return pedido.mesa?.nombre ? `Mesa ${pedido.mesa.nombre}` : 'Mesa'
}

const getNumeroPedido = (pedido: RestPedido) => pedido.numeroOrden || pedido.numeroPedido || 0
const getCantidad = (producto: ArticuloOperacion) =>
  producto.articuloPrecio?.cantidad ?? producto.articuloPrecioBase?.cantidad ?? 1
const getProductoKey = (producto: ArticuloOperacion, index: number) =>
  `${producto.nroItem ?? index}-${producto.codigoArticulo ?? producto.articuloId ?? producto.nombreArticulo ?? index}`

const numerosTexto: Record<number, string> = {
  0: 'cero',
  1: 'un',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
  20: 'veinte',
}

const getCantidadVoz = (cantidad: number) => numerosTexto[cantidad] ?? String(cantidad)

const getNotaRapidaTexto = (items?: Array<{ valor?: string | null; cantidad?: number | null }>) =>
  (items ?? [])
    .map((item) => item.valor)
    .filter(Boolean)
    .join(', ')

const getProductoExtras = (producto: ArticuloOperacion) => {
  const extras: string[] = []
  const nota = [producto.nota, producto.detalleExtra, getNotaRapidaTexto(producto.notaRapida)]
    .filter(Boolean)
    .join(', ')

  if (nota) extras.push(`Nota: ${nota}`)
  ;(producto.modificadores ?? []).forEach((modificador) => {
    const cantidad = modificador.articuloPrecio?.cantidad ?? 1
    const nombre = modificador.nombreOpcion || modificador.nombreArticulo || modificador.codigoArticulo
    const notas = [modificador.nota, getNotaRapidaTexto(modificador.notaRapida)].filter(Boolean).join(', ')
    if (nombre) extras.push(`${getCantidadVoz(Number(cantidad))} ${nombre}${notas ? ` (${notas})` : ''}`)
  })
  ;(producto.variacionReceta ?? []).forEach((receta) => {
    const nombre = receta.nombreArticulo || receta.codigoArticulo
    const notas = [receta.nota, getNotaRapidaTexto(receta.notaRapida)].filter(Boolean).join(', ')
    if (!nombre) return
    if (receta.removido) extras.push(`Sin ${nombre}${notas ? ` (${notas})` : ''}`)
    else if (receta.esExtra) extras.push(`Extra ${nombre}${notas ? ` (${notas})` : ''}`)
  })

  return extras
}

const getProductoVoz = (producto: ArticuloOperacion, index: number) => {
  const nombre = producto.nombreArticulo || producto.codigoArticulo || `producto ${index + 1}`
  const extras = getProductoExtras(producto)
  return `${getCantidadVoz(Number(getCantidad(producto)))} ${nombre}${extras.length ? `, ${extras.join(', ')}` : ''}`
}

const getCambiosPedido = (pedido: RestPedido) => {
  const productosEliminados = (pedido.productosEliminados ?? []).map((producto) => ({
    ...producto,
    state: 'ELIMINADO',
  }))
  return [...(pedido.productos ?? []), ...productosEliminados].filter((producto) =>
    ['NUEVO', 'ACTUALIZADO', 'ELIMINADO'].includes(producto.state ?? ''),
  )
}

const getFirmaCambios = (pedido: RestPedido) =>
  getCambiosPedido(pedido)
    .map(
      (producto, index) =>
        `${getProductoKey(producto, index)}:${producto.state}:${getCantidad(producto)}:${producto.nombreArticulo ?? ''}`,
    )
    .sort()
    .join('|')

const getProductosVisibles = (pedido: RestPedido) => [
  ...(pedido.productos ?? []),
  ...(pedido.productosEliminados ?? []).map((producto) => ({ ...producto, state: 'ELIMINADO' })),
]

const getFirmaContenido = (pedido: RestPedido) =>
  getProductosVisibles(pedido)
    .map((producto, index) =>
      [
        getProductoKey(producto, index),
        getCantidad(producto),
        producto.nombreArticulo,
        producto.nota,
        producto.detalleExtra,
        getNotaRapidaTexto(producto.notaRapida),
        ...(producto.modificadores ?? []).map((modificador) =>
          [
            modificador.nroItem,
            modificador.codigoArticulo,
            modificador.nombreArticulo,
            modificador.nombreOpcion,
            modificador.articuloPrecio?.cantidad,
            modificador.nota,
            getNotaRapidaTexto(modificador.notaRapida),
          ].join(':'),
        ),
        ...(producto.variacionReceta ?? []).map((receta) =>
          [
            receta.nroItem,
            receta.codigoArticulo,
            receta.nombreArticulo,
            receta.removido,
            receta.esExtra,
            receta.articuloPrecio?.cantidad,
            receta.nota,
            getNotaRapidaTexto(receta.notaRapida),
          ].join(':'),
        ),
      ].join('|'),
    )
    .sort()
    .join('||')

const getPedidoVoz = (pedido: RestPedido) => {
  const productos = pedido.productos ?? []
  const numero = getNumeroPedido(pedido)
  const resumen = productos.map((producto, index) => getProductoVoz(producto, index)).join('; ')
  return `Pedido ${numero}, ${resumen}`
}

const getSnapshotProducto = (producto: ArticuloOperacion, index: number): ProductoSnapshot => {
  const nombre = producto.nombreArticulo || producto.codigoArticulo || `producto ${index + 1}`
  const extras = getProductoExtras(producto)
  const cantidad = Number(getCantidad(producto) || 0)
  const firmaDetalle = [
    nombre,
    producto.nota,
    producto.detalleExtra,
    getNotaRapidaTexto(producto.notaRapida),
    ...extras,
  ].join('|')

  return {
    key: getProductoKey(producto, index),
    nombre,
    cantidad,
    texto: `${getCantidadVoz(cantidad)} ${nombre}${extras.length ? `, ${extras.join(', ')}` : ''}`,
    firmaDetalle,
    eliminado: producto.state === 'ELIMINADO',
  }
}

const getPedidoSnapshot = (pedido: RestPedido) => {
  const snapshot = new Map<string, ProductoSnapshot>()
  getProductosVisibles(pedido).forEach((producto, index) => {
    snapshot.set(getProductoKey(producto, index), getSnapshotProducto(producto, index))
  })
  return snapshot
}

const getDeltaPedidoVoz = (pedido: RestPedido, anterior: Map<string, ProductoSnapshot>) => {
  const actual = getPedidoSnapshot(pedido)
  const frases: string[] = []

  actual.forEach((producto, key) => {
    const previo = anterior.get(key)

    if (!previo) {
      frases.push(producto.eliminado ? `quitar ${producto.texto}` : `agregado ${producto.texto}`)
      return
    }

    if (producto.eliminado && !previo.eliminado) {
      frases.push(`quitar ${previo.texto}`)
      return
    }

    const diferencia = producto.cantidad - previo.cantidad
    if (diferencia > 0) frases.push(`más ${getCantidadVoz(diferencia)} ${producto.nombre}`)
    if (diferencia < 0) frases.push(`menos ${getCantidadVoz(Math.abs(diferencia))} ${producto.nombre}`)

    if (producto.firmaDetalle !== previo.firmaDetalle && diferencia === 0) {
      frases.push(`modificado ${producto.texto}`)
    }
  })

  anterior.forEach((producto, key) => {
    if (!actual.has(key)) frases.push(`quitar ${producto.texto}`)
  })

  if (frases.length === 0) return ''
  return `Pedido ${getNumeroPedido(pedido)}, ${frases.join('; ')}`
}

const hablar = (texto: string) => {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const msg = new SpeechSynthesisUtterance(texto)
  msg.lang = 'es-MX'
  window.speechSynthesis.speak(msg)
}

const getCambioLabel = (state?: string) => {
  if (state === 'NUEVO') return 'Nuevo'
  if (state === 'ACTUALIZADO') return 'Actualizado'
  if (state === 'ELIMINADO') return 'Eliminado'
  return ''
}

const CocinaProductoItem = ({ producto, index }: { producto: ArticuloOperacion; index: number }) => {
  const tieneCambio = ['NUEVO', 'ACTUALIZADO', 'ELIMINADO'].includes(producto.state ?? '')
  const eliminado = producto.state === 'ELIMINADO'

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: tieneCambio ? 'error.light' : 'divider',
        bgcolor: eliminado
          ? alpha('#f44336', 0.08)
          : tieneCambio
            ? alpha('#ff2d2d', 0.05)
            : 'background.paper',
        color: eliminado || tieneCambio ? 'error.dark' : 'text.primary',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.09)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5}>
        <Stack direction="row" alignItems="flex-start" gap={1.5}>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 900,
              lineHeight: 1,
              textDecoration: eliminado ? 'line-through' : 'none',
              textDecorationThickness: eliminado ? 3 : undefined,
            }}
          >
            {getCantidad(producto)}x
          </Typography>
          <Box>
            <Typography
              sx={{
                fontSize: 19,
                fontWeight: 800,
                lineHeight: 1.25,
                textDecoration: eliminado ? 'line-through' : 'none',
                textDecorationThickness: eliminado ? 3 : undefined,
              }}
            >
              {producto.nombreArticulo || producto.codigoArticulo || `Producto ${index + 1}`}
            </Typography>
            {!!producto.nota && (
              <Typography sx={{ mt: 0.5, color: 'text.secondary', fontWeight: 700 }}>
                {producto.nota}
              </Typography>
            )}
            {getProductoExtras(producto).length > 0 && (
              <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mt: 1 }}>
                {getProductoExtras(producto).map((extra) => (
                  <Chip key={extra} label={extra} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
        {tieneCambio && (
          <Chip
            label={getCambioLabel(producto.state)}
            color="error"
            size="small"
            sx={{ fontWeight: 900, textTransform: 'uppercase', flexShrink: 0 }}
          />
        )}
      </Stack>
    </Paper>
  )
}

const RestCocina: FunctionComponent = () => {
  const { user } = useAuth()
  const codigoSucursal = user.sucursal.codigo
  const codigoPuntoVenta = user.puntoVenta.codigo
  const hoy = useMemo(() => formatFecha(new Date()), [])
  const query = useMemo(
    () =>
      `fechaDocumento>=${hoy} 00:00:00&fechaDocumento<=${hoy} 23:59:59&state!=FINALIZADO&state!=ANULADO&state!=CANCELADO`,
    [hoy],
  )

  const {
    data: pedidosData,
    isLoading,
    isFetching,
  } = useRestPedidoListado(
    {
      entidad: { codigoSucursal, codigoPuntoVenta },
      limit: 200,
      reverse: true,
      query,
    },
    { refetchInterval: 8000, staleTime: 0 },
  )

  const pedidos = useMemo(() => pedidosData?.docs ?? [], [pedidosData])
  const [estados, setEstados] = useState<Record<string, CocinaEstadoLocal>>(leerEstados)
  const [vozActiva, setVozActiva] = useState(() => localStorage.getItem('restaurante:cocina:voz') === 'true')
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'info' | 'success' | 'warning'
  }>({ open: false, message: '', severity: 'info' })
  const firmasRef = useRef<Record<string, string>>({})
  const snapshotsRef = useRef<Record<string, Map<string, ProductoSnapshot>>>({})
  const pedidosNumeroRef = useRef<Record<string, number>>({})
  const pedidosInicializadosRef = useRef(false)
  const pedidosIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    guardarEstados(estados)
  }, [estados])

  useEffect(() => {
    localStorage.setItem('restaurante:cocina:voz', String(vozActiva))
  }, [vozActiva])

  useEffect(() => {
    setEstados((actuales) => {
      let changed = false
      const next = { ...actuales }
      const pedidosIds = new Set(pedidos.map((pedido) => pedido._id).filter(Boolean) as string[])

      pedidos.forEach((pedido) => {
        if (!pedido._id) return
        const firmaCambios = getFirmaCambios(pedido)
        const firmaContenido = getFirmaContenido(pedido)
        const actual = next[pedido._id]

        if (!actual) {
          next[pedido._id] = {
            estado: 'PENDIENTE',
            cambiosEntendidos: true,
            firmaCambios,
            firmaContenido,
          }
          changed = true
          return
        }

        if (!actual.firmaContenido) {
          next[pedido._id] = { ...actual, cambiosEntendidos: true, firmaCambios, firmaContenido }
          changed = true
          return
        }

        if (actual.firmaContenido !== firmaContenido) {
          next[pedido._id] = { ...actual, cambiosEntendidos: false, firmaCambios, firmaContenido }
          changed = true
        }
      })

      Object.keys(next).forEach((pedidoId) => {
        if (!pedidosIds.has(pedidoId)) {
          delete next[pedidoId]
          changed = true
        }
      })

      return changed ? next : actuales
    })
  }, [pedidos])

  const avisar = useCallback(
    (message: string, severity: 'info' | 'success' | 'warning' = 'info', voz?: string) => {
      setSnackbar({ open: true, message, severity })
      if (vozActiva && voz) hablar(voz)
    },
    [vozActiva],
  )

  useEffect(() => {
    if (!pedidosInicializadosRef.current) {
      pedidosIdsRef.current = new Set(pedidos.map((pedido) => pedido._id).filter(Boolean) as string[])
      pedidos.forEach((pedido) => {
        if (pedido._id) {
          firmasRef.current[pedido._id] = getFirmaContenido(pedido)
          snapshotsRef.current[pedido._id] = getPedidoSnapshot(pedido)
          pedidosNumeroRef.current[pedido._id] = getNumeroPedido(pedido)
        }
      })
      pedidosInicializadosRef.current = true
      return
    }

    const idsActuales = new Set(pedidos.map((pedido) => pedido._id).filter(Boolean) as string[])

    pedidos.forEach((pedido) => {
      if (!pedido._id) return
      if (!pedidosIdsRef.current.has(pedido._id)) {
        avisar(`Pedido nuevo #${getNumeroPedido(pedido)}`, 'success', getPedidoVoz(pedido))
      }

      const firma = getFirmaContenido(pedido)
      const anterior = firmasRef.current[pedido._id]
      const snapshotAnterior = snapshotsRef.current[pedido._id]
      firmasRef.current[pedido._id] = firma
      snapshotsRef.current[pedido._id] = getPedidoSnapshot(pedido)
      pedidosNumeroRef.current[pedido._id] = getNumeroPedido(pedido)
      if (
        !anterior ||
        anterior === firma ||
        !firma ||
        !snapshotAnterior ||
        !pedidosIdsRef.current.has(pedido._id)
      )
        return

      const cambios = getCambiosPedido(pedido)
      const eliminado = cambios.find((producto) => producto.state === 'ELIMINADO')
      const primero = eliminado || cambios[0]
      const nombre = primero?.nombreArticulo || primero?.codigoArticulo || 'producto'
      const accion = eliminado ? 'Producto eliminado' : 'Pedido actualizado'
      const vozDelta = getDeltaPedidoVoz(pedido, snapshotAnterior)
      avisar(
        `${accion}: ${nombre}`,
        'warning',
        vozDelta || `Pedido ${getNumeroPedido(pedido)}, pedido actualizado`,
      )
    })

    Object.keys(snapshotsRef.current).forEach((pedidoId) => {
      if (!idsActuales.has(pedidoId)) delete snapshotsRef.current[pedidoId]
    })
    Object.keys(firmasRef.current).forEach((pedidoId) => {
      if (!idsActuales.has(pedidoId)) delete firmasRef.current[pedidoId]
    })
    pedidosIdsRef.current.forEach((pedidoId) => {
      if (idsActuales.has(pedidoId)) return
      const estadoLocal = estados[pedidoId]?.estado
      if (estadoLocal === 'LISTO') return
      const numero = pedidosNumeroRef.current[pedidoId]
      avisar(
        `Pedido #${numero || ''} cancelado`,
        'warning',
        numero ? `Pedido ${numero}, cancelado` : 'Pedido cancelado',
      )
    })
    Object.keys(pedidosNumeroRef.current).forEach((pedidoId) => {
      if (!idsActuales.has(pedidoId)) delete pedidosNumeroRef.current[pedidoId]
    })

    pedidosIdsRef.current = idsActuales
  }, [avisar, estados, pedidos])

  const pedidosPorEstado = useMemo(() => {
    return estadoColumnas.reduce(
      (acc, columna) => {
        acc[columna.estado] = pedidos
          .filter((pedido) => (estados[pedido._id ?? '']?.estado ?? 'PENDIENTE') === columna.estado)
          .sort((a, b) => {
            const fechaA = a.updatedAt || a.createdAt || a.fechaDocumento || ''
            const fechaB = b.updatedAt || b.createdAt || b.fechaDocumento || ''
            return columna.estado === 'LISTO' ? fechaB.localeCompare(fechaA) : fechaA.localeCompare(fechaB)
          })
        return acc
      },
      {} as Record<CocinaPedidoEstado, RestPedido[]>,
    )
  }, [estados, pedidos])

  const actualizarEstado = (pedido: RestPedido, estado: CocinaPedidoEstado) => {
    if (!pedido._id) return
    const firmaCambios = getFirmaCambios(pedido)

    setEstados((actuales) => ({
      ...actuales,
      [pedido._id!]: {
        ...(actuales[pedido._id!] ?? {}),
        estado,
        cambiosEntendidos: estado === 'LISTO' ? true : actuales[pedido._id!]?.cambiosEntendidos,
        firmaCambios,
        firmaContenido: getFirmaContenido(pedido),
      },
    }))

    const numero = getNumeroPedido(pedido)
    if (estado === 'PREPARACION') {
      avisar(`Orden #${numero} en preparación`, 'info', `Orden ${numero} en preparación`)
    }

    if (estado === 'LISTO') {
      const payload: CocinaPedidoListoPayload = {
        id: pedido._id,
        numero,
        hora: getHoraPedido(pedido),
        at: new Date().toISOString(),
      }
      localStorage.setItem(COCINA_PEDIDO_LISTO_KEY, JSON.stringify(payload))
      window.dispatchEvent(
        new CustomEvent<CocinaPedidoListoPayload>(COCINA_PEDIDO_LISTO_EVENT, { detail: payload }),
      )
      avisar(`Orden #${numero} lista para entregar`, 'success', `Orden ${numero} lista`)
    }
  }

  const entenderCambios = (pedido: RestPedido) => {
    if (!pedido._id) return
    setEstados((actuales) => ({
      ...actuales,
      [pedido._id!]: {
        ...(actuales[pedido._id!] ?? { estado: 'PENDIENTE' }),
        cambiosEntendidos: true,
        firmaCambios: getFirmaCambios(pedido),
        firmaContenido: getFirmaContenido(pedido),
      },
    }))
    avisar(`Cambios de la orden #${getNumeroPedido(pedido)} confirmados`, 'warning', 'Cambios confirmados')
  }

  const probarVoz = () => {
    hablar('Hamburguesa Clásica')
    setSnackbar({ open: true, message: 'Prueba de voz: Hamburguesa Clásica', severity: 'info' })
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, bgcolor: '#f4f6f8', minHeight: 'calc(100vh - 56px)' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        gap={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <RestaurantMenuOutlinedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Cocina
          </Typography>
          {isFetching && !isLoading && <CircularProgress size={18} />}
        </Stack>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <FormControlLabel
            control={<Switch checked={vozActiva} onChange={(event) => setVozActiva(event.target.checked)} />}
            label={
              <Stack direction="row" alignItems="center" gap={0.75}>
                <VolumeUpOutlinedIcon fontSize="small" />
                <Typography sx={{ fontWeight: 700 }}>Voz</Typography>
              </Stack>
            }
          />
          <Button variant="outlined" startIcon={<PlayArrowOutlinedIcon />} onClick={probarVoz}>
            Probar voz
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 220,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CircularProgress />
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {estadoColumnas.map((columna) => {
            const pedidosColumna = pedidosPorEstado[columna.estado] ?? []
            return (
              <Grid key={columna.estado} size={{ xs: 12, md: 4 }}>
                <Stack direction="row" alignItems="center" gap={1.25} sx={{ mb: 1.5 }}>
                  <Box sx={{ width: 13, height: 13, borderRadius: '50%', bgcolor: columna.color }} />
                  <Typography sx={{ fontSize: 25, fontWeight: 900 }}>{columna.titulo}</Typography>
                  <Badge
                    badgeContent={pedidosColumna.length}
                    color="default"
                    sx={{
                      ml: 'auto',
                      '& .MuiBadge-badge': {
                        position: 'static',
                        transform: 'none',
                        minWidth: 44,
                        height: 36,
                        borderRadius: 18,
                        fontSize: 16,
                        fontWeight: 900,
                      },
                    }}
                  />
                </Stack>

                {pedidosColumna.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      bgcolor: 'transparent',
                      minHeight: 116,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>{columna.empty}</Typography>
                  </Paper>
                ) : (
                  <Stack gap={2}>
                    {pedidosColumna.map((pedido) => {
                      const pedidoId = pedido._id ?? ''
                      const cambios = getCambiosPedido(pedido)
                      const estadoLocal = estados[pedidoId] ?? {
                        estado: 'PENDIENTE',
                        cambiosEntendidos: false,
                      }
                      const requiereEnterado = cambios.length > 0 && !estadoLocal.cambiosEntendidos
                      const productosVisibles = [
                        ...(pedido.productos ?? []),
                        ...(pedido.productosEliminados ?? []).map((p) => ({ ...p, state: 'ELIMINADO' })),
                      ]
                      const headerColor =
                        estadoLocal.estado === 'LISTO'
                          ? '#00bd7e'
                          : estadoLocal.estado === 'PREPARACION'
                            ? '#ff9800'
                            : '#263238'

                      return (
                        <Paper
                          key={pedidoId || getNumeroPedido(pedido)}
                          elevation={0}
                          sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: requiereEnterado ? 'error.light' : 'divider',
                            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.12)',
                          }}
                        >
                          <Box sx={{ bgcolor: headerColor, color: 'common.white', p: 2 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                <Typography sx={{ fontSize: 25, fontWeight: 900 }}>
                                  #{getNumeroPedido(pedido)}
                                </Typography>
                                {pedido.updatedAt && (
                                  <Chip
                                    label="Actualizado"
                                    size="small"
                                    sx={{
                                      bgcolor: alpha('#fff', 0.18),
                                      color: 'common.white',
                                      fontWeight: 900,
                                    }}
                                  />
                                )}
                                {requiereEnterado && (
                                  <Chip label="Cambios" size="small" color="error" sx={{ fontWeight: 900 }} />
                                )}
                              </Stack>
                              <Typography sx={{ fontWeight: 900 }}>{getHoraPedido(pedido)}</Typography>
                            </Stack>
                          </Box>

                          <Stack gap={1.5} sx={{ p: 2, bgcolor: 'grey.50' }}>
                            {productosVisibles.length === 0 ? (
                              <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>
                                Sin productos
                              </Typography>
                            ) : (
                              productosVisibles.map((producto, index) => (
                                <CocinaProductoItem
                                  key={`${getProductoKey(producto, index)}-${producto.state ?? ''}`}
                                  producto={producto}
                                  index={index}
                                />
                              ))
                            )}
                          </Stack>

                          <Divider />
                          <Stack gap={1.25} sx={{ p: 2 }}>
                            {requiereEnterado && (
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CheckCircleOutlineIcon />}
                                onClick={() => entenderCambios(pedido)}
                                fullWidth
                                sx={{ minHeight: 48, fontWeight: 900 }}
                              >
                                Enterado de los cambios
                              </Button>
                            )}

                            {estadoLocal.estado === 'PENDIENTE' && (
                              <Button
                                variant="contained"
                                color="warning"
                                startIcon={<RestaurantMenuOutlinedIcon />}
                                onClick={() => actualizarEstado(pedido, 'PREPARACION')}
                                fullWidth
                                sx={{ minHeight: 52, fontWeight: 900 }}
                              >
                                En preparación
                              </Button>
                            )}

                            {estadoLocal.estado !== 'LISTO' && (
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<DoneAllOutlinedIcon />}
                                disabled={requiereEnterado}
                                onClick={() => actualizarEstado(pedido, 'LISTO')}
                                fullWidth
                                sx={{ minHeight: 52, fontWeight: 900 }}
                              >
                                Marcar como listo
                              </Button>
                            )}

                            {estadoLocal.estado === 'LISTO' && (
                              <Alert icon={<NotificationsActiveOutlinedIcon />} severity="success">
                                Orden lista
                              </Alert>
                            )}
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                )}
              </Grid>
            )
          })}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2200}
        onClose={() => setSnackbar((actual) => ({ ...actual, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ minWidth: 280 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RestCocina
