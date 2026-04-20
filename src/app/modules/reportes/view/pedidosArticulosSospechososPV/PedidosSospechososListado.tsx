import { CheckCircleOutline } from '@mui/icons-material'
import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useMemo } from 'react'

import AnomaliasGrafico from './AnomaliasGrafico'
import AnomaliasListado from './AnomaliasListado'
import { useMrtQuery } from '../../../../base/components/Table/useMrtQuery'
import { genMrtQueryPagination } from '../../../../base/components/Table/genMrtQueryPagination'
import { client } from '../../../restaurante/client'
import { RESTPEDIDOLISTADO } from '../../../restaurante/queries/useRestPedidoListado'
import { RestPedidoConnection } from '../../../restaurante'

type Props = {
  fechaInicial: Date
  fechaFinal: Date
  codigoSucursal: number
  codigoPuntoVenta: number[]
  umbral: number
}

//  Calcula media, varianza y desviación estándar por artículo
const calcularEstadisticas = (pedidos: any[], historial: any[]) => {
  const cantidadesPorArticulo: Record<string, number[]> = {}

  const agrupar = (fuente: any[]) => {
    fuente.forEach((pedido) => {
      pedido.articulos?.forEach((item: any) => {
        const id = String(item.articuloId).trim()
        if (!cantidadesPorArticulo[id]) {
          cantidadesPorArticulo[id] = []
        }
        cantidadesPorArticulo[id].push(item.cantidad)
      })
    })
  }

  agrupar(pedidos)
  agrupar(historial)

  const estadisticas: Record<string, { media: number; varianza: number; desviacion: number }> = {}

  for (const [id, cantidades] of Object.entries(cantidadesPorArticulo)) {
    const n = cantidades.length
    const media = cantidades.reduce((a, b) => a + b, 0) / n
    const varianza = cantidades.reduce((suma, valor) => suma + (valor - media) ** 2, 0) / n
    const desviacion = Math.sqrt(varianza)
    estadisticas[id] = { media, varianza, desviacion }
  }

  return estadisticas
}

// Detecta artículos con cantidades fuera del rango esperado
const detectarAnomalias = (pedidos: any[], historial: any[], umbral: number): any[] => {
  const estadisticas = calcularEstadisticas(pedidos, historial)
  const anomalias: any[] = []

  pedidos.forEach((pedido) => {
    const ultimoEstadoPorArticulo = new Map<string, any>()

    pedido.historial?.forEach((registro: any) => {
      registro.articuloOperacion?.forEach((art: any) => {
        const id = String(art.articuloId).trim()
        const previo = ultimoEstadoPorArticulo.get(id)

        if (!previo || registro.nro > previo.nro) {
          ultimoEstadoPorArticulo.set(id, { ...art, nro: registro.nro })
        }
      })
    })

    ultimoEstadoPorArticulo.forEach((art, id) => {
      const codigo = String(art.codigoArticulo).trim()
      const precioActual = art?.articuloPrecio?.monedaPrecio?.precio ?? null
      const stat = estadisticas[id]

      // Artículo eliminado
      if (art.state?.toUpperCase() === 'ELIMINADO') {
        anomalias.push({
          pedidoId: pedido.pedidoId,
          numeroPedido: pedido.numeroPedido,
          orden: pedido.numeroOrden,
          historial: pedido.historial,
          productos: pedido.productos,
          sucursal: pedido.sucursal,
          puntoVenta: pedido.puntoVenta,
          fecha: pedido.fecha,
          nombre: art.nombreArticulo,
          articuloId: id,
          cantidad: 0,
          precio: precioActual,
          autor: pedido.autor,
          tipo: 'ELIMINADO',
          descripcion: 'Artículo eliminado del pedido',
          estadoArticulo: 'ELIMINADO',
        })
        return
      }

      // Verificar solo disminuciones fuera del rango normal
      if (stat?.desviacion) {
        const limiteInferior = stat.media - umbral * stat.desviacion
        const limiteSuperior = stat.media + umbral * stat.desviacion

        // Buscar producto actual por código
        const productoActual = pedido.productos?.find(
          (p: any) => String(p.codigoArticulo).trim() === codigo
        )

        const cantidadActual = productoActual?.articuloPrecio?.cantidad ?? 0
        const cantidadAnterior = art.articuloPrecio?.cantidad ?? 0

        if (cantidadActual < cantidadAnterior && cantidadActual < limiteInferior) {
          anomalias.push({
            pedidoId: pedido.pedidoId,
            numeroPedido: pedido.numeroPedido,
            orden: pedido.numeroOrden,
            historial: pedido.historial,
            productos: pedido.productos,
            sucursal: pedido.sucursal,
            puntoVenta: pedido.puntoVenta,
            fecha: pedido.fecha,
            nombre: art.nombreArticulo,
            articuloId: id,
            cantidad: cantidadActual,
            precio: precioActual,
            autor: pedido.autor,
            promedio: stat.media.toFixed(2),
            desviacion: stat.desviacion.toFixed(2),
            limiteInferior: limiteInferior.toFixed(2),
            limiteSuperior: limiteSuperior.toFixed(2),
            score: Math.abs(cantidadActual - stat.media) / stat.desviacion,
            tipo: 'ACTUALIZACION',
            descripcion: 'Disminución de cantidad',
            estadoArticulo: art.state?.toUpperCase() || 'DESCONOCIDO',
          })
        }
      }
    })
  })

  return anomalias
}


