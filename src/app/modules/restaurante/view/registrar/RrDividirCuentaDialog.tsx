import { WarningAmber } from '@mui/icons-material'
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined'
import CloseIcon from '@mui/icons-material/Close'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import {
  alpha,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'

import { searchClientsApi } from '../../../clients/api/searchClients.api'
import InputSearchClients from '../../../clients/components/InputSearchClients'
import { ClientProps } from '../../../clients/interfaces/client'
import { MesaUI } from '../../interfaces/mesa.interface'
import { ArticuloOperacion } from '../../types'
import RrCobroDialog, { PagoRealizado } from './RrCobroDialog'

// ─── Helpers ────────────────────────────────────────────────────────────────

const calcPrecioItem = (item: ArticuloOperacion): number => {
  if (item.cortesia) return 0
  const precio = item.articuloPrecio?.valor ?? item.articuloPrecio?.monedaPrecio?.precio ?? 0
  const cantidad = item.articuloPrecio?.cantidad ?? item.articuloPrecioBase?.cantidad ?? 1
  const complementosPrecio =
    item.complementos?.reduce((sum, c) => {
      const cp = c.articuloPrecio?.valor ?? c.articuloPrecio?.monedaPrecio?.precio ?? 0
      const cq = c.articuloPrecio?.cantidad ?? c.articuloPrecioBase?.cantidad ?? 1
      return sum + Number(cp) * Number(cq)
    }, 0) ?? 0
  return Number(precio) * Number(cantidad) + complementosPrecio
}

const formatPrice = (value: number): string =>
  `BOB ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ─── Props ───────────────────────────────────────────────────────────────────

export interface RrDividirCuentaDialogProps {
  open: boolean
  onClose: () => void
  mesaSeleccionada: MesaUI
  /** Se llama cuando la división se completó exitosamente. Recibe los productos QUE QUEDAN en la mesa original y el pedido actualizado del servidor. */
  onDividido: (productosRestantes: ArticuloOperacion[], pedidoActualizado: any) => void
  /** Función para registrar un pedido nuevo (los productos divididos) */
  registrarPedido: (payload: any) => Promise<any>
  /** Función para actualizar el pedido original (quitarle los productos divididos) */
  actualizarPedido: (payload: any) => Promise<any>
  /** Función para finalizar un pedido (cobro sin factura) */
  finalizarPedido: (payload: any) => Promise<any>
  /** Función para facturar un pedido */
  facturarPedido: (payload: any) => Promise<any>
  user: any
  isPending?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

const RrDividirCuentaDialog: FunctionComponent<RrDividirCuentaDialogProps> = ({
  open,
  onClose,
  mesaSeleccionada,
  onDividido,
  registrarPedido,
  actualizarPedido,
  finalizarPedido,
  facturarPedido,
  user,
  isPending: externalPending = false,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const productos: ArticuloOperacion[] = mesaSeleccionada.pedido?.productos ?? []

  // Set de índices seleccionados para la división
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set())

  // Cliente para el nuevo pedido dividido.
  // Mismo patrón que RrCarrito: ref para caché, setState solo si null.
  const defaultClientRef = useRef<ClientProps | null>(null)
  const [clienteDividido, setClienteDividido] = useState<ClientProps | null>(null)

  const fetchDefaultClient = useCallback(() => {
    // Si ya está cacheado, no hacer otra llamada de red
    if (defaultClientRef.current) return
    searchClientsApi('00')
      .then((resp) => {
        const found = resp.find((c) => c.codigoCliente === '00') || resp[0] || null
        defaultClientRef.current = found
        // Solo asignar si el usuario no seleccionó otro cliente
        setClienteDividido((prev) => prev ?? found)
      })
      .catch(() => {})
  }, [])

  // Efecto 1: cargar cliente 00 una sola vez al montar el componente
  useEffect(() => {
    fetchDefaultClient()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Efecto 2: cuando el dialog se abre, resetear la selección y restaurar el cliente default
  useEffect(() => {
    if (open) {
      setSeleccionados(new Set())
      // Restaurar el cliente 00 desde la caché (sincrónico, sin setState condicional)
      setClienteDividido(defaultClientRef.current)
    }
  }, [open])

  // ── Estado para el RrCobroDialog del pedido dividido ─────────────────────

  const [pedidoDivididoRegistrado, setPedidoDivididoRegistrado] = useState<any | null>(null)
  const [openCobro, setOpenCobro] = useState(false)
  const [pagosRealizados, setPagosRealizados] = useState<PagoRealizado[]>([])
  const [isCobroPending, setIsCobroPending] = useState(false)
  // Snapshot del subtotal al momento de iniciar el cobro.
  // Necesario porque cuando onDividido actualiza mesaSeleccionada los productos
  // cambian y subtotalDividido (calculado live) se vuelve 0.
  const [subtotalSnap, setSubtotalSnap] = useState(0)

  // ── Lógica de selección ───────────────────────────────────────────────────

  const toggleSeleccion = (idx: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  const productosSeleccionados = productos.filter((_, i) => seleccionados.has(i))
  const productosRestantes = productos.filter((_, i) => !seleccionados.has(i))

  const totalSeleccionado = productosSeleccionados.reduce((sum, p) => sum + calcPrecioItem(p), 0)

  // Al menos 1 producto debe quedar en la mesa original
  const puedeCobrar = seleccionados.size > 0 && productosRestantes.length >= 1

  // ── Construir payload de pedido ───────────────────────────────────────────

  const buildProductosInput = (items: ArticuloOperacion[]) =>
    items.map((p) => ({
      nroItem: p.nroItem,
      codigoArticulo: p.codigoArticulo || '',
      codigoAlmacen: p.almacen?.codigoAlmacen || '0',
      ...((p as any).verificarStock && p.lote ? { codigoLote: p.lote?.codigoLote || '' } : {}),
      articuloPrecio: {
        codigoArticuloUnidadMedida:
          (p as any).articuloUnidadMedida?.codigoUnidadMedida ??
          p.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ??
          p.articuloPrecioBase?.articuloUnidadMedida?.codigoUnidadMedida ??
          '',
        cantidad: p.articuloPrecio?.cantidad ?? p.articuloPrecioBase?.cantidad ?? 1,
        precio:
          p.articuloPrecio?.valor ??
          p.articuloPrecio?.monedaPrecio?.precio ??
          p.articuloPrecioBase?.valor ??
          0,
        descuento: p.articuloPrecio?.descuento ?? 0,
        impuesto: p.articuloPrecio?.impuesto ?? 0,
      },
      nota: p.nota ?? null,
      notaRapida: p.notaRapida?.map((n) => ({ valor: n.valor, cantidad: n.cantidad })),
      cortesia: p.cortesia ?? false,
      complementos: p.complementos?.map((c) => ({
        codigoArticulo: c.codigoArticulo || '',
        codigoAlmacen: c.almacen?.codigoAlmacen || '0',
        ...((c as any).verificarStock && c.lote ? { codigoLote: c.lote?.codigoLote || '' } : {}),
        articuloPrecio: {
          codigoArticuloUnidadMedida:
            (c as any).articuloUnidadMedida?.codigoUnidadMedida ??
            c.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ??
            c.articuloPrecioBase?.articuloUnidadMedida?.codigoUnidadMedida ??
            '',
          cantidad: c.articuloPrecioBase?.cantidad ?? 1,
          precio: c.articuloPrecioBase?.valor ?? c.articuloPrecioBase?.monedaPrecio?.precio ?? 0,
          descuento: 0,
          impuesto: 0,
        },
      })),
    }))

  // ── Acción principal: registrar nuevo pedido y actualizar original ────────

  const procesarDivisionBackend = async () => {
    // Si ya creamos el pedido dividido (ej: un intento de cobro falló y lo reintenta), lo reutilizamos
    if (pedidoDivididoRegistrado?._id) return pedidoDivididoRegistrado

    if (!mesaSeleccionada.pedido?._id) throw new Error('La mesa no tiene un pedido abierto.')

    const mesaNuevaNombre = `D-${mesaSeleccionada.value}`
    const entidad = {
      codigoSucursal: user.sucursal.codigo,
      codigoPuntoVenta: user.puntoVenta.codigo,
    }
    const clienteInput = {
      codigoCliente: clienteDividido?.codigoCliente || '00',
      razonSocial: clienteDividido?.razonSocial || 'Sin Razón Social',
      email: clienteDividido?.email,
      telefono: clienteDividido?.telefono,
      direccion: clienteDividido?.direccion,
    }

    // 1. Registrar NUEVO pedido
    const nuevoPedido = await registrarPedido({
      entidad,
      cliente: clienteInput,
      input: {
        mesa: { nombre: mesaNuevaNombre, ubicacion: null, nroComensales: 1 },
        productos: buildProductosInput(productosSeleccionados),
        codigoMoneda: user.moneda.codigo,
        tipoCambio: user.moneda.tipoCambio || 1,
        tipo: null,
        nota: `División de ${mesaSeleccionada.label}`,
        espacioId: null,
        atributo4: 'fromDivision:true',
      },
    })

    // 2. Actualizar pedido ORIGINAL
    const cachedUbicacion = localStorage.getItem('ubicacion')
    const ubicacionId = cachedUbicacion ? JSON.parse(cachedUbicacion)._id : null

    const pedidoActualizado = await actualizarPedido({
      id: mesaSeleccionada.pedido._id,
      entidad,
      cliente: {
        codigoCliente: mesaSeleccionada.pedido.cliente?.codigoCliente || '00',
        razonSocial: mesaSeleccionada.pedido.cliente?.razonSocial || 'Sin Razón Social',
        email: mesaSeleccionada.pedido.cliente?.email,
        telefono: mesaSeleccionada.pedido.cliente?.telefono,
        direccion: mesaSeleccionada.pedido.cliente?.direccion,
      },
      input: {
        mesa: {
          nombre: mesaSeleccionada.value,
          ubicacion: ubicacionId,
          nroComensales: 1,
        },
        productos: buildProductosInput(productosRestantes),
        codigoMoneda: user.moneda.codigo,
        tipoCambio: user.moneda.tipoCambio || 1,
        tipo: mesaSeleccionada.pedido.tipo ?? null,
        nota: mesaSeleccionada.pedido.nota || '',
        espacioId: ubicacionId,
        atributo4: 'fromDivision:true',
      },
    })

    setPedidoDivididoRegistrado(nuevoPedido)
    onDividido(productosRestantes, pedidoActualizado)
    return nuevoPedido
  }

  const handleCobrar = () => {
    if (!puedeCobrar || !mesaSeleccionada.pedido?._id) return

    // Snapshot del subtotal antes de cualquier cambio de estado externo
    const subtotalActual = subtotalDividido
    setSubtotalSnap(subtotalActual)

    // Solo abrimos el dialog de cobro. La división del pedido en el backend
    // ocurrirá en el instante en que el usuario pulse Finalizar o Facturar.
    setOpenCobro(true)
  }

  // ── Calcular subtotal del pedido dividido para RrCobroDialog ─────────────

  const subtotalDividido = productosSeleccionados.reduce((sum, p) => sum + calcPrecioItem(p), 0)

  const handleCerrarTodo = () => {
    setOpenCobro(false)
    setPedidoDivididoRegistrado(null)
    setPagosRealizados([])
    onClose()
  }

  const formatTarjeta = (num?: string): string => {
    if (!num) return '0000000000000000'
    const clean = num.replace(/\D/g, '')
    if (!clean) return '0000000000000000'
    if (clean.length === 16) return clean
    if (clean.length <= 4) return clean.padStart(16, '0')
    const first4 = clean.substring(0, 4)
    const last4 = clean.substring(clean.length - 4)
    return first4 + '0'.repeat(8) + last4
  }

  const handleFinalizarDividido = async (
    metodoDefectoId?: number,
    metodoDefectoNombre?: string,
    inputNumeroTarjeta?: string,
  ) => {
    setIsCobroPending(true)
    try {
      const pedidoReal = await procesarDivisionBackend()
      if (!pedidoReal?._id) throw new Error('No se pudo crear el pedido dividido en el backend.')
      let pagosFinales = pagosRealizados
      if (pagosFinales.length === 0) {
        pagosFinales = [
          {
            id: 'pago-defecto',
            metodoId: metodoDefectoId || 1,
            metodoNombre: metodoDefectoNombre || 'Efectivo',
            monto: subtotalSnap,
            numeroTarjeta: inputNumeroTarjeta,
          },
        ]
      }
      await finalizarPedido({
        id: pedidoReal._id,
        entidad: {
          codigoSucursal: user.sucursal.codigo,
          codigoPuntoVenta: user.puntoVenta.codigo,
        },
        cliente: {
          codigoCliente: clienteDividido?.codigoCliente || '00',
          razonSocial: clienteDividido?.razonSocial || 'Sin Razón Social',
        },
        numeroPedido: pedidoReal.numeroPedido || 0,
        input: {
          codigoMoneda: user.moneda?.codigo || 1,
          codigoMetodoPago: pagosFinales[0].metodoId,
          montoTotal: subtotalSnap,
          usuario: user.correo || '',
        } as any,
        metodoPagoVenta: pagosFinales.map((p) => ({
          codigoMetodoPago: p.metodoId,
          monto: p.monto,
        })),
      })
      handleCerrarTodo()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al finalizar')
    } finally {
      setIsCobroPending(false)
    }
  }

  const handleFacturarDividido = async (
    metodoDefectoId?: number,
    metodoDefectoNombre?: string,
    inputNumeroTarjeta?: string,
  ) => {
    setIsCobroPending(true)
    try {
      const pedidoReal = await procesarDivisionBackend()
      if (!pedidoReal?._id) throw new Error('No se pudo crear el pedido dividido en el backend.')
      let pagosFinales = pagosRealizados
      if (pagosFinales.length === 0) {
        pagosFinales = [
          {
            id: 'pago-defecto',
            metodoId: metodoDefectoId || 1,
            metodoNombre: metodoDefectoNombre || 'Efectivo',
            monto: subtotalSnap,
            numeroTarjeta: inputNumeroTarjeta,
          },
        ]
      }
      const metodoPrincipal = pagosFinales[0].metodoId
      await finalizarPedido({
        id: pedidoReal._id,
        entidad: {
          codigoSucursal: user.sucursal.codigo,
          codigoPuntoVenta: user.puntoVenta.codigo,
        },
        cliente: {
          codigoCliente: clienteDividido?.codigoCliente || '00',
          razonSocial: clienteDividido?.razonSocial || 'Sin Razón Social',
        },
        numeroPedido: pedidoReal.numeroPedido || 0,
        input: {
          codigoMoneda: user.moneda?.codigo || 1,
          codigoMetodoPago: metodoPrincipal,
          numeroTarjeta: metodoPrincipal === 2 ? formatTarjeta(pagosFinales[0].numeroTarjeta) : undefined,
          montoTotal: subtotalSnap,
          usuario: user.correo || '',
        } as any,
        metodoPagoVenta: pagosFinales.map((p) => ({
          codigoMetodoPago: p.metodoId,
          monto: p.monto,
        })),
      })
      await facturarPedido({
        entidad: {
          codigoSucursal: user.sucursal.codigo,
          codigoPuntoVenta: user.puntoVenta.codigo,
        },
        cliente: {
          codigoCliente: clienteDividido?.codigoCliente || '00',
          razonSocial: clienteDividido?.razonSocial || 'Sin Razón Social',
          email: clienteDividido?.email,
          telefono: clienteDividido?.telefono,
        },
        numeroPedido: pedidoReal.numeroPedido || 0,
        input: {
          codigoMoneda: user.moneda?.codigo || 1,
          codigoMetodoPago: metodoPrincipal,
          numeroTarjeta: metodoPrincipal === 2 ? formatTarjeta(pagosFinales[0].numeroTarjeta) : undefined,
          tipoCambio: user.moneda?.tipoCambio || 1,
          usuario: user.correo || '',
        },
      })
      handleCerrarTodo()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al facturar')
    } finally {
      setIsCobroPending(false)
    }
  }

  // CRÍTICO: usar useCallback para que onClientSelect sea una referencia estable.
  // InputSearchClients tiene un useEffect con fetchDefaultClient como dep, que a su vez
  // depende de onClientSelect. Si onClientSelect es inline (recrea en cada render),
  // genera un loop infinito: onClientSelect cambia → fetchDefaultClient cambia →
  // useEffect corre → setState → re-render → onClientSelect recrea → infinito.
  const handleClientSelect = useCallback((c: ClientProps | null) => {
    if (c) setClienteDividido(c)
  }, [])

  const handleChangeEditable = useCallback((mods: any) => {
    if (mods) {
      setClienteDividido((prev) => {
        if (!prev) return prev
        // Evitar loop infinito: solo recrear objeto si hay diferencias
        let hasChanges = false
        for (const key of Object.keys(mods)) {
          if ((prev as any)[key] !== mods[key]) {
            hasChanges = true
            break
          }
        }
        if (!hasChanges) return prev
        return { ...prev, ...mods }
      })
    }
  }, [])

  const isPending = externalPending

  return (
    <>
      <Dialog
        open={open}
        onClose={isPending ? undefined : onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 800,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 36,
              height: 36,
              borderRadius: 2,
            }}
          >
            <CallSplitOutlinedIcon fontSize="small" />
          </Box>
          Dividir Cuenta
          <IconButton
            onClick={onClose}
            disabled={isPending}
            size="small"
            sx={{ ml: 'auto', color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 1 }}>
          {/* Instrucción */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona los productos a separar. Al menos 1 producto debe quedar en{' '}
            <strong>{mesaSeleccionada.label}</strong>.
          </Typography>

          {/* Lista de productos con checkboxes */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {productos.length === 0 && (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}
              >
                No hay productos en este pedido.
              </Typography>
            )}
            {productos.map((producto, idx) => {
              const isChecked = seleccionados.has(idx)
              const precio = calcPrecioItem(producto)
              const cantidad = producto.articuloPrecio?.cantidad ?? producto.articuloPrecioBase?.cantidad ?? 1
              const isCortesia = !!producto.cortesia

              return (
                <Box
                  key={`${producto.articuloId || idx}-${idx}`}
                  onClick={() => toggleSeleccion(idx)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: isChecked ? theme.palette.primary.main : 'divider',
                    borderRadius: 2,
                    bgcolor: isChecked
                      ? alpha(theme.palette.primary.main, isDark ? 0.15 : 0.05)
                      : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.light,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={() => toggleSeleccion(idx)}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                    sx={{ p: 0.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      {cantidad > 1 && (
                        <Typography component="span" fontWeight={900} color="primary.main" sx={{ mr: 0.5 }}>
                          {cantidad}x
                        </Typography>
                      )}
                      {producto.nombreArticulo}
                    </Typography>
                    {isCortesia && (
                      <Typography variant="caption" color="success.main" fontWeight={700}>
                        Cortesía (Gratis)
                      </Typography>
                    )}
                    {/* Complementos */}
                    {(producto.complementos?.length ?? 0) > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        + {producto.complementos!.map((c) => c.nombreArticulo).join(', ')}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    color={isCortesia ? 'success.main' : 'text.primary'}
                    sx={{ flexShrink: 0 }}
                  >
                    {isCortesia ? 'Gratis' : formatPrice(precio)}
                  </Typography>
                </Box>
              )
            })}
          </Box>

          {/* Total seleccionado */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: isDark ? alpha(theme.palette.background.default, 0.5) : '#f8fafc',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
              sx={{ letterSpacing: '0.08em' }}
            >
              TOTAL SELECCIONADO
            </Typography>
            <Typography
              variant="h6"
              fontWeight={900}
              color={seleccionados.size > 0 ? 'text.primary' : 'text.disabled'}
            >
              {formatPrice(totalSeleccionado)}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Selector de cliente para el pedido dividido */}
          <Typography
            variant="caption"
            fontWeight={800}
            color="text.secondary"
            sx={{ letterSpacing: '0.08em', mb: 1, display: 'block' }}
          >
            CLIENTE (PARA EL PEDIDO DIVIDIDO)
          </Typography>
          <InputSearchClients
            hideLabel={true}
            value={clienteDividido}
            withCreditLine={false}
            onClientSelect={handleClientSelect}
            onListShowed={() => {}}
            editable={true}
            onChangeEditable={handleChangeEditable}
          />

          {/* Advertencia mínimo de productos */}
          {seleccionados.size > 0 && productosRestantes.length === 0 && (
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              }}
            >
              <WarningAmber
                sx={{
                  fontSize: 20,
                  color: theme.palette.warning.main,
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.warning.dark,
                }}
              >
                Debes dejar al menos un producto en la {mesaSeleccionada.label}.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isPending}
              sx={{ flex: 1, borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleCobrar}
              disabled={!puedeCobrar || isPending}
              startIcon={
                isPending ? <CircularProgress size={16} color="inherit" /> : <PaymentsOutlinedIcon />
              }
              sx={{
                flex: 2,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                bgcolor: '#2e7d32',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(46,125,50,0.35)',
                '&:hover': { bgcolor: '#1b5e20' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
              }}
            >
              {isPending ? 'Procesando...' : `Cobrar ${formatPrice(totalSeleccionado)}`}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* RrCobroDialog para el pedido dividido */}
      {openCobro && (
        <RrCobroDialog
          open={openCobro}
          onClose={handleCerrarTodo}
          isProcessing={isCobroPending}
          subtotal={subtotalSnap}
          descuento={0}
          giftcard={0}
          totalAPagar={subtotalSnap}
          clienteInfo={
            clienteDividido && clienteDividido.codigoCliente !== '00'
              ? `Cobro a: ${clienteDividido.razonSocial || clienteDividido.nombres || clienteDividido.codigoCliente}`
              : 'Cobro a: Sin Razón Social'
          }
          pagosRealizados={pagosRealizados}
          onAddPago={(metodoId, metodoNombre, monto, numeroTarjeta) =>
            setPagosRealizados((prev) => [
              ...prev,
              { id: Date.now().toString(), metodoId, metodoNombre, monto, numeroTarjeta },
            ])
          }
          onRemovePago={(id) => setPagosRealizados((prev) => prev.filter((p) => p.id !== id))}
          onFinalizar={handleFinalizarDividido}
          onFacturar={handleFacturarDividido}
        />
      )}
    </>
  )
}

export default RrDividirCuentaDialog
