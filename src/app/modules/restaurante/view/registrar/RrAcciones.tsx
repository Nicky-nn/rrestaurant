import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined'
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined'
import { alpha, Box, Button, Divider, Stack, Typography, useTheme } from '@mui/material'
import { FunctionComponent, useMemo, useState } from 'react'

import MontoMonedaTexto from '../../../../base/components/PopoverMonto/MontoMonedaTexto'
import useAuth from '../../../../base/hooks/useAuth'
import { MesaUI } from '../../interfaces/mesa.interface'
import { useRestPedidoActualizar } from '../../mutations/useRestPedidoActualizar'
import { useRestPedidoRegistrarCompletar } from '../../mutations/useRestPedidoRegistrarCompletar'
import { RestPedidoExpressInput } from '../../types'

interface RrAccionesProps {
  mesaSeleccionada?: MesaUI | null
  onSuccess?: (pedidoRetornado?: any) => void
}

/**
 * RrAcciones
 * Panel de acciones del pedido.
 * Contiene botones para confirmar, cancelar, imprimir u otras operaciones finales del pedido.
 */
const RrAcciones: FunctionComponent<RrAccionesProps> = ({ mesaSeleccionada, onSuccess }) => {
  const theme = useTheme()
  const { user } = useAuth()
  const [descuento, setDescuento] = useState<number>(0)
  const [giftcard, setGiftcard] = useState<number>(0)

  const { mutateAsync: registrarPedido, isPending: isRegistrarPending } = useRestPedidoRegistrarCompletar()
  const { mutateAsync: actualizarPedido, isPending: isActualizarPending } = useRestPedidoActualizar()
  
  const isPending = isRegistrarPending || isActualizarPending

  const handleRegistrar = async () => {
    if (!mesaSeleccionada?.pedido) return

    const { pedido, value: mesaNombre } = mesaSeleccionada

    try {
      const cachedUbicacion = localStorage.getItem('ubicacion')
      const ubicacionId = cachedUbicacion ? JSON.parse(cachedUbicacion)._id : null

      const input: RestPedidoExpressInput = {
        mesa: {
          nombre: mesaNombre,
          ubicacion: ubicacionId,
          nroComensales: 1,
        },
        productos: (pedido.productos ?? []).map((p) => ({
          nroItem: p.nroItem,
          codigoArticulo: p.codigoArticulo || '',
          codigoAlmacen: p.almacen?.codigoAlmacen || '0',
          ...(p.verificarStock && p.lote ? { codigoLote: p.lote?.codigoLote || '' } : {}),
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
        })),
        codigoMoneda: user.moneda.codigo,
        tipoCambio: user.moneda.tipoCambio || 1,
        tipo: ['DELIVERY', 'LLEVAR'].includes(pedido.tipo ?? '') ? pedido.tipo : null,
        nota: pedido.nota || '',
        espacioId: ubicacionId,
      } as any

      const isNuevo = !pedido._id || pedido._id.startsWith('nuevo-')
      let response

      const basePayload = {
        entidad: {
          codigoSucursal: user.sucursal.codigo,
          codigoPuntoVenta: user.puntoVenta.codigo,
        },
        cliente: {
          codigoCliente: pedido.cliente?.codigoCliente || '00',
          razonSocial: pedido.cliente?.razonSocial || 'Sin Razón Social',
          email: pedido.cliente?.email,
          telefono: pedido.cliente?.telefono,
          direccion: pedido.cliente?.direccion,
        },
        input,
      }

      if (isNuevo) {
        response = await registrarPedido(basePayload)
        console.log('Pedido registrado con datos', basePayload)
      } else {
        response = await actualizarPedido({ id: pedido._id!, ...basePayload })
        console.log('Pedido actualizado con datos', basePayload)
      }
      
      if (onSuccess) onSuccess(response)
    } catch (error) {
      console.error('Error al registrar pedido', error)
      alert(error instanceof Error ? error.message : 'Error al registrar pedido')
    }
  }

  const subtotal = useMemo(() => {
    let sub = 0
    if (mesaSeleccionada?.pedido?.productos) {
      mesaSeleccionada.pedido.productos.forEach((p) => {
        const isCortesia = p.cortesia || false
        if (isCortesia) return

        const precio = p.articuloPrecio?.valor ?? p.articuloPrecio?.monedaPrecio?.precio ?? 0
        const cantidad = p.articuloPrecio?.cantidad ?? p.articuloPrecioBase?.cantidad ?? 1
        sub += Number(precio) * Number(cantidad)

        if (p.complementos) {
          p.complementos.forEach((c) => {
            const cPrecio = c.articuloPrecio?.valor ?? c.articuloPrecio?.monedaPrecio?.precio ?? 0
            const cQty = c.articuloPrecio?.cantidad ?? c.articuloPrecioBase?.cantidad ?? 1
            sub += Number(cPrecio) * Number(cQty)
          })
        }
      })
    }
    return sub
  }, [mesaSeleccionada])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Resumen Totales */}
      <Box sx={{ px: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Subtotal
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {subtotal.toFixed(2)} BOB
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Descuento
          </Typography>
          <MontoMonedaTexto
            monto={descuento}
            editar={true}
            onChange={(val) => setDescuento(val || 0)}
            sigla="BOB"
            montoProps={{ sx: { color: 'error.main', fontWeight: 600, fontSize: '0.875rem' } }}
            siglaProps={{ sx: { color: 'error.main', fontSize: '0.75rem' } }}
            buttonProps={{ sx: { color: 'error.main', py: 0, minHeight: 0 } }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            GiftCard
          </Typography>
          <MontoMonedaTexto
            monto={giftcard}
            editar={true}
            onChange={(val) => setGiftcard(val || 0)}
            sigla="BOB"
            montoProps={{ sx: { color: 'error.main', fontWeight: 600, fontSize: '0.875rem' } }}
            siglaProps={{ sx: { color: 'error.main', fontSize: '0.75rem' } }}
            buttonProps={{ sx: { color: 'error.main', py: 0, minHeight: 0 } }}
          />
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            Total
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            {Math.max(0, subtotal - descuento - giftcard).toFixed(2)} BOB
          </Typography>
        </Box>
      </Box>

      {/* Acciones */}
      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              borderColor: 'divider',
              color: 'text.secondary',
              bgcolor: 'background.paper',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'divider',
              },
            }}
          >
            <ReceiptLongOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            Cuenta
          </Button>
          <Button
            variant="outlined"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              borderColor: 'divider',
              color: 'text.secondary',
              bgcolor: 'background.paper',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'divider',
              },
            }}
          >
            <CallSplitOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            Dividir
          </Button>
          <Button
            variant="outlined"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              borderColor: 'divider',
              color: 'text.secondary',
              bgcolor: 'background.paper',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'divider',
              },
            }}
          >
            <SyncAltOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            Transferir
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            variant="contained"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              bgcolor: alpha(theme.palette.error.main, 0.08),
              color: 'error.main',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.12),
                boxShadow: 'none',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            <DeleteOutlineOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              bgcolor: '#f0f4ff', // Light bluish purple
              color: '#4f46e5', // Indigo color
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'transparent',
              '&:hover': {
                bgcolor: '#e0e7ff',
                boxShadow: 'none',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
            onClick={handleRegistrar}
          >
            <RoomServiceOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            {isPending
              ? 'Cargando...'
              : !mesaSeleccionada?.pedido || mesaSeleccionada.pedido._id?.startsWith('nuevo-')
                ? 'Registrar'
                : 'Actualizar'}
          </Button>
          <Button
            variant="contained"
            size="large"
            disabled={!mesaSeleccionada}
            sx={{
              flex: 1,
              flexDirection: 'column',
              p: 1.5,
              bgcolor: '#2e7d32', // Solid Green
              color: '#ffffff',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 4px 14px 0 rgba(46, 125, 50, 0.39)', // Nice green shadow
              border: '1px solid',
              borderColor: 'transparent',
              '&:hover': {
                bgcolor: '#1b5e20',
                boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            <PaymentsOutlinedIcon sx={{ mb: 0.5, fontSize: '1.75rem' }} />
            Cobrar
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

export default RrAcciones
