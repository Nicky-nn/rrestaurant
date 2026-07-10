import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined'
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined'
import {
  alpha,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'

import MontoMonedaTexto from '../../../../base/components/PopoverMonto/MontoMonedaTexto'
import { useAppConfirm } from '../../../../base/contexts/AppConfirmProvider'
import { useError } from '../../../../base/contexts/ErrorProvider'
import { useSecurity } from '../../../../base/contexts/SecurityContext'
import useAuth from '../../../../base/hooks/useAuth'
import { MyGraphQlError } from '../../../../base/services/GraphqlError'
import { SecureComponent } from '../../../../security'
import PdfViewerDialog from '../../../reporte/components/PdfViewerDialog'
import { MesaUI } from '../../interfaces/mesa.interface'
import { useRestPedidoActualizar } from '../../mutations/useRestPedidoActualizar'
import { useRestPedidoCancelar } from '../../mutations/useRestPedidoCancelar'
import { useRestPedidoFacturaRegistro } from '../../mutations/useRestPedidoFacturaRegistro'
import { useRestPedidoFinalizar } from '../../mutations/useRestPedidoFinalizar'
import { useRestPedidoRegistrarCompletar } from '../../mutations/useRestPedidoRegistrarCompletar'
import {
  ArticuloModificadorOperacionInput,
  ArticuloOperacionModificador,
  ArticuloOperacionReceta,
  ArticuloRecetaOperacionInput,
  RestPedido,
  RestPedidoExpressInput,
  RestPedidoFinalizarInput,
} from '../../types'
import RrCobroDialog, { PagoRealizado } from './RrCobroDialog'
import RrDividirCuentaDialog from './RrDividirCuentaDialog'
import RrFacturacionExitosaDialog from './RrFacturacionExitosaDialog'
import RrTransferirMesaDialog from './RrTransferirMesaDialog'
import { useComandaPdf } from './useComandaPdf'
import { useEnviarFacturaWhatsapp } from './useEnviarFacturaWhatsapp'

// Tipo local para artículos UI que extienden ArticuloOperacion con campos efímeros
type ArticuloOperacionUI = any

interface RrAccionesProps {
  mesaSeleccionada?: MesaUI | null
  isPedidoDirty?: boolean
  onSuccess?: (pedidoRetornado?: any, isFinalizado?: boolean) => void
  onCancel?: () => void
  onClear?: () => void
  onDescuentoChange?: () => void
}

interface PrinterSettings {
  comanda?: string | Record<string, string>
  impresionAutomatica?: {
    facturar?: boolean
    comanda?: boolean
    estadoDeCuenta?: boolean
    actualizarYComandar?: boolean
  }
}

const debeImprimirComandaAutomatica = (isNuevo: boolean): boolean => {
  try {
    const raw = localStorage.getItem('printers')
    if (!raw) return false
    const parsed = JSON.parse(raw) as PrinterSettings
    if (isNuevo) return parsed.impresionAutomatica?.comanda === true
    return parsed.impresionAutomatica?.actualizarYComandar === true
  } catch {
    return false
  }
}

const getComandaPrinter = (): string => {
  try {
    const raw = localStorage.getItem('printers')
    if (!raw) return ''
    const parsed = JSON.parse(raw) as PrinterSettings

    if (typeof parsed.comanda === 'string') {
      return parsed.comanda
    }

    return ''
  } catch {
    return ''
  }
}

const debeImprimirEstadoCuentaAuto = (): boolean => {
  try {
    const raw = localStorage.getItem('printers')
    if (!raw) return false
    const parsed = JSON.parse(raw) as PrinterSettings
    return parsed.impresionAutomatica?.estadoDeCuenta === true
  } catch {
    return false
  }
}

const getEstadoCuentaPrinter = (): string => {
  try {
    const raw = localStorage.getItem('printers')
    if (!raw) return ''
    const parsed = JSON.parse(raw) as PrinterSettings & { estadoDeCuenta?: string }
    return typeof parsed.estadoDeCuenta === 'string' ? parsed.estadoDeCuenta : ''
  } catch {
    return ''
  }
}

/**
 * RrAcciones
 * Panel de acciones del pedido.
 * Contiene botones para confirmar, cancelar, imprimir u otras operaciones finales del pedido.
 */
const RrAcciones: FunctionComponent<RrAccionesProps> = ({
  mesaSeleccionada,
  isPedidoDirty = false,
  onSuccess,
  onCancel,
  onClear,
  onDescuentoChange,
}) => {
  const theme = useTheme()
  const { user } = useAuth()
  const { hasActionPermission, hasStaticPermission } = useSecurity()
  const { requestConfirm } = useAppConfirm()
  const { showError } = useError()
  const [descuento, setDescuento] = useState<number>(0)
  const [giftcard, setGiftcard] = useState<number>(0)

  const { mutateAsync: registrarPedido, isPending: isRegistrarPending } = useRestPedidoRegistrarCompletar()
  const { mutateAsync: actualizarPedido, isPending: isActualizarPending } = useRestPedidoActualizar()
  const { mutateAsync: cancelarPedido, isPending: isCancelarPending } = useRestPedidoCancelar()
  const { mutateAsync: finalizarPedido, isPending: isFinalizarPending } = useRestPedidoFinalizar()
  const { mutateAsync: facturarPedido, isPending: isFacturarPending } = useRestPedidoFacturaRegistro()
  const { sendFactura } = useEnviarFacturaWhatsapp()

  const isPending =
    isRegistrarPending || isActualizarPending || isCancelarPending || isFinalizarPending || isFacturarPending

  const [loadingMessage, setLoadingMessage] = useState('Actualizando Pedido...')

  useEffect(() => {
    if (isRegistrarPending) setLoadingMessage('Registrando Pedido...')
    else if (isCancelarPending) setLoadingMessage('Cancelando Pedido...')
    else if (isFacturarPending) setLoadingMessage('Facturando Pedido...')
    else if (isFinalizarPending) setLoadingMessage('Finalizando Pedido...')
    else if (isActualizarPending) setLoadingMessage('Actualizando Pedido...')
  }, [isRegistrarPending, isCancelarPending, isFacturarPending, isFinalizarPending, isActualizarPending])

  const handleRegistrar = async () => {
    if (!mesaSeleccionada?.pedido) return false

    const { pedido, value: mesaNombre } = mesaSeleccionada

    console.log('Preparando datos para registrar/actualizar pedido', { pedido })
    try {
      const cachedUbicacion = localStorage.getItem('ubicacion')
      const ubicacionParsed = cachedUbicacion ? JSON.parse(cachedUbicacion) : null
      const ubicacionId = ubicacionParsed?._id ?? null
      const ubicacionNombre = ubicacionParsed?.descripcion ?? undefined

      const input: RestPedidoExpressInput = {
        mesa: {
          nombre: mesaNombre,
          ubicacion: ubicacionNombre,
          nroComensales: 1,
        },
        //@ts-ignore
        productos: (pedido.productos ?? []).map((p) => ({
          nroItem: p.nroItem ?? undefined,
          codigoArticulo: p.codigoArticulo || '',
          codigoAlmacen: null,
          codigoLote: null,
          articuloPrecio: {
            codigoArticuloUnidadMedida:
              p.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ??
              p.articuloPrecioBase?.articuloUnidadMedida?.codigoUnidadMedida ??
              (p as any).articuloUnidadMedida?.codigoUnidadMedida ??
              '',
            cantidad: p.articuloPrecio?.cantidad ?? p.articuloPrecioBase?.cantidad ?? 1,
            precio: p.articuloPrecio?.valor ?? p.articuloPrecioBase?.valor ?? 0,
            descuento: p.cortesia
              ? (p.articuloPrecio?.valor ?? p.articuloPrecioBase?.valor ?? 0)
              : (p.articuloPrecio?.descuento ?? 0),
            impuesto: p.articuloPrecio?.impuesto ?? 0,
          },
          detalleExtra: p.nota || undefined,
          notaRapida:
            (p.notaRapida?.length ?? 0) > 0
              ? p.notaRapida!.map((n) => ({ valor: n.valor, cantidad: n.cantidad }))
              : undefined,
          cortesia: p.cortesia ?? false,
          variacionReceta: (() => {
            const pUI = p as ArticuloOperacionUI
            const vrArr = pUI.variacionReceta ?? []
            if (vrArr.length === 0) return undefined
            return vrArr.map((v: ArticuloOperacionReceta) => {
              // Items locales (de UI) son ArticuloRecetaOperacionInput; items del servidor son ArticuloOperacionReceta
              const asInput = v as ArticuloRecetaOperacionInput
              const asServer = v as ArticuloOperacionReceta
              return {
                nroItem: v.nroItem,
                // codigoArticulo: asServer.codigoArticulo era redundante (asServer = v)
                codigoArticulo: v.codigoArticulo ?? '',
                codigoAlmacen: null,
                codigoLote: null,
                articuloPrecio: {
                  codigoArticuloUnidadMedida:
                    (asInput.articuloPrecio as { codigoArticuloUnidadMedida?: string } | undefined)
                      ?.codigoArticuloUnidadMedida ??
                    asServer.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ??
                    '',
                  // removido:true → backend exige cantidad 0; caso contrario mínimo 1
                  cantidad: v.removido
                    ? 0
                    : Math.max(
                        1,
                        (asInput.articuloPrecio as { cantidad?: number } | undefined)?.cantidad ??
                          (asServer.articuloPrecio as { cantidad?: number } | undefined)?.cantidad ??
                          1,
                      ),
                  precio:
                    (asServer.articuloPrecio as { valor?: number } | undefined)?.valor ??
                    (asInput.articuloPrecio as { precio?: number } | undefined)?.precio ??
                    0,
                  descuento: p.cortesia
                    ? ((asServer.articuloPrecio as { valor?: number } | undefined)?.valor ??
                      (asInput.articuloPrecio as { precio?: number } | undefined)?.precio ??
                      0)
                    : (v.articuloPrecio?.descuento ?? 0),
                  impuesto: v.articuloPrecio?.impuesto ?? 0,
                },
                notaRapida: v.notaRapida,
                removido: v.removido ?? false,
                esExtra: v.esExtra ?? false,
              }
            })
          })(),
          modificadores: (() => {
            const pUI = p as ArticuloOperacionUI
            // Prioridad: _modificadoresInput (del modal, tiene articuloModificadorId correcto)
            // Fallback: p.modificadores (datos que vienen del servidor en re-edición)
            const srcMods: (ArticuloModificadorOperacionInput | ArticuloOperacionModificador)[] =
              pUI._modificadoresInput ?? pUI.modificadores ?? []
            const mapped = srcMods
              .map((m) => {
                const asInput = m as ArticuloModificadorOperacionInput
                const asServer = m as ArticuloOperacionModificador
                return {
                  articuloModificadorId:
                    asInput.articuloModificadorId || asServer.articuloModificadorId || '',
                  nroItem: m.nroItem,
                  codigoArticulo: m.codigoArticulo || '',
                  codigoAlmacen: null,
                  codigoLote: null,
                  articuloPrecio: {
                    codigoArticuloUnidadMedida:
                      (asInput.articuloPrecio as { codigoArticuloUnidadMedida?: string } | undefined)
                        ?.codigoArticuloUnidadMedida ??
                      asServer.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ??
                      '',
                    cantidad: m.articuloPrecio?.cantidad ?? 1,
                    precio: asInput.esOpcionGratuita
                      ? 0
                      : ((asServer.articuloPrecio as { valor?: number } | undefined)?.valor ??
                        (asInput.articuloPrecio as { precio?: number } | undefined)?.precio ??
                        0),
                    descuento: p.cortesia
                      ? asInput.esOpcionGratuita
                        ? 0
                        : ((asServer.articuloPrecio as { valor?: number } | undefined)?.valor ??
                          (asInput.articuloPrecio as { precio?: number } | undefined)?.precio ??
                          0)
                      : (m.articuloPrecio?.descuento ?? 0),
                    impuesto: m.articuloPrecio?.impuesto ?? 0,
                  },
                  // Guard: si el dato viene del servidor (re-edición sin reabrir modal),
                  // sólo re-enviar esOpcionGratuita:true si elegibleParaGratis lo confirma.
                  // Evita error cuando el backend cambió la elegibilidad después de la creación.
                  esOpcionGratuita:
                    (asInput.esOpcionGratuita ?? false) && asServer.elegibleParaGratis !== false,
                  notaRapida: m.notaRapida
                    ? m.notaRapida.map((n) => ({ valor: n.valor, cantidad: n.cantidad }))
                    : undefined,
                }
              })
              .filter((m) => Boolean(m.articuloModificadorId))
            return mapped.length > 0 ? mapped : undefined
          })(),
        })),
        codigoMoneda: user.moneda.codigo,
        tipoCambio: user.moneda.tipoCambio || 1,
        tipo: ['DELIVERY', 'LLEVAR'].includes(pedido.tipo ?? '') ? pedido.tipo : undefined,
        nota: pedido.nota || '',
        espacioId: ubicacionId ?? undefined,
      }

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
        console.log('Registrando nuevo pedido con payload', { basePayload })
        response = await registrarPedido(basePayload)
        console.log('Pedido registrado exitosamente', { response })
      } else {
        response = await actualizarPedido({ id: pedido._id!, ...basePayload })
        console.log('Pedido actualizado exitosamente', { response })
      }

      if (onSuccess) onSuccess(response)

      // Enriquecer pedidoParaComanda con nombreArticulo local (el servidor no devuelve
      // el alias nombreOpcion — sin esto variantes del mismo artículo se muestran igual).
      const localProductos: any[] = pedido.productos ?? []
      const responseTyped = response as RestPedido
      const matchedComandaIndices = new Set<number>()
      const productosEnriquecidos = (responseTyped?.productos ?? []).map((serverProd: any) => {
        let localIdx = localProductos.findIndex(
          (lp: any, i) =>
            !matchedComandaIndices.has(i) &&
            lp.nroItem != null &&
            serverProd.nroItem != null &&
            String(lp.nroItem) === String(serverProd.nroItem),
        )
        if (localIdx < 0) {
          localIdx = localProductos.findIndex(
            (lp: any, i) =>
              !matchedComandaIndices.has(i) &&
              lp.codigoArticulo === serverProd.codigoArticulo &&
              (lp.articuloId === serverProd.articuloId || !lp.articuloId || !serverProd.articuloId),
          )
        }
        if (localIdx >= 0) matchedComandaIndices.add(localIdx)
        const localProd = localIdx >= 0 ? localProductos[localIdx] : undefined
        const localMods: any[] = (localProd as any)?._modificadoresInput ?? localProd?.modificadores ?? []
        const modsEnriquecidos = (serverProd.modificadores ?? []).map((m: any) => {
          if (m.nombreArticulo) return m
          const localMod =
            localMods.find(
              (lm: any) =>
                lm.codigoArticulo === m.codigoArticulo &&
                (lm.articuloPrecio?.codigoArticuloUnidadMedida ?? '') ===
                  (m.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ??
                    m.articuloPrecio?.codigoArticuloUnidadMedida ??
                    ''),
            ) ?? localMods.find((lm: any) => lm.codigoArticulo === m.codigoArticulo)
          return { ...m, nombreArticulo: (localMod as any)?.nombreArticulo || m.codigoArticulo || '' }
        })
        return { ...serverProd, modificadores: modsEnriquecidos }
      })

      const pedidoParaComanda: RestPedido = {
        ...responseTyped,
        nota: input.nota || responseTyped?.nota || '',
        productos: productosEnriquecidos,
      }
      if (debeImprimirComandaAutomatica(isNuevo)) {
        try {
          await imprimirComanda(pedidoParaComanda, getComandaPrinter())
        } catch (err) {
          showError(new MyGraphQlError(err instanceof Error ? err : new Error('Error al imprimir comanda')))
        }
      }
      return response
    } catch (error) {
      console.error('Error al registrar pedido', error)
      showError(new MyGraphQlError(error as Error))
      return false
    }
  }

  const handleCancelar = async () => {
    if (!mesaSeleccionada?.pedido) return

    const { pedido, label: mesaLabel } = mesaSeleccionada

    // Solicitar confirmación
    const result = await requestConfirm({
      title: '¿Cancelar pedido?',
      description: `¿Está seguro que desea cancelar el pedido de ${mesaLabel}?\nEsta acción no se puede deshacer.`,
      confirmationText: 'Sí, Cancelar',
      cancellationText: 'No, Volver',
      confirmButtonColor: 'error',
    })

    if (!result.confirmed) return

    // Si es un pedido nuevo que no se ha guardado aún, no es necesario llamar a la API
    if (!pedido._id || pedido._id.startsWith('nuevo-')) {
      if (onCancel) onCancel()
      return
    }

    try {
      await cancelarPedido({
        id: pedido._id,
        entidad: {
          codigoSucursal: user.sucursal.codigo,
          codigoPuntoVenta: user.puntoVenta.codigo,
        },
      })
      console.log('Pedido cancelado exitosamente')
      if (onCancel) onCancel()
    } catch (error) {
      console.error('Error al cancelar pedido', error)
      showError(new MyGraphQlError(error as Error))
    }
  }

  const subtotal = useMemo(() => {
    let sub = 0
    if (mesaSeleccionada?.pedido?.productos) {
      mesaSeleccionada.pedido.productos.forEach((p) => {
        const isCortesia = p.cortesia || false
        if (isCortesia) return

        // Usar total/subtotal del backend si calculó un TotalesGenerales o precio en el artículo directamente
        if (typeof (p as any).subTotal === 'number') {
          sub += (p as any).subTotal
          return
        }
        if (typeof (p as any).totales?.subtotalNeto === 'number') {
          sub += (p as any).totales.subtotalNeto
          return
        }

        const precio = p.articuloPrecio?.valor ?? 0
        const cantidad = p.articuloPrecio?.cantidad ?? p.articuloPrecioBase?.cantidad ?? 1
        let itemTotal = Number(precio) * Number(cantidad)

        // Cuando el producto viene del servidor (articuloId presente), articuloPrecio.valor
        // ya incluye el precio de modificadores y variaciones de receta.
        // Solo sumarlos si son datos locales (pedido nuevo, sin articuloId del servidor).
        const esDelServidor = Boolean((p as any).articuloId)
        if (!esDelServidor) {
          if (p.modificadores && Array.isArray(p.modificadores)) {
            p.modificadores.forEach((m) => {
              const mPrecio = m.articuloPrecio?.valor ?? 0
              const mQty = m.articuloPrecio?.cantidad ?? 1
              itemTotal += Number(mPrecio) * Number(mQty)
            })
          }
          if (p.variacionReceta && Array.isArray(p.variacionReceta)) {
            p.variacionReceta.forEach((vr) => {
              const vrPrecio = (vr.articuloPrecio as any)?.precio ?? 0
              const vrQty = vr.articuloPrecio?.cantidad ?? (vr as any).articuloPrecioBase?.cantidad ?? 0
              itemTotal += Number(vrPrecio) * Number(vrQty)
            })
          }
        }

        sub += itemTotal
      })
    }

    // Fallback absoluto al back-end. A veces la mesa devuelve el subtotalNeto calculado completo.
    if (sub === 0 && (mesaSeleccionada?.pedido?.totales as any)?.subtotalNeto) {
      return (mesaSeleccionada!.pedido!.totales as any).subtotalNeto
    }

    return sub
  }, [mesaSeleccionada])

  const [openCobroDialog, setOpenCobroDialog] = useState(false)
  const [openDividirDialog, setOpenDividirDialog] = useState(false)
  const [openTransferirDialog, setOpenTransferirDialog] = useState(false)
  const [openFacturacionExitosaDialog, setOpenFacturacionExitosaDialog] = useState(false)
  const [facturacionExitosaTelefono, setFacturacionExitosaTelefono] = useState('')
  const [facturacionExitosaEmail, setFacturacionExitosaEmail] = useState('')
  const [facturaPdfUrl, setFacturaPdfUrl] = useState('')

  const handleOpenCobro = async () => {
    if (!mesaSeleccionada?.pedido) return

    const { pedido } = mesaSeleccionada
    const isNuevo = !pedido._id || pedido._id.startsWith('nuevo-')

    if (!isNuevo) {
      // Si explícitamente no hay cambios locales sin guardar,
      // omitimos la llamada redundante para ahorrar recursos e internet.
      if (!isPedidoDirty) {
        setOpenCobroDialog(true)
        return
      }
    }

    // Registrar o actualizar automáticamente antes de cobrar
    // para evitar que el mesero olvide actualizar los últimos cambios
    const response = await handleRegistrar()
    if (response) {
      setOpenCobroDialog(true)
    }
  }

  const handleTransferirSubmit = async (
    nuevoMesaNombre: string,
    nuevoUbicacionId: string | null,
    nuevoUbicacionNombre: string | null,
  ) => {
    if (!mesaSeleccionada?.pedido) return false
    const { pedido } = mesaSeleccionada

    try {
      const input: RestPedidoExpressInput = {
        mesa: {
          nombre: nuevoMesaNombre,
          ubicacion: nuevoUbicacionNombre ?? undefined,
          nroComensales: 1,
        },
        //@ts-ignore
        productos: (pedido.productos ?? []).map((p) => ({
          nroItem: p.nroItem ?? undefined,

          codigoArticulo: p.codigoArticulo || '',
          codigoAlmacen: null,
          codigoLote: null,
          articuloPrecio: {
            codigoArticuloUnidadMedida:
              p.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ??
              p.articuloPrecioBase?.articuloUnidadMedida?.codigoUnidadMedida ??
              (p as any).articuloUnidadMedida?.codigoUnidadMedida ??
              '',
            cantidad: p.articuloPrecio?.cantidad ?? p.articuloPrecioBase?.cantidad ?? 1,
            precio: p.articuloPrecio?.valor ?? p.articuloPrecioBase?.valor ?? 0,
            descuento: p.cortesia
              ? (p.articuloPrecio?.valor ?? p.articuloPrecioBase?.valor ?? 0)
              : (p.articuloPrecio?.descuento ?? 0),
            impuesto: p.articuloPrecio?.impuesto ?? 0,
          },
          detalleExtra: p.nota || undefined,
          notaRapida:
            (p.notaRapida?.length ?? 0) > 0
              ? p.notaRapida!.map((n) => ({ valor: n.valor, cantidad: n.cantidad }))
              : undefined,
          cortesia: p.cortesia ?? false,
          variacionReceta: (() => {
            const pUI = p as ArticuloOperacionUI
            const vrArr = pUI.variacionReceta ?? []
            if (vrArr.length === 0) return undefined
            return vrArr.map((v: ArticuloOperacionReceta) => {
              const asInput = v as ArticuloRecetaOperacionInput
              const asServer = v as ArticuloOperacionReceta
              return {
                nroItem: v.nroItem,
                codigoArticulo: v.codigoArticulo ?? '',
                codigoAlmacen: null,
                codigoLote: null,
                articuloPrecio: {
                  codigoArticuloUnidadMedida:
                    (asInput.articuloPrecio as { codigoArticuloUnidadMedida?: string } | undefined)
                      ?.codigoArticuloUnidadMedida ??
                    asServer.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ??
                    '',
                  cantidad: Math.max(
                    1,
                    (asInput.articuloPrecio as { cantidad?: number } | undefined)?.cantidad ??
                      (asServer.articuloPrecio as { cantidad?: number } | undefined)?.cantidad ??
                      1,
                  ),
                  precio:
                    (asServer.articuloPrecio as { valor?: number } | undefined)?.valor ??
                    (asInput.articuloPrecio as { precio?: number } | undefined)?.precio ??
                    0,
                  descuento: p.cortesia
                    ? ((asServer.articuloPrecio as { valor?: number } | undefined)?.valor ??
                      (asInput.articuloPrecio as { precio?: number } | undefined)?.precio ??
                      0)
                    : (v.articuloPrecio?.descuento ?? 0),
                  impuesto: v.articuloPrecio?.impuesto ?? 0,
                },
                notaRapida: v.notaRapida,
                removido: v.removido ?? false,
                esExtra: v.esExtra ?? false,
              }
            })
          })(),
          modificadores: (() => {
            const pUI = p as ArticuloOperacionUI
            const srcMods: (ArticuloModificadorOperacionInput | ArticuloOperacionModificador)[] =
              pUI._modificadoresInput ?? pUI.modificadores ?? []
            const mapped = srcMods
              .map((m) => {
                const asInput = m as ArticuloModificadorOperacionInput
                const asServer = m as ArticuloOperacionModificador
                return {
                  articuloModificadorId:
                    asInput.articuloModificadorId || asServer.articuloModificadorId || '',
                  nroItem: m.nroItem,
                  codigoArticulo: m.codigoArticulo || '',
                  codigoAlmacen: null,
                  codigoLote: null,
                  articuloPrecio: {
                    codigoArticuloUnidadMedida:
                      (asInput.articuloPrecio as { codigoArticuloUnidadMedida?: string } | undefined)
                        ?.codigoArticuloUnidadMedida ??
                      asServer.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ??
                      '',
                    cantidad: m.articuloPrecio?.cantidad ?? 1,
                    precio: asInput.esOpcionGratuita
                      ? 0
                      : ((asServer.articuloPrecio as { valor?: number } | undefined)?.valor ??
                        (asInput.articuloPrecio as { precio?: number } | undefined)?.precio ??
                        0),
                    descuento: p.cortesia
                      ? asInput.esOpcionGratuita
                        ? 0
                        : ((asServer.articuloPrecio as { valor?: number } | undefined)?.valor ??
                          (asInput.articuloPrecio as { precio?: number } | undefined)?.precio ??
                          0)
                      : (m.articuloPrecio?.descuento ?? 0),
                    impuesto: m.articuloPrecio?.impuesto ?? 0,
                  },
                  esOpcionGratuita:
                    (asInput.esOpcionGratuita ?? false) && asServer.elegibleParaGratis !== false,
                  notaRapida: m.notaRapida
                    ? m.notaRapida.map((n) => ({ valor: n.valor, cantidad: n.cantidad }))
                    : undefined,
                }
              })
              .filter((m) => Boolean(m.articuloModificadorId))
            return mapped.length > 0 ? mapped : undefined
          })(),
        })),
        codigoMoneda: user.moneda.codigo,
        tipoCambio: user.moneda.tipoCambio || 1,
        tipo: ['DELIVERY', 'LLEVAR'].includes(pedido.tipo ?? '') ? pedido.tipo : undefined,
        nota: pedido.nota || '',
        espacioId: nuevoUbicacionId ?? undefined,
      }

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

      const response = await actualizarPedido({ id: pedido._id!, ...basePayload })
      console.log('Pedido transferido exitosamente', response)
      setOpenTransferirDialog(false)

      if (onClear) onClear() // Limpiar selección para ver el refetch y salir de la mesa actual
      return response
    } catch (error) {
      console.error('Error al transferir pedido', error)
      showError(new MyGraphQlError(error as Error))
      throw error // Re-throw to handle in the generic dialog level
    }
  }

  const handleFinalizar = async (
    metodoDefectoId?: number,
    metodoDefectoNombre?: string,
    inputNumeroTarjeta?: string,
  ) => {
    if (
      !mesaSeleccionada?.pedido ||
      !mesaSeleccionada.pedido._id ||
      mesaSeleccionada.pedido._id.startsWith('nuevo-')
    ) {
      showError(new Error('El pedido no está registrado.'))
      return
    }

    const { pedido } = mesaSeleccionada
    const totalAPagar = Math.max(0, subtotal - descuento - giftcard)
    // esCortesiaTotal: cuando todo el pedido es cortesía, totalAPagar=0 y el backend
    // espera montoTotal=0 y metodoPagoVenta.monto=0 (el 100% de descuento está embebido en cada ítem).
    const esCortesiaTotal = subtotal === 0 && totalAPagar === 0

    let pagosFinales = pagosRealizados

    // Si no ingresaron ningún pago, asumimos que pagaron completo y usan el método seleccionado por defecto en la UI (o Efectivo).
    if (pagosFinales.length === 0) {
      pagosFinales = [
        {
          id: 'pago-defecto',
          metodoId: metodoDefectoId || 1, // 1 es típicamente Efectivo en SIAT si no hay seleccionado
          metodoNombre: metodoDefectoNombre || 'Efectivo',
          monto: totalAPagar, // 0 si es cortesía total — el backend lo espera así
          numeroTarjeta: inputNumeroTarjeta,
        },
      ]
    } else if (!esCortesiaTotal) {
      const totalPagado = pagosRealizados.reduce((acc, p) => acc + p.monto, 0)
      if (totalPagado < totalAPagar) {
        showError(new Error('El monto pagado es menor al total a pagar.'))
        return
      }
    }

    try {
      await finalizarPedido({
        id: pedido._id!,
        entidad: {
          codigoSucursal: user.sucursal.codigo,
          codigoPuntoVenta: user.puntoVenta.codigo,
        },
        cliente: {
          codigoCliente: pedido.cliente?.codigoCliente || '00',
          razonSocial: pedido.cliente?.razonSocial || 'Sin Razón Social',
        },
        input: {
          codigoMoneda: user.moneda?.codigo || 1,
          montoTotal: totalAPagar,
          usuario: user.correo || '',
          codigoMetodoPago: pagosFinales[0]?.metodoId || 1,
          numeroTarjeta:
            pagosFinales[0]?.metodoId === 2 ? formatTarjeta(pagosFinales[0].numeroTarjeta) : undefined,
        } as RestPedidoFinalizarInput & { codigoMetodoPago: number; numeroTarjeta?: string },
        metodoPagoVenta: pagosFinales.map((p) => ({
          codigoMetodoPago: p.metodoId,
          // Si es cortesía total, el backend exige que la sumatoria de montos sea 0
          monto: esCortesiaTotal ? 0 : p.monto,
        })),
      })

      setOpenCobroDialog(false)
      setPagosRealizados([])

      // Imprimir Estado de Cuenta automáticamente si está configurado
      if (debeImprimirEstadoCuentaAuto()) {
        try {
          await imprimirEstadoCuenta(pedido, descuento + giftcard, getEstadoCuentaPrinter())
        } catch (err) {
          console.error('Error al imprimir estado de cuenta', err)
        }
      }

      if (onClear) onClear()
      if (onSuccess) onSuccess(null, true) // isFinalizado = true
    } catch (error) {
      console.error('Error al finalizar pedido', error)
      showError(new MyGraphQlError(error as Error))
    }
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

  const handleFacturar = async (
    metodoDefectoId?: number,
    metodoDefectoNombre?: string,
    inputNumeroTarjeta?: string,
  ) => {
    if (
      !mesaSeleccionada?.pedido ||
      !mesaSeleccionada.pedido._id ||
      mesaSeleccionada.pedido._id.startsWith('nuevo-')
    ) {
      showError(new Error('El pedido no está registrado.'))
      return
    }

    const { pedido } = mesaSeleccionada
    const totalAPagar = Math.max(0, subtotal - descuento - giftcard)
    // Ídem handleFinalizar: si es cortesía total, totalAPagar=0 y el backend lo espera así.
    const esCortesiaTotal = subtotal === 0 && totalAPagar === 0

    let pagosFinales = pagosRealizados

    // Si no ingresaron ningún pago, usamos método por defecto
    if (pagosFinales.length === 0) {
      pagosFinales = [
        {
          id: 'pago-defecto',
          metodoId: metodoDefectoId || 1,
          metodoNombre: metodoDefectoNombre || 'Efectivo',
          monto: totalAPagar, // 0 si es cortesía total
          numeroTarjeta: inputNumeroTarjeta,
        },
      ]
    } else if (!esCortesiaTotal) {
      const totalPagado = pagosRealizados.reduce((acc, p) => acc + p.monto, 0)
      if (totalPagado < totalAPagar) {
        showError(new Error('El monto pagado es menor al total a pagar.'))
        return
      }
    }

    const metodoPrincipal = pagosFinales[0].metodoId
    let pedidoFinalizado = false

    try {
      // Primero, DEBEMOS finalizar el pedido (cambio de estado a FINALIZADO) localmente
      await finalizarPedido({
        id: pedido._id!,
        entidad: {
          codigoSucursal: user.sucursal.codigo,
          codigoPuntoVenta: user.puntoVenta.codigo,
        },
        cliente: {
          codigoCliente: pedido.cliente?.codigoCliente || '00',
          razonSocial: pedido.cliente?.razonSocial || 'Sin Razón Social',
        },
        input: {
          codigoMoneda: user.moneda?.codigo || 1,
          montoTotal: totalAPagar,
          usuario: user.correo || '',
          codigoMetodoPago: pagosFinales[0]?.metodoId || 1,
          numeroTarjeta:
            pagosFinales[0]?.metodoId === 2 ? formatTarjeta(pagosFinales[0].numeroTarjeta) : undefined,
        } as RestPedidoFinalizarInput & { codigoMetodoPago: number; numeroTarjeta?: string },
        metodoPagoVenta: pagosFinales.map((p) => ({
          codigoMetodoPago: p.metodoId,
          // Si es cortesía total, el backend exige que la sumatoria de montos sea 0
          monto: esCortesiaTotal ? 0 : p.monto,
        })),
      })

      pedidoFinalizado = true

      // Una vez finalizado válidamente, solicitamos emitir la FACTURA al SIAT
      const facturaResponse = await facturarPedido({
        entidad: {
          codigoSucursal: user.sucursal.codigo,
          codigoPuntoVenta: user.puntoVenta.codigo,
        },
        cliente: {
          codigoCliente: pedido.cliente?.codigoCliente || '00',
          razonSocial: pedido.cliente?.razonSocial || 'Sin Razón Social',
          email: pedido.cliente?.email,
          telefono: pedido.cliente?.telefono,
        },
        pedidoId: pedido._id!,
        input: {
          codigoMoneda: user.moneda?.codigo || 1,
          codigoMetodoPago: metodoPrincipal,
          numeroTarjeta: metodoPrincipal === 2 ? formatTarjeta(pagosFinales[0].numeroTarjeta) : undefined,
          tipoCambio: user.moneda?.tipoCambio || 1,
          usuario: user.correo || '',
        },
      })

      setOpenCobroDialog(false)
      setPagosRealizados([])

      // Imprimir Estado de Cuenta automáticamente si está configurado
      if (debeImprimirEstadoCuentaAuto()) {
        try {
          await imprimirEstadoCuenta(pedido, descuento + giftcard, getEstadoCuentaPrinter())
        } catch (err) {
          console.error('Error al imprimir estado de cuenta', err)
        }
      }

      setFacturacionExitosaTelefono(pedido.cliente?.telefono || '')
      setFacturacionExitosaEmail(pedido.cliente?.email || '')

      const pdfUrl = facturaResponse?.factura?.representacionGrafica?.pdf || ''
      setFacturaPdfUrl(pdfUrl)

      setOpenFacturacionExitosaDialog(true)

      // Imprimir factura automáticamente si está configurado
      if (facturaResponse) {
        try {
          await imprimirFactura(facturaResponse, user.tipoRepresentacionGrafica || 'rollo')
        } catch (err) {
          console.error('Error al llamar a imprimirFactura', err)
        }
      }
    } catch (error) {
      if (pedidoFinalizado) {
        console.error('Error al facturar pedido, pero el pedido se finalizó correctamente', error)
        const errorMessage = new MyGraphQlError(error as Error).message
        showError(
          new Error(
            'El pedido se finalizó correctamente, pero hubo un error al facturar. Puede intentar facturarlo luego desde el panel de facturación. Detalle: ' +
              errorMessage,
          ),
        )
        setOpenCobroDialog(false)
        setPagosRealizados([])
        if (onClear) onClear()
        if (onSuccess) onSuccess(null, true)
      } else {
        console.error('Error al finalizar pedido', error)
        showError(new MyGraphQlError(error as Error))
      }
    }
  }

  const [pagosRealizados, setPagosRealizados] = useState<PagoRealizado[]>([])
  const { imprimirComanda, imprimirEstadoCuenta, imprimirFactura, generarUrlComanda } = useComandaPdf()

  // Handler manual del botón "Cuenta" — guarda si hay cambios y luego imprime Estado de Cuenta
  const handleImprimirCuenta = async () => {
    if (!mesaSeleccionada?.pedido) return
    const { pedido } = mesaSeleccionada
    if (!pedido._id || pedido._id.startsWith('nuevo-')) return

    // Si hay cambios sin guardar, actualizamos primero para que el estado de cuenta sea exacto
    let pedidoActual = pedido
    if (isPedidoDirty) {
      const response = await handleRegistrar()
      if (!response) return // Error al guardar — handleRegistrar ya muestra el error
      if (onSuccess) onSuccess(response) // Actualizar el carrito
      pedidoActual = response as typeof pedido
    }

    try {
      console.log('imprimirEstadoCuenta', pedidoActual, getEstadoCuentaPrinter())
      await imprimirEstadoCuenta(pedidoActual, descuento + giftcard, getEstadoCuentaPrinter())
    } catch (err) {
      showError(
        new MyGraphQlError(err instanceof Error ? err : new Error('Error al imprimir estado de cuenta')),
      )
    }
  }

  // --- Reimprimir Comanda (click derecho en "Cuenta") ---
  const [contextMenuAnchor, setContextMenuAnchor] = useState<HTMLElement | null>(null)
  const [reimprimirComandaOpen, setReimprimirComandaOpen] = useState(false)
  const [reimprimirComandaPdfUrl, setReimprimirComandaPdfUrl] = useState<string | null>(null)

  const handleCuentaContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setContextMenuAnchor(e.currentTarget)
  }

  const handleReimprimirComandaOpen = async () => {
    setContextMenuAnchor(null)
    if (!mesaSeleccionada?.pedido) return
    const url = await generarUrlComanda(mesaSeleccionada.pedido, { ignorarHistorico: true })
    setReimprimirComandaPdfUrl(url)
    setReimprimirComandaOpen(true)
  }

  const handleReimprimirComandaExecute = async () => {
    if (!mesaSeleccionada?.pedido) return
    await imprimirComanda(mesaSeleccionada.pedido, getComandaPrinter(), { ignorarHistorico: true })
  }

  // Abre el diálogo de dividir — guarda cambios primero si los hay
  const handleOpenDividir = async () => {
    if (isPedidoDirty) {
      const response = await handleRegistrar()
      if (!response) return
      if (onSuccess) onSuccess(response) // Actualizar el carrito con la respuesta del servidor
    }

    setOpenDividirDialog(true)
  }

  // Abre el diálogo de transferir — guarda cambios primero si los hay
  const handleOpenTransferir = async () => {
    if (!mesaSeleccionada?.pedido) return
    const { pedido } = mesaSeleccionada
    const isNuevo = !pedido._id || pedido._id.startsWith('nuevo-')
    if (isNuevo) return // Pedido no registrado aún, el botón está disabled

    if (isPedidoDirty) {
      const response = await handleRegistrar()
      if (!response) return
      if (onSuccess) onSuccess(response) // Actualizar el carrito con la respuesta del servidor
    }

    setOpenTransferirDialog(true)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.modal + 1 }} open={isPending}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="inherit" size={48} />
          <Typography variant="h6" fontWeight={600}>
            {loadingMessage}
          </Typography>
        </Stack>
      </Backdrop>

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
            editar={hasStaticPermission('VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:INGRESAR_DESCUENTO')}
            onChange={(val) => {
              setDescuento(val || 0)
              if ((val || 0) > 0 && onDescuentoChange) onDescuentoChange()
            }}
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
            editar={hasStaticPermission('VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:INGRESAR_GIFTsCARD')}
            onChange={(val) => {
              setGiftcard(val || 0)
              if ((val || 0) > 0 && onDescuentoChange) onDescuentoChange()
            }}
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
            disabled={
              !mesaSeleccionada?.pedido?._id ||
              mesaSeleccionada.pedido._id.startsWith('nuevo-') ||
              !hasStaticPermission('VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:IMPRIMIR_CUENTA')
            }
            onClick={handleImprimirCuenta}
            onContextMenu={handleCuentaContextMenu}
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
            disabled={
              !mesaSeleccionada?.pedido?._id ||
              mesaSeleccionada.pedido._id.startsWith('nuevo-') ||
              !hasStaticPermission('VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:DIVIDIR_CUENTA')
            }
            onClick={handleOpenDividir}
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
            disabled={
              !mesaSeleccionada?.pedido?._id ||
              mesaSeleccionada.pedido._id.startsWith('nuevo-') ||
              !hasStaticPermission('VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:TRANFERIR_MESA')
            }
            onClick={handleOpenTransferir}
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
            disabled={
              !mesaSeleccionada || !hasStaticPermission('VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:CANCELAR_PEDIDO')
            }
            onClick={handleCancelar}
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
            disabled={
              !mesaSeleccionada ||
              (!mesaSeleccionada?.pedido?._id || mesaSeleccionada.pedido._id.startsWith('nuevo-')
                ? !hasStaticPermission('VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:REGISTRAR_PEDIDO')
                : !hasStaticPermission('VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:ACTUALIZAR_PEDIDO'))
            }
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
              : !mesaSeleccionada?.pedido?._id || mesaSeleccionada.pedido._id.startsWith('nuevo-')
                ? 'Registrar'
                : 'Actualizar'}
          </Button>
          <Button
            variant="contained"
            size="large"
            disabled={
              !mesaSeleccionada ||
              !mesaSeleccionada.pedido ||
              !mesaSeleccionada.pedido.productos ||
              mesaSeleccionada.pedido.productos.length === 0 ||
              !hasStaticPermission('VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:COBRAR')
            }
            onClick={handleOpenCobro}
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

      {/* Dialogo de cobro */}
      <RrCobroDialog
        open={openCobroDialog}
        onClose={() => setOpenCobroDialog(false)}
        isProcessing={isPending}
        subtotal={subtotal}
        descuento={descuento}
        giftcard={giftcard}
        clienteInfo={
          mesaSeleccionada?.pedido?.cliente && mesaSeleccionada.pedido.cliente.codigoCliente !== '00'
            ? `Cobro a: ${mesaSeleccionada.pedido.cliente.razonSocial || ''} - ${mesaSeleccionada.pedido.cliente.numeroDocumento || ''}`
            : 'Cobro a: Sin Razón Social'
        }
        onDescuentoChange={(val) => setDescuento(val)}
        onGiftcardChange={(val) => setGiftcard(val)}
        totalAPagar={Math.max(0, subtotal - descuento - giftcard)}
        pagosRealizados={pagosRealizados}
        onAddPago={(metodoId, metodoNombre, monto, numeroTarjeta) =>
          setPagosRealizados((prev) => [
            ...prev,
            { id: Date.now().toString(), metodoId, metodoNombre, monto, numeroTarjeta },
          ])
        }
        onRemovePago={(id) => setPagosRealizados((prev) => prev.filter((p) => p.id !== id))}
        onFinalizar={handleFinalizar}
        onFacturar={handleFacturar}
      />
      {/* Dialogo Facturacion Exitosa */}
      <RrFacturacionExitosaDialog
        open={openFacturacionExitosaDialog}
        onClose={() => {
          setOpenFacturacionExitosaDialog(false)
          if (onClear) onClear()
          if (onSuccess) onSuccess(null, true)
        }}
        initialTelefono={facturacionExitosaTelefono}
        initialEmail={facturacionExitosaEmail}
        onSendWhatsapp={async (telefono) => {
          try {
            await sendFactura({
              telefono,
              urlPdf: facturaPdfUrl,
              nombreFactura: `Factura ${mesaSeleccionada?.pedido?.cliente?.razonSocial || ''}`.trim(),
            })
            onSuccess?.('Factura enviada correctamente')
          } catch (error) {
            console.error('Error al enviar WhatsApp', error)
            showError(new MyGraphQlError(error as Error))
          }
        }}
        onSendEmail={(email) => {
          // TODO: Implement email sending
          console.log('Sending email to', email)
        }}
        isClienteReal={
          mesaSeleccionada?.pedido?.cliente?.codigoCliente !== '00' &&
          !!mesaSeleccionada?.pedido?.cliente?.razonSocial &&
          mesaSeleccionada?.pedido?.cliente?.razonSocial.trim().toLowerCase() !== 'sin razón social' &&
          mesaSeleccionada?.pedido?.cliente?.razonSocial.trim() !== ''
        }
      />
      {/* Context menu click derecho "Cuenta" */}
      <SecureComponent staticPermission="VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:REIMPRIMIR_COMANDA">
        <Menu
          anchorEl={contextMenuAnchor}
          open={Boolean(contextMenuAnchor)}
          onClose={() => setContextMenuAnchor(null)}
        >
          <MenuItem onClick={handleReimprimirComandaOpen}>
            <ReceiptLongOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
            Reimprimir Comanda
          </MenuItem>
        </Menu>
      </SecureComponent>

      {/* Dialog previsualización comanda */}
      <PdfViewerDialog
        open={reimprimirComandaOpen}
        pdfUrl={reimprimirComandaPdfUrl}
        title="Reimprimir Comanda"
        onClose={() => {
          setReimprimirComandaOpen(false)
          if (reimprimirComandaPdfUrl) URL.revokeObjectURL(reimprimirComandaPdfUrl)
          setReimprimirComandaPdfUrl(null)
        }}
      />

      {/* Dialogo Dividir Cuenta */}
      {mesaSeleccionada?.pedido && (
        <RrDividirCuentaDialog
          open={openDividirDialog}
          onClose={() => setOpenDividirDialog(false)}
          mesaSeleccionada={mesaSeleccionada}
          registrarPedido={registrarPedido}
          actualizarPedido={actualizarPedido}
          finalizarPedido={finalizarPedido}
          facturarPedido={facturarPedido}
          user={user}
          isPending={isPending}
          onDividido={(productosRestantes, pedidoActualizado) => {
            setOpenDividirDialog(false)
            // Pasar el pedido actualizado del servidor para que mesaSeleccionada
            // se actualice con los productos correctos (sin los divididos).
            if (onSuccess) onSuccess(pedidoActualizado)
          }}
        />
      )}

      {/* Dialogo Transferir Mesa */}
      {mesaSeleccionada?.pedido && openTransferirDialog && (
        <RrTransferirMesaDialog
          open={openTransferirDialog}
          onClose={() => setOpenTransferirDialog(false)}
          mesaSeleccionada={mesaSeleccionada}
          onTransferir={handleTransferirSubmit}
          user={user}
          isPending={isActualizarPending}
        />
      )}
    </Box>
  )
}

export default RrAcciones
