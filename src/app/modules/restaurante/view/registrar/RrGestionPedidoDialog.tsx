import CloseIcon from '@mui/icons-material/Close'
import { Alert, Box, Dialog, DialogTitle, IconButton, Snackbar } from '@mui/material'
import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'

import useAuth from '../../../../base/hooks/useAuth'
import { articuloToArticuloOperacionInputService } from '../../../../base/services/articuloToArticuloOperacionInputService'
import { ESTADO_MESA, MesaUI } from '../../interfaces/mesa.interface'
import {
  Articulo,
  ArticuloModificadorOperacionInput,
  ArticuloOperacion,
  ArticuloOperacionModificador,
  ArticuloPrecioOperacion,
  ArticuloRecetaOperacionInput,
  RestPedido,
} from '../../types'
import RrAcciones from './RrAcciones'
import RrCarrito from './RrCarrito'
import RrCategoriasProductos from './RrCategoriasProductos'

interface RrGestionPedidoDialogProps {
  open: boolean
  onClose: () => void
  pedido: RestPedido | null
}

const RrGestionPedidoDialog: FunctionComponent<RrGestionPedidoDialogProps> = ({ open, onClose, pedido }) => {
  const { user } = useAuth()
  const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaUI | null>(null)
  const [isPedidoDirty, setIsPedidoDirty] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; key: number }>({
    open: false,
    message: '',
    key: 0,
  })

  const mesaSeleccionadaRef = useRef(mesaSeleccionada)
  useEffect(() => {
    mesaSeleccionadaRef.current = mesaSeleccionada
  }, [mesaSeleccionada])

  useEffect(() => {
    if (open && pedido) {
      setMesaSeleccionada({
        _id: pedido._id || '',
        value: pedido.mesa?.nombre || '',
        label: pedido.mesa?.nombre ? `Mesa ${pedido.mesa.nombre}` : 'Pedido',
        estado: ESTADO_MESA.OCUPADO,
        pedido,
      })
      setIsPedidoDirty(false)
    }
  }, [open, pedido])

  const handleAddProduct = useCallback(
    (payload: {
      articulo: Articulo
      cantidad: number
      notasIds: string[]
      variacionReceta?: ArticuloRecetaOperacionInput[]
      modificadoresInput?: ArticuloModificadorOperacionInput[]
      precioUnitario?: number
    }) => {
      const {
        articulo,
        cantidad,
        notasIds,
        variacionReceta = [],
        modificadoresInput = [],
        precioUnitario,
      } = payload

      const buildModsFirma = (
        mods: Array<{ codigoArticulo?: string | null; articuloPrecio?: { cantidad?: number } | null }>,
      ) =>
        mods
          .map((m) => `${m.codigoArticulo ?? ''}:${m.articuloPrecio?.cantidad ?? 1}`)
          .sort()
          .join('|')

      const notasNuevasSorted = [...notasIds].sort()
      const vrNuevaFirma = [...variacionReceta]
        .map((v) => `${v.codigoArticulo}:${v.removido ? 'R' : ''}${v.esExtra ? 'E' : ''}`)
        .sort()
        .join('|')
      const modsNuevaFirma = buildModsFirma(modificadoresInput)

      setIsPedidoDirty(true)

      setMesaSeleccionada((prev) => {
        if (!prev) return null

        const nuevoPedido = prev.pedido
          ? { ...prev.pedido }
          : ({
              _id: `nuevo-${Date.now()}`,
              tipo: 'SALON',
              state: 'NUEVO',
              productos: [],
              totalBase: 0,
              totalCalculado: 0,
              estadoLectura: false,
              estadoImpresora: false,
            } as unknown as RestPedido)

        const productos = [...(nuevoPedido.productos || [])]

        const existingIdx = productos.findIndex((p) => {
          const pId = p.articuloId || (p as any).articulo?._id || (p as any)._id
          if (pId !== articulo._id) return false
          const pNotas = [...(p.notaRapida?.map((n) => n.valor).filter(Boolean) || [])].sort()
          if (pNotas.join('|') !== notasNuevasSorted.join('|')) return false
          if ((p.nota || '').trim() !== '') return false
          const pVrFirma = [...((p as any).variacionReceta ?? [])]
            .map((v: any) => `${v.codigoArticulo}:${v.removido ? 'R' : ''}${v.esExtra ? 'E' : ''}`)
            .sort()
            .join('|')
          if (pVrFirma !== vrNuevaFirma) return false
          return buildModsFirma(p.modificadores ?? []) === modsNuevaFirma
        })

        if (existingIdx >= 0) {
          const existing = productos[existingIdx]
          const nextQty =
            (existing.articuloPrecio?.cantidad ?? existing.articuloPrecioBase?.cantidad ?? 1) + cantidad
          productos[existingIdx] = {
            ...existing,
            articuloPrecio: { ...existing.articuloPrecio, cantidad: nextQty },
            articuloPrecioBase: { ...existing.articuloPrecioBase, cantidad: nextQty },
          }
        } else {
          const baseProd = articuloToArticuloOperacionInputService(articulo as any, user.moneda, {
            cantidad,
            autoAlmacen: true,
            autoLote: true,
          })
          const nuevoProd: ArticuloOperacion = {
            ...(baseProd as unknown as ArticuloOperacion),
            articuloPrecioBase: {
              cantidad,
              valor: precioUnitario ?? articulo.articuloPrecioBase?.monedaPrimaria?.precio ?? 0,
              moneda: articulo.articuloPrecioBase?.monedaPrimaria?.moneda,
              articuloUnidadMedida: articulo.articuloPrecioBase?.articuloUnidadMedida,
            },
            articuloPrecio: {
              cantidad,
              valor: precioUnitario ?? articulo.articuloPrecioBase?.monedaPrimaria?.precio ?? 0,
              moneda: articulo.articuloPrecioBase?.monedaPrimaria?.moneda,
              articuloUnidadMedida: articulo.articuloPrecioBase?.articuloUnidadMedida,
            },
            notaRapida: notasIds.map((n) => ({ valor: n })),
            nota: '',
            cortesia: false,
            variacionReceta: variacionReceta.length > 0 ? variacionReceta : undefined,
            modificadores: modificadoresInput.map(
              (m) =>
                ({
                  articuloModificadorId: m.articuloModificadorId,
                  articuloId: m.codigoArticulo,
                  nroItem: m.nroItem ?? undefined,
                  codigoArticulo: m.codigoArticulo || '',
                  nombreArticulo: (m as any).nombreArticulo || 'Modificador',
                  esOpcionGratuita: m.esOpcionGratuita,
                  elegibleParaGratis: (m as any).elegibleParaGratis,
                  cantidadIncluida: m.articuloPrecio?.cantidad ?? 1,
                  articuloPrecio: m.articuloPrecio as unknown as ArticuloPrecioOperacion,
                  state: 'NUEVO',
                }) as ArticuloOperacionModificador,
            ),
          }
          ;(nuevoProd as any)._modificadoresInput = modificadoresInput
          productos.push(nuevoProd)
        }

        nuevoPedido.productos = productos
        return { ...prev, pedido: nuevoPedido }
      })
    },
    [user.moneda],
  )

  const handleUpdateProduct = useCallback((index: number, updatedItem: ArticuloOperacion) => {
    setIsPedidoDirty(true)
    setMesaSeleccionada((prev) => {
      if (!prev || !prev.pedido || !prev.pedido.productos) return prev
      const productos = [...prev.pedido.productos]
      productos[index] = updatedItem
      return { ...prev, pedido: { ...prev.pedido, productos } }
    })
  }, [])

  const handleRemoveProduct = useCallback((index: number) => {
    setIsPedidoDirty(true)
    setMesaSeleccionada((prev) => {
      if (!prev || !prev.pedido || !prev.pedido.productos) return prev
      const productos = [...prev.pedido.productos]
      productos.splice(index, 1)
      return { ...prev, pedido: { ...prev.pedido, productos } }
    })
  }, [])

  const handleClientChange = useCallback((cliente: any) => {
    setIsPedidoDirty(true)
    setMesaSeleccionada((prev) => {
      if (!prev) return null
      return {
        ...prev,
        pedido: {
          ...(prev.pedido || { productos: [] }),
          cliente: {
            _id: cliente._id,
            codigoCliente: cliente.codigoCliente || '0',
            razonSocial: cliente.razonSocial || 'SN',
            numeroDocumento: cliente.numeroDocumento || cliente.nit,
            nit: cliente.nit || cliente.numeroDocumento,
            email: cliente.email,
            telefono: cliente.telefono,
            direccion: cliente.direccion,
          },
        } as any,
      }
    })
  }, [])

  const handleSuccess = useCallback((pedidoRetornado?: any) => {
    setSnackbar((s) => ({ open: true, message: 'Pedido actualizado exitosamente', key: s.key + 1 }))
    setIsPedidoDirty(false)
    if (pedidoRetornado) {
      setMesaSeleccionada((prev) =>
        prev ? { ...prev, _id: pedidoRetornado._id || prev._id, pedido: pedidoRetornado } : prev,
      )
    }
  }, [])

  const handleCancel = useCallback(() => {
    setIsPedidoDirty(false)
    onClose()
  }, [onClose])

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xl"
        PaperProps={{ sx: { height: '90vh', display: 'flex', flexDirection: 'column' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
          {pedido?.mesa?.nombre ? `Mesa ${pedido.mesa.nombre}` : 'Agregar Productos'}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', p: 1.5, gap: 1.5 }}>
          <Box sx={{ flex: '1 1 65%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <RrCategoriasProductos onAddProduct={handleAddProduct} />
          </Box>
          <Box sx={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <RrCarrito
                mesaSeleccionada={mesaSeleccionada}
                onUpdateProduct={handleUpdateProduct}
                onRemoveProduct={handleRemoveProduct}
                onClientChange={handleClientChange}
              />
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <RrAcciones
                mesaSeleccionada={mesaSeleccionada}
                isPedidoDirty={isPedidoDirty}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
                onClear={handleCancel}
              />
            </Box>
          </Box>
        </Box>
      </Dialog>

      <Snackbar
        key={`snackbar-${snackbar.key}`}
        open={snackbar.open}
        autoHideDuration={1200}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="standard" sx={{ minWidth: 250, boxShadow: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default RrGestionPedidoDialog
