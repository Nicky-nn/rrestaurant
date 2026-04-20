import { Alert, Box, Grid, Snackbar } from '@mui/material'
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import useAuth from '../../../base/hooks/useAuth'
import { articuloToArticuloOperacionInputService } from '../../../base/services/articuloToArticuloOperacionInputService'
import { ESTADO_MESA, MesaUI } from '../interfaces/mesa.interface'
import { useRestEspacioPorSucursal } from '../queries/useRestEspacioPorSucursal'
import { useRestPedidoListado } from '../queries/useRestPedidoListado'
import { useRestPedidoMesasOcupadas } from '../queries/useRestPedidoMesasOcupadas'
import {
  Articulo,
  ArticuloModificadorOperacionInput,
  ArticuloOperacion,
  ArticuloOperacionModificador,
  ArticuloPrecioOperacion,
  ArticuloRecetaOperacionInput,
  RestPedido,
} from '../types'
import RrAcciones from './registrar/RrAcciones'
import RrCarrito from './registrar/RrCarrito'
import RrCategoriasProductos from './registrar/RrCategoriasProductos'
import RrMesas from './registrar/RrMesas'

/**
 * RestRegistrar
 * Layout de 2 columnas:
 *  - Columna izquierda:  RrMesas + RrCategoriasProductos
 *  - Columna derecha:    RrCarrito + RrAcciones
 */