const PedidosSospechososListado = ({
  fechaInicial,
  fechaFinal,
  codigoSucursal,
  codigoPuntoVenta,
  umbral,
}: Props) => {
  const {
    data: pedidos,
    isError,
    isLoading,
    refetch,
  } = useMrtQuery({
  queryKey: ['pedidos-sospechosos', fechaInicial, fechaFinal, codigoSucursal, codigoPuntoVenta, umbral],
  queryFn: async (ctx) => {
    const { limit, page, reverse, query } = genMrtQueryPagination(ctx)

    const inicio = dayjs(fechaInicial).startOf('day').format('YYYY-MM-DD HH:mm:ss')
    const fin = dayjs(fechaFinal).endOf('day').format('YYYY-MM-DD HH:mm:ss')

    const queryExtra = [
      `fechaDocumento>=${inicio}`,
      `fechaDocumento<=${fin}`,
      `historial.0`,
      `state=FINALIZADO`,
    ].join('&&')

    const entidad = {
      codigoSucursal,
      codigoPuntoVenta: codigoPuntoVenta[0], 
    }

    const data = await client.request<{ restPedidoListado: RestPedidoConnection }>(
      RESTPEDIDOLISTADO,
      {
        entidad,
        limit,
        page,
        reverse,
        query: [query, queryExtra].filter(Boolean).join('&&'),
      }
    )

    return {
      docs: data.restPedidoListado.docs ?? [],
      pageInfo: data.restPedidoListado.pageInfo,
    }
  },
  isServerSide: true,
})
  const pedidosDocs = pedidos?.docs ?? []

const pedidosConHistorial = useMemo(
  () => pedidosDocs.filter((p: any) => p.historial && p.historial.length > 0),
  [pedidosDocs],
)

  const pedidosRecientes = pedidosConHistorial.map((pedido: any) => ({
    pedidoId: pedido._id,
    fecha: pedido.fechaDocumento,
    numeroPedido: pedido.numeroPedido,
    numeroOrden: pedido.numeroOrden,
    autor: pedido.usucre,
    sucursal: pedido.sucursal.codigo,
    puntoVenta: pedido.puntoVenta.codigo,
    productos: pedido.productos,
    historial: pedido.historial,
    articulos: (pedido.productos || []).map((prod: any) => ({
      articuloId: prod.articuloId,
      nombre: prod.nombreArticulo,
      cantidad: prod.articuloPrecio.cantidad,
      precio: prod.articuloPrecio.monedaPrecio.precio,
    })),
  }))

  const historialPedidos = pedidosConHistorial.flatMap((pedido: any) =>
    (pedido.historial || []).map((registro: any) => ({
      fecha: pedido.fechaDocumento,
      articulos: (registro.articuloOperacion || [])
        .filter(
          (a: any) =>
            a.state?.toUpperCase() === 'ELIMINADO' || a.articuloPrecio?.cantidad != null,
        )
        .map((a: any) => ({
          articuloId: a.articuloId,
          nombre: a.nombreArticulo,
          cantidad: a.articuloPrecio?.cantidad,
          estado: a.state ?? 'DESCONOCIDO',
        })),
    })),
  )

  const anomalias = useMemo(
    () => detectarAnomalias(pedidosRecientes, historialPedidos, umbral),
    [pedidosRecientes, historialPedidos, umbral],
  )

  return (
    <Box>
      {isLoading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress size={40} />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          <AlertTitle>Error</AlertTitle>
          Error al cargar pedidos
        </Alert>
      )}

      {!isLoading && !anomalias.length && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
          }}
        >
          <CheckCircleOutline
            sx={{
              fontSize: 64,
              color: '#4caf50',
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ¡Excelente! No se encontraron anomalías
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Todos los pedidos están funcionando correctamente
          </Typography>
        </Paper>
      )}

      {anomalias.length > 0 && (
        <Grid container spacing={2} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 7 }}>
            <AnomaliasListado anomalias={anomalias} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Divider sx={{ mb: 2 }}>Anomalías</Divider>
            <AnomaliasGrafico anomalias={anomalias} />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default PedidosSospechososListado
