import { Box, Grid } from '@mui/material'
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react'

import useAuth from '../../../base/hooks/useAuth'
import { ESTADO_MESA, MesaUI } from '../interfaces/mesa.interface'
import { useRestEspacioPorSucursal } from '../queries/useRestEspacioPorSucursal'
import { useRestPedidoListado } from '../queries/useRestPedidoListado'
import { useRestPedidoMesasOcupadas } from '../queries/useRestPedidoMesasOcupadas'
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
  console.log('[RestRegistrar] Renderizando... Usuario:', user.usuario)
  const codigoSucursal = user.sucursal.codigo
  const codigoPuntoVenta = user.puntoVenta.codigo
  const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaUI | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  // Obtener la lista de espacios de la sucursal actual
  const { data: espaciosRaw = [] } = useRestEspacioPorSucursal({ codigoSucursal })
  // Excluir el espacio marcado como 'default' porque ese ES el Salón Principal (ubicacion null)
  const espaciosData = espaciosRaw.filter((e) => !e.default)

  // Estado del espacio actual (inicializado del localstorage si hay caché)
  const [espacio, setEspacio] = useState<string | null>(() => {
    const cachedData = localStorage.getItem('ubicacion')
    return cachedData ? JSON.parse(cachedData)?._id : null
  })

  // Función para cambiar de ubicación desde la UI
  const handleChangeEspacio = (nuevoEspacioId: string | null) => {
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
    setMesaSeleccionada(null)
    setFocusedIndex(-1)
  }

  // Generar queryString con filtro de ubicación actual, omitiendo finalizados/anulados
  const queryParams = espacio
    ? `espacio=${espacio}&state!=FINALIZADO&state!=ANULADO&state!=CANCELADO`
    : 'mesa.ubicacion=null&state!=FINALIZADO&state!=ANULADO&state!=CANCELADO'

  // Obtener pedidos completos de la sucursal actual con el query de ubicación
  console.log('queryParams', queryParams)
  const {
    data: pedidosData,
    isLoading: pedidosLoading,
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
    const pedidos = pedidosData?.docs || []

    // El backend ya filtra por espacio mediante queryParams, así que todos los pedidos
    // retornados pertenecen al espacio actual. Solo mapeamos por nombre de mesa.
    const misPedidosByMesa = new Map(pedidos.filter((p) => p.mesa?.nombre).map((p) => [p.mesa!.nombre, p]))

    const pedidosById = new Map(pedidos.map((p) => [p._id, p]))

    const mapaMesasOcupadas = new Map(
      mesasOcupadas
        .filter((mo) => mo.mesa?.nombre)
        .map((mo) => {
          const pedidoCompleto = mo.pedidoId ? pedidosById.get(mo.pedidoId) : null
          return [
            mo.mesa!.nombre,
            {
              usuario: mo.usucre || 'Usuario',
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
        })
      } else {
        const mesaOcupada = mapaMesasOcupadas.get(nombreMesa)

        const correspondeEspacio = mesaOcupada?.ubicacion === (espacio || null)

        if (mesaOcupada && correspondeEspacio) {
          const pedido = mesaOcupada.pedido || undefined
          const usuarioOcupante = mesaOcupada.usuario

          if (usuarioOcupante === user.usuario) {
            mesas.push({
              _id: pedido?._id || `mesa-${i}`,
              value: nombreMesa,
              label: `Mesa ${nombreMesa}`,
              estado: ESTADO_MESA.OCUPADO,
              pedido,
            })
          } else {
            mesas.push({
              _id: `mesa-ocupada-${i}`,
              value: nombreMesa,
              label: `Mesa ${nombreMesa}`,
              estado: ESTADO_MESA.OCUPADO_OTRO,
              pedido,
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
  }, [pedidosData, mesasOcupadas, user.usuario, espacio, espaciosData])

  // Generar un color de fondo pastel distinto por cada espacio usando hash del _id
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

  return (
    <Grid
      container
      spacing={2}
      sx={{
        height: 'calc(100vh - 150px)',
        flexGrow: 1,
        minHeight: 0,
        overflow: 'hidden',
        m: 0,
        pb: 2,
        width: '100%',
      }}
    >
      <Grid
        size={{ xs: 12, md: 8 }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}
      >
        <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <RrMesas
            options={mesas}
            selectedOption={mesaSeleccionada}
            setSelectedOption={setMesaSeleccionada}
            focusedIndex={focusedIndex}
            setFocusedIndex={setFocusedIndex}
            codigoSucursal={codigoSucursal}
            isLoading={pedidosLoading}
            bgColor={bgColor}
          />
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <RrCategoriasProductos
            espacios={espaciosData}
            espacioSeleccionado={espacio}
            onChangeEspacio={handleChangeEspacio}
          />
        </Box>
      </Grid>

      <Grid
        size={{ xs: 12, md: 4 }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <RrCarrito mesaSeleccionada={mesaSeleccionada} />
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          <RrAcciones />
        </Box>
      </Grid>
    </Grid>
  )
}

export default RestRegistrar