const RestRegistrar: FunctionComponent = () => {
  const { user } = useAuth()
  const codigoSucursal = user.sucursal.codigo
  const codigoPuntoVenta = user.puntoVenta.codigo
  const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaUI | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; key: number }>({
    open: false,
    message: '',
    key: 0,
  })
  const [ultimoPedidoExitoso, setUltimoPedidoExitoso] = useState<any>(null)
  const [isPedidoDirty, setIsPedidoDirty] = useState(false)

  const handleMesaSeleccionada = useCallback((mesa: MesaUI | null) => {
    setMesaSeleccionada(mesa)
    setIsPedidoDirty(false)
  }, [])

  // Obtener la lista de espacios de la sucursal actual
  const { data: espaciosRaw = [] } = useRestEspacioPorSucursal({ codigoSucursal })
  // Excluir el espacio marcado como 'default' porque ese ES el Salón Principal (ubicacion null)
  const espaciosData = espaciosRaw.filter((e) => !e.default)

  // Estado del espacio actual (inicializado del localstorage si hay caché)
  const [espacio, setEspacio] = useState<string | null>(() => {
    const cachedData = localStorage.getItem('ubicacion')
    return cachedData ? JSON.parse(cachedData)?._id : null
  })

  const [loadingEspacio, setLoadingEspacio] = useState(false)

  // Función para cambiar de ubicación desde la UI
  const handleChangeEspacio = (nuevoEspacioId: string | null) => {
    if (nuevoEspacioId === espacio) return // Fix bug: evitar re-reder e infinite loading

    setLoadingEspacio(true)
    setEspacio(nuevoEspacioId)
    if (nuevoEspacioId) {
      const selected = espaciosData.find((e) => e._id === nuevoEspacioId)
      if (selected) {
        localStorage.setItem('ubicacion', JSON.stringify(selected))
      }
    } else {
      localStorage.removeItem('ubicacion')
    }
    // Limpiar la selección actual
    handleMesaSeleccionada(null)
    setFocusedIndex(-1)
  }

  // Generar queryString con filtro de ubicación actual, omitiendo finalizados/anulados
  const queryParams = espacio
    ? `espacio=${espacio}&state!=FINALIZADO&state!=ANULADO&state!=CANCELADO`
    : 'mesa.ubicacion=null&state!=FINALIZADO&state!=ANULADO&state!=CANCELADO'

  // Obtener pedidos completos de la sucursal actual con el query de ubicación
  const {
    data: pedidosData,
    isLoading: pedidosLoading,
    isFetching: pedidosFetching,
    refetch: refetchPedidos,
  } = useRestPedidoListado(
    {
      entidad: {
        codigoSucursal,
        codigoPuntoVenta,
      },
      limit: 100,
      reverse: true,
      query: queryParams,
    },
    {
      staleTime: 0,
    },
  )

  // Apagar loadingEspacio cuando el fetch termina
  useEffect(() => {
    if (!pedidosFetching) {
      // Pequeño timeout para evitar parpadeos visuales si la respuesta es instantánea (caché)
      const t = setTimeout(() => setLoadingEspacio(false), 200)
      return () => clearTimeout(t)
    }
  }, [pedidosFetching])

  // Obtener mesas ocupadas por otros usuarios (actualización cada 10s)
  const { data: mesasOcupadas = [], refetch: refetchMesas } = useRestPedidoMesasOcupadas(
    {
      codigoSucursal,
      espacioId: espacio || undefined,
    },
    {
      staleTime: 0,
    },
  )

  // Almacenar cantidad anterior de mesas para detectar cambios
  const mesasOcupadasPrevRef = useRef<number>(0)

  // Actualización automática solo para mesas ocupadas cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMesas()
    }, 10000)

    return () => clearInterval(interval)
  }, [refetchMesas])

  // Detectar cambios en mesasOcupadas y actualizar pedidos si hay cambio
  useEffect(() => {
    const cantidadActual = mesasOcupadas.length
    if (mesasOcupadasPrevRef.current !== 0 && mesasOcupadasPrevRef.current !== cantidadActual) {
      console.log(
        `[RestRegistrar] Cambio detectado: ${mesasOcupadasPrevRef.current} → ${cantidadActual} mesas. Actualizando...`,
      )
      refetchPedidos()
    }
    mesasOcupadasPrevRef.current = cantidadActual
  }, [mesasOcupadas, refetchPedidos])

  // Limpiar el parche optimista tan pronto como lleguen nuevos datos del backend
  useEffect(() => {
    setUltimoPedidoExitoso(null)
  }, [pedidosData])

  // Generar lista de mesas combinando disponibles con pedidos activos
  const mesas = useMemo<MesaUI[]>(() => {
    // Determinar la cantidad de mesas basada en el espacio actual
    let numeroMesas = 50
    if (espacio) {
      const espacioActual = espaciosData.find((e) => e._id === espacio)
      if (espacioActual?.nroMesas && typeof espacioActual.nroMesas === 'number') {
        numeroMesas = espacioActual.nroMesas
      }
    }

    const mesas: MesaUI[] = []
    const pedidos = pedidosData?.docs ? [...pedidosData.docs] : []

    // Parche optimista instantáneo para que la tarjeta cambie su nombre rápido sin esperar el refetch
    if (ultimoPedidoExitoso && ultimoPedidoExitoso._id) {
      const idx = pedidos.findIndex((p) => p._id === ultimoPedidoExitoso._id)
      if (idx !== -1) {
        pedidos[idx] = { ...pedidos[idx], ...ultimoPedidoExitoso }
      } else {
        pedidos.push(ultimoPedidoExitoso)
      }
    }

    // El backend ya filtra por espacio mediante queryParams, así que todos los pedidos
    // retornados pertenecen al espacio actual. Solo mapeamos por nombre de mesa.
    const misPedidosByMesa = new Map(pedidos.filter((p) => p.mesa?.nombre).map((p) => [p.mesa!.nombre, p]))

    const pedidosById = new Map(pedidos.map((p) => [p._id, p]))

    const mapaMesasOcupadas = new Map(
      mesasOcupadas
        .filter((mo) => mo.mesa?.nombre && (mo.mesa.ubicacion || null) === (espacio || null))
        .map((mo) => {
          const pedidoCompleto = mo.pedidoId ? pedidosById.get(mo.pedidoId) : null
          return [
            mo.mesa!.nombre,
            {
              usuario: mo.usucre || 'Usuario',
              codigoPuntoVenta: mo.codigoPuntoVenta,
              pedidoId: mo.pedidoId,
              pedido: pedidoCompleto,
              ubicacion: mo.mesa!.ubicacion || null,
            },
          ]
        }),
    )

    for (let i = 1; i <= numeroMesas; i++) {
      const nombreMesa = i.toString()

      const miPedido = misPedidosByMesa.get(nombreMesa)

      if (miPedido) {
        mesas.push({
          _id: miPedido._id || `mesa-${i}`,
          value: nombreMesa,
          label: `Mesa ${nombreMesa}`,
          estado: ESTADO_MESA.OCUPADO,
          pedido: miPedido,
          usuarioOcupante: miPedido.usucre,
        })
      } else {
        const mesaOcupada = mapaMesasOcupadas.get(nombreMesa)

        const correspondeEspacio = mesaOcupada?.ubicacion === (espacio || null)

        if (mesaOcupada && correspondeEspacio) {
          let pedido = mesaOcupada.pedido || undefined
          const usuarioOcupante = mesaOcupada.usuario
          const posOcupante = mesaOcupada.codigoPuntoVenta

          // Validar coherencia: Si el pedido asociado dice estar en otra mesa (por transferencia reciente),
          // ignorar la ocupación 'stale' de esta posición.
          if (pedido?.mesa?.nombre && pedido.mesa.nombre !== nombreMesa) {
            pedido = undefined
          }

          // Es de mi punto de venta si el código coincide
          const esMio = posOcupante === user.puntoVenta.codigo

          // Si el backend reporta la mesa como ocupada por MI punto de venta,
          // pero ya no existe pedido activo (o se movió), es un falso positivo (stale flag)
          if (esMio && !pedido) {
            mesas.push({
              _id: `mesa-${i}`,
              value: nombreMesa,
              label: `Mesa ${nombreMesa}`,
              estado: ESTADO_MESA.LIBRE,
            })
            continue
          }

          if (esMio) {
            mesas.push({
              _id: pedido?._id || `mesa-${i}`,
              value: nombreMesa,
              label: `Mesa ${nombreMesa}`,
              estado: ESTADO_MESA.OCUPADO,
              pedido,
              usuarioOcupante,
            })
          } else {
            mesas.push({
              _id: `mesa-ocupada-${i}`,
              value: nombreMesa,
              label: `Mesa ${nombreMesa}`,
              estado: ESTADO_MESA.OCUPADO_OTRO,
              pedido: pedido || undefined, // A veces de otro punto de venta no tendremos los datos del pedido
              usuarioOcupante,
            })
          }
        } else {
          mesas.push({
            _id: `mesa-${i}`,
            value: nombreMesa,
            label: `Mesa ${nombreMesa}`,
            estado: ESTADO_MESA.LIBRE,
          })
        }
      }
    }

    return mesas
  }, [pedidosData, mesasOcupadas, user.puntoVenta.codigo, espacio, espaciosData, ultimoPedidoExitoso])

  // Generar un color de fondo pastel distinto por cada espacio usando hash del _id
  // Ref estable que siempre apunta al valor actual de mesaSeleccionada.
  // Permite que handleAddProduct tenga deps=[] sin quedarse con un valor stale.
  const mesaSeleccionadaRef = useRef(mesaSeleccionada)
  useEffect(() => {
    mesaSeleccionadaRef.current = mesaSeleccionada
  }, [mesaSeleccionada])

  const bgColor = useMemo(() => {
    if (!espacio) return 'rgba(255, 255, 255, 0)' // Salón Principal: sin tinte
    const idx = espaciosData.findIndex((e) => e._id === espacio)
    // Paleta de colores pasteles diferenciados, uno por slot de espacio
    const paleta = [
      'rgba(179, 229, 252, 0.35)', // celeste
      'rgba(255, 224, 178, 0.35)', // naranja suave
      'rgba(225, 190, 231, 0.35)', // lila
      'rgba(178, 255, 218, 0.35)', // menta
      'rgba(255, 245, 157, 0.35)', // amarillo
      'rgba(255, 205, 210, 0.35)', // rosa
      'rgba(197, 225, 165, 0.35)', // verde
      'rgba(207, 216, 220, 0.35)', // gris azulado
    ]
    return paleta[idx % paleta.length]
  }, [espacio, espaciosData])

  const handleAddProduct = useCallback(
    (payload: {
      articulo: Articulo
      cantidad: number
      notasIds: string[]
      variacionReceta?: ArticuloRecetaOperacionInput[]
      modificadoresInput?: ArticuloModificadorOperacionInput[]
      precioUnitario?: number
    }) => {
      if (!mesaSeleccionadaRef.current) {
        alert('Por favor selecciona una mesa (o pedido Para Llevar / Delivery) antes de agregar productos.')
        return
      }

      const {
        articulo,
        cantidad,
        notasIds,
        variacionReceta = [],
        modificadoresInput = [],
        precioUnitario,
      } = payload

      // Calculamos si ya existe el item usando la ref (fuera del setState)
      // para poder mostrar el toast ANTES de actualizar el estado.
      const productosActuales = mesaSeleccionadaRef.current?.pedido?.productos || []
      const notasNuevasSorted = [...notasIds].sort()

      // Firma de variacionReceta: lista de codigoArticulo+removido+esExtra para comparar identidad
      const vrNuevaFirma = [...variacionReceta]
        .map((v) => `${v.codigoArticulo}:${v.removido ? 'R' : ''}${v.esExtra ? 'E' : ''}`)
        .sort()
        .join('|')

      // Firma de modificadores usando codigoArticulo:cantidad como clave estable.
      // - articuloModificadorId (ID de grupo) difiere entre servidor y local → no sirve.
      // - precio no sirve porque servidor lo guarda en `valor` y el modal en `precio`.
      // - codigoArticulo identifica unívocamente la opción elegida.
      const buildModsFirma = (
        mods: Array<{ codigoArticulo?: string | null; articuloPrecio?: { cantidad?: number } | null }>,
      ) =>
        mods
          .map((m) => `${m.codigoArticulo ?? ''}:${m.articuloPrecio?.cantidad ?? 1}`)
          .sort()
          .join('|')

      const modsNuevaFirma = buildModsFirma(modificadoresInput)

      const yaExiste = productosActuales.some((p) => {
        const pId = p.articuloId || (p as any).articulo?._id || (p as any)._id
        if (pId !== articulo._id) return false
        const pNotas = [...(p.notaRapida?.map((n) => n.valor).filter(Boolean) || [])].sort()
        if (pNotas.join('|') !== notasNuevasSorted.join('|')) return false
        if ((p.nota || '').trim() !== '') return false
        // Comparar variacionReceta
        const pVrFirma = [...((p as any).variacionReceta ?? [])]
          .map((v: any) => `${v.codigoArticulo}:${v.removido ? 'R' : ''}${v.esExtra ? 'E' : ''}`)
          .sort()
          .join('|')
        if (pVrFirma !== vrNuevaFirma) return false
        // Comparar modificadores por codigoArticulo:precio (no por articuloModificadorId que puede variar)
        return buildModsFirma(p.modificadores ?? []) === modsNuevaFirma
      })

      if (yaExiste) {
        const qtaActual = productosActuales.find((p) => (p.articuloId || (p as any)._id) === articulo._id)
        const qtaNum =
          (qtaActual?.articuloPrecio?.cantidad ?? qtaActual?.articuloPrecioBase?.cantidad ?? 1) + cantidad
        setSnackbar((s) => ({
          open: true,
          message: `Modificando ${articulo.nombreArticulo} cantidad a ${qtaNum}`,
          key: s.key + 1,
        }))
      } else {
        setSnackbar((s) => ({
          open: true,
          message: `Adicionando ${articulo.nombreArticulo} al carrito`,
          key: s.key + 1,
        }))
      }

      setIsPedidoDirty(true)

      setMesaSeleccionada((prev) => {
        if (!prev) return prev

        const nuevoPedido = prev.pedido
          ? { ...prev.pedido }
          : ({
              _id: `nuevo-${Date.now()}`,
              tipo: prev.value === 'Llevar' ? 'LLEVAR' : 'SALON',
              state: 'NUEVO',
              productos: [],
              totalBase: 0,
              totalCalculado: 0,
              estadoLectura: false, // dummy values
              estadoImpresora: false,
            } as unknown as RestPedido)

        const productos = [...(nuevoPedido.productos || [])]

        // Firma de notas para la búsqueda dentro del setState (misma lógica que la de arriba)
        const notasNuevasSorted = [...notasIds].sort()

        const existingIdx = productos.findIndex((p) => {
          // Misma base de articulo (manejar fallback a _id directo u originado de la prop)
          const pId = p.articuloId || (p as any).articulo?._id || (p as any)._id
          if (pId !== articulo._id) return false

          // Misma nota rapida
          const pNotas = [...(p.notaRapida?.map((n) => n.valor).filter(Boolean) || [])].sort()
          if (pNotas.join('|') !== notasNuevasSorted.join('|')) return false

          // Si existen notas personalizadas escritas a mano (modificadas desde el carrito localmente),
          // son productos distintos por defecto porque vienen limpios de la card.
          if ((p.nota || '').trim() !== '') return false

          // Misma variacionReceta (sin cebolla != con cebolla)
          const pVrFirma = [...((p as any).variacionReceta ?? [])]
            .map((v: any) => `${v.codigoArticulo}:${v.removido ? 'R' : ''}${v.esExtra ? 'E' : ''}`)
            .sort()
            .join('|')
          if (pVrFirma !== vrNuevaFirma) return false

          // Comparar modificadores por codigoArticulo:precio (clave estable).
          // articuloModificadorId cambia entre server y local, no sirve como clave.
          return buildModsFirma(p.modificadores ?? []) === modsNuevaFirma
        })

        if (existingIdx >= 0) {
          // Incrementar la cantidad del producto exacto
          const existing = productos[existingIdx]
          const currentQty = existing.articuloPrecio?.cantidad ?? existing.articuloPrecioBase?.cantidad ?? 1
          const nextQty = currentQty + cantidad

          productos[existingIdx] = {
            ...existing,
            articuloPrecio: { ...existing.articuloPrecio, cantidad: nextQty },
            articuloPrecioBase: { ...existing.articuloPrecioBase, cantidad: nextQty },
          }
        } else {
          // Usar el servicio para obtener lote, almacén y armar la base del producto
          const baseProd = articuloToArticuloOperacionInputService(articulo as any, user.moneda, {
            cantidad,
            autoAlmacen: true,
            autoLote: true,
          })

          const nuevoProd = {
            ...(baseProd as unknown as ArticuloOperacion),
            articuloPrecioBase: {
              cantidad,
              valor: precioUnitario ?? articulo.articuloPrecioBase?.monedaPrimaria?.precio ?? 0,
              precio: precioUnitario ?? articulo.articuloPrecioBase?.monedaPrimaria?.precio ?? 0,
              moneda: articulo.articuloPrecioBase?.monedaPrimaria?.moneda,
              articuloUnidadMedida: articulo.articuloPrecioBase?.articuloUnidadMedida,
            },
            articuloPrecio: {
              cantidad,
              valor: precioUnitario ?? articulo.articuloPrecioBase?.monedaPrimaria?.precio ?? 0,
              precio: precioUnitario ?? articulo.articuloPrecioBase?.monedaPrimaria?.precio ?? 0,
              moneda: articulo.articuloPrecioBase?.monedaPrimaria?.moneda,
              articuloUnidadMedida: articulo.articuloPrecioBase?.articuloUnidadMedida,
            },
            notaRapida: notasIds.map((n) => ({ valor: n })),
            nota: '', // vacias, luego el usuario las setea manual
            cortesia: false,
            variacionReceta: variacionReceta.length > 0 ? variacionReceta : undefined,
            _modificadoresInput: modificadoresInput,
            modificadores: modificadoresInput.map((m) => {
              const qty = m.articuloPrecio?.cantidad ?? 1
              return {
                articuloModificadorId: m.articuloModificadorId,
                articuloId: m.codigoArticulo, // Fallback aproximado
                nroItem: m.nroItem ?? undefined,
                codigoArticulo: m.codigoArticulo || '',
                nombreArticulo: (m as any).nombreArticulo || 'Modificador',
                esOpcionGratuita: m.esOpcionGratuita,
                elegibleParaGratis: (m as any).elegibleParaGratis,
                cantidadIncluida: qty,
                articuloPrecio: m.articuloPrecio as unknown as ArticuloPrecioOperacion,
                state: 'NUEVO',
              } as ArticuloOperacionModificador
            }),
          }
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

  const handleSuccess = useCallback(
    (pedidoRetornado?: any, isFinalizado?: boolean) => {
      const isNuevo =
        !mesaSeleccionadaRef.current?.pedido?._id ||
        mesaSeleccionadaRef.current.pedido._id.startsWith('nuevo-')

      setSnackbar((s) => ({
        open: true,
        message: isFinalizado
          ? 'Pedido finalizado exitosamente'
          : isNuevo
            ? 'Pedido registrado con éxito'
            : 'Pedido actualizado con éxito',
        key: s.key + 1,
      }))

      if (pedidoRetornado && !isFinalizado) {
        setUltimoPedidoExitoso(pedidoRetornado)
      }

      if (!isFinalizado) {
        // Mantenemos al usuario en la misma mesa si solo fue un registro/guardado parcial.
        setMesaSeleccionada((prev) => {
          if (!prev) return prev

          // El backend no siempre devuelve nombreArticulo en modificadores porque el input
          // solo lleva codigoArticulo. Enriquecemos los productos del servidor con el
          // nombreArticulo que teníamos en el estado local (_modificadoresInput o modificadores).
          const localProductos: any[] = prev.pedido?.productos ?? []
          const pedidoEnriquecido = pedidoRetornado
            ? {
                ...pedidoRetornado,
                productos: (pedidoRetornado.productos ?? []).map((serverProd: any) => {
                  if (!serverProd.modificadores?.length) return serverProd

                  // Buscar el producto local correspondiente (mismo artículo)
                  const localProd = localProductos.find(
                    (lp: any) =>
                      lp.codigoArticulo === serverProd.codigoArticulo &&
                      (lp.articuloId === serverProd.articuloId || !lp.articuloId || !serverProd.articuloId),
                  ) as any

                  if (!localProd) return serverProd

                  const localMods: any[] = localProd._modificadoresInput ?? localProd.modificadores ?? []

                  const modsEnriquecidos = serverProd.modificadores.map((m: any) => {
                    if (m.nombreArticulo) return m // el servidor ya lo trae
                    const localMod = localMods.find((lm: any) => lm.codigoArticulo === m.codigoArticulo)
                    return {
                      ...m,
                      nombreArticulo: (localMod as any)?.nombreArticulo || m.codigoArticulo || '',
                    }
                  })

                  return {
                    ...serverProd,
                    modificadores: modsEnriquecidos,
                    // Preservar _modificadoresInput para futuras comparaciones de deduplicación
                    _modificadoresInput: localProd._modificadoresInput,
                  }
                }),
              }
            : prev.pedido

          return {
            ...prev,
            _id: pedidoRetornado?._id || prev._id,
            estado: ESTADO_MESA.OCUPADO,
            pedido: { ...pedidoEnriquecido, _forceSnapshotUpdate: Date.now() } as any,
          }
        })
        setIsPedidoDirty(false)
      }

      refetchPedidos()
    },
    [refetchPedidos],
  )

  const handleCancel = useCallback(() => {
    setSnackbar((s) => ({
      open: true,
      message: `Pedido cancelado exitosamente`,
      key: s.key + 1,
    }))

    // Actualizar solo la mesa actual a estado LIBRE y limpiar el pedido
    setMesaSeleccionada((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        estado: ESTADO_MESA.LIBRE,
        pedido: undefined,
      }
    })
    setIsPedidoDirty(false)

    refetchPedidos()
    refetchMesas()
  }, [refetchMesas, refetchPedidos])

  const handleClear = useCallback(() => {
    setMesaSeleccionada((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        estado: ESTADO_MESA.LIBRE,
        pedido: undefined,
      }
    })
    setIsPedidoDirty(false)
    refetchPedidos()
    refetchMesas()
  }, [refetchMesas, refetchPedidos])

  const handleClientChange = useCallback((cliente: any) => {
    setIsPedidoDirty(true)
    setMesaSeleccionada((prev) => {
      if (!prev) return prev
      // Si el pedido no existe, asumimos estructura base
      const pedidoActual = prev.pedido || { productos: [] }

      // Construimos el objeto cliente compatible con RestPedido['cliente']
      // Nota: ClientProps tiene codigoCliente, razonSocial, nit, email, etc.
      // RestPedido['cliente'] espera ClienteOperacion con codigoCliente, razonSocial...
      const nuevoCliente = {
        _id: cliente._id,
        codigoCliente: cliente.codigoCliente || '0',
        razonSocial: cliente.razonSocial || 'SN',
        numeroDocumento: cliente.numeroDocumento || cliente.nit, // A veces viene como nit
        nit: cliente.nit || cliente.numeroDocumento,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
      }

      return {
        ...prev,
        pedido: {
          ...pedidoActual,
          cliente: nuevoCliente,
        } as any,
      }
    })
  }, [])

  return (
    <>
      <Grid
        container
        spacing={1.5}
        sx={{
          height: 'calc(100vh - 105px)', // Reducido para evitar el scroll
          flexGrow: 1,
          minHeight: 0,
          overflow: 'hidden',
          width: '100%',
          pr: 2,
          pb: 0,
          mb: 0,
          mt: 0,
        }}
      >
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}
        >
          <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <RrMesas
              key={espacio || 'salon-principal'}
              options={mesas}
              selectedOption={mesaSeleccionada}
              setSelectedOption={handleMesaSeleccionada}
              focusedIndex={focusedIndex}
              setFocusedIndex={setFocusedIndex}
              codigoSucursal={codigoSucursal}
              isLoading={pedidosLoading || loadingEspacio}
              bgColor={bgColor}
            />
          </Box>
          <Box
            sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <RrCategoriasProductos
              espacios={espaciosData}
              espacioSeleccionado={espacio}
              onChangeEspacio={handleChangeEspacio}
              onAddProduct={handleAddProduct}
            />
          </Box>
        </Grid>

        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}
        >
          <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <RrCarrito
              mesaSeleccionada={mesaSeleccionada}
              onUpdateProduct={handleUpdateProduct}
              onRemoveProduct={handleRemoveProduct}
              onClientChange={handleClientChange}
            />
          </Box>
          <Box sx={{ flexShrink: 0, mt: 'auto' }}>
            <RrAcciones
              mesaSeleccionada={mesaSeleccionada}
              isPedidoDirty={isPedidoDirty}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              onClear={handleClear}
            />
          </Box>
        </Grid>
      </Grid>
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

export default RestRegistrar
