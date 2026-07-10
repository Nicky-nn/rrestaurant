import { CheckCircleOutline } from '@mui/icons-material'
import { Alert, AlertTitle, Box, CircularProgress, Divider, Grid, Paper, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useMemo, useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'
import AnomaliasGrafico from '../../../pos/view/listado/AnomaliasGrafico'
import AnomaliasListado from './AnomaliasListado'
import { client } from '../../../restaurante/client'
import { RestPedidoAuditoria } from '../../types'
import { RESTPEDIDOAUDITORIAREPORTEANOMALIA } from '../../queries/useRestPedidoAuditoriaReporteAnomalia'

type Props = {
  fechaInicial: Date
  fechaFinal: Date
  codigoSucursal: number
  stats?: any
  triggerSearch: number
}

const PedidosSospechososListado = ({
  fechaInicial,
  fechaFinal,
  codigoSucursal,
  stats,
  triggerSearch,
}: Props) => {
  const {
    data: pedidosAuditoria,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['pedidos-anomalias', fechaInicial, fechaFinal, codigoSucursal],
    queryFn: async () => {
      const inicioDMY = dayjs(fechaInicial).startOf('day').format('DD/MM/YYYY HH:mm:ss')
      const finDMY = dayjs(fechaFinal).endOf('day').format('DD/MM/YYYY HH:mm:ss')

      const data = await client.request<{ restPedidoAuditoriaReporteAnomalia: RestPedidoAuditoria[] }>(
        RESTPEDIDOAUDITORIAREPORTEANOMALIA,
        {
          codigoSucursal,
          fechaInicial: inicioDMY,
          fechaFinal: finDMY,
        },
      )

      return data.restPedidoAuditoriaReporteAnomalia || []
    },
    enabled: false, // Wait for trigger
  })

  useEffect(() => {
    if (triggerSearch > 0) {
      refetch()
    }
  }, [triggerSearch, refetch])

  const pedidosDocs = pedidosAuditoria ?? []

  const anomalias = useMemo(() => {
    const list: any[] = []
    pedidosDocs.forEach((auditoria: RestPedidoAuditoria) => {
      const puntaje = auditoria.riesgoPuntaje || 0
      const nivel = auditoria.riesgoNivel || (puntaje < 15 ? 'BAJO' : 'OTRO')

      // Ignorar eventos normales (Riesgo BAJO: 0 a 14 puntos)
      if (nivel === 'BAJO' || puntaje < 15) {
        return
      }

      // Iteramos los artículos para reportar las causas si son por artículo
      const modis = auditoria.articulos ?? []
      let hasDetalle = false

      modis.forEach((art) => {
        const cant = art.articuloPrecio?.cantidad ?? 0
        const cantAnt = art.articuloPrecio?.cantidadAnterior ?? cant
        const precio = art.articuloPrecio?.valor ?? 0

        const resumenLower = auditoria.resumenCambios?.toLowerCase() || ''
        const nombreLower = art.nombreArticulo?.toLowerCase() || ''
        const nameInSummary = nombreLower && resumenLower.includes(nombreLower)

        if (art.state === 'ELIMINADO' || cant < cantAnt || nameInSummary) {
          hasDetalle = true
          const resumenPartes = auditoria.resumenCambios?.split('.') || []
          const coincidenciaResumen = art.nombreArticulo
            ? resumenPartes
                .map((s) => s.trim())
                .filter((s) => s.toLowerCase().includes(art.nombreArticulo!.toLowerCase()))
                .join('. ')
            : ''
          const resumenFinal = coincidenciaResumen || auditoria.resumenCambios

          list.push({
            pedidoId: auditoria.pedidoId,
            numeroPedido: auditoria.numeroPedido,
            orden: auditoria.numeroOrden,
            sucursal: auditoria.codigoSucursal,
            puntoVenta: auditoria.codigoPuntoVenta,
            fecha: auditoria.fechaRegistro,
            nombre: art.nombreArticulo || 'General',
            articuloId: art.articuloId || auditoria.pedidoId,
            cantidad: cant,
            precio: precio,
            autor: auditoria.usuario,
            descripcion:
              auditoria.accion !== 'ANULACION'
                ? resumenFinal || 'Modificación de artículo'
                : auditoria.motivosSospecha?.join(', ') || 'Anomalía en artículo',
            resumenCambios: resumenFinal,
            motivosSospecha: auditoria.motivosSospecha,
            accion: auditoria.accion,
            estadoArticulo: auditoria.accion || 'ACTUALIZACION',
            riesgoNivel: auditoria.riesgoNivel,
            riesgoPuntaje: auditoria.riesgoPuntaje,
            duracionMinutos: auditoria.duracionMinutos,
          })
        }
      })

      // Si no fue un artículo específico el anómalo (ej: tiempo muy corto, monto muy bajo), lo metemos global
      if (!hasDetalle) {
        list.push({
          pedidoId: auditoria.pedidoId,
          numeroPedido: auditoria.numeroPedido,
          orden: auditoria.numeroOrden,
          sucursal: auditoria.codigoSucursal,
          puntoVenta: auditoria.codigoPuntoVenta,
          fecha: auditoria.fechaRegistro,
          nombre:
            auditoria.accion === 'ANULACION' || auditoria.accion === 'CANCELACION'
              ? 'PEDIDO COMPLETO'
              : auditoria.articulos
                  ?.map((art) => art.nombreArticulo)
                  .filter(Boolean)
                  .join(', ') || 'PEDIDO COMPLETO',
          articuloId: auditoria.pedidoId,
          cantidad: 1,
          precio: auditoria.totales?.operacion?.totalFinal || 0,
          autor: auditoria.usuario,
          descripcion:
            auditoria.accion !== 'ANULACION' && auditoria.accion !== 'CANCELACION'
              ? auditoria.resumenCambios || `Evento: ${auditoria.accion}`
              : auditoria.motivosSospecha?.join(', ') ||
                auditoria.resumenCambios ||
                `Evento: ${auditoria.accion}`,
          resumenCambios: auditoria.resumenCambios,
          motivosSospecha: auditoria.motivosSospecha,
          accion: auditoria.accion,
          estadoArticulo: auditoria.accion || 'REVISION',
          riesgoNivel: auditoria.riesgoNivel,
          riesgoPuntaje: auditoria.riesgoPuntaje,
          duracionMinutos: auditoria.duracionMinutos,
        })
      }
    })
    return list
  }, [pedidosDocs, stats])

  return (
    <Box>
      {isFetching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          <AlertTitle>Error</AlertTitle>
          Error al cargar pedidos
        </Alert>
      )}

      {triggerSearch === 0 || (!pedidosAuditoria && !isFetching) ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Selecciona un rango de fechas y haz clic en <strong>"Consultar Anomalías"</strong> para analizar
            los pedidos.
          </Typography>
        </Paper>
      ) : null}

      {!isFetching && pedidosAuditoria && !anomalias.length && triggerSearch > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Asegúrate de haber presionado <strong>"Generar Stats"</strong> previamente para que el análisis
            sea preciso.
          </Typography>

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
