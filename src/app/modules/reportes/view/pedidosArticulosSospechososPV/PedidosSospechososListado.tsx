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
import { RESTPEDIDOAUDITORIALISTADO } from '../../../reportes/queries/useRestPedidoAuditoriaListado'
import { RESTPEDIDOAUDITORIAREPORTEANOMALIA } from '../../../reportes/queries/useRestPedidoAuditoriaReporteAnomalia'
import { RestPedidoAuditoriaConnection, RestPedidoAuditoria } from '../../../reportes/types'

type Props = {
  fechaInicial: Date
  fechaFinal: Date
  codigoSucursal: number
  stats?: any
}

const PedidosSospechososListado = ({
  fechaInicial,
  fechaFinal,
  codigoSucursal,
  stats,
}: Props) => {
  const {
    data: pedidosAuditoria,
    isError,
    isLoading,
    refetch,
  } = useMrtQuery({
    queryKey: ['pedidos-anomalias', fechaInicial, fechaFinal, codigoSucursal],
    queryFn: async (ctx) => {
      const { limit, page, reverse, query } = genMrtQueryPagination(ctx)

      const inicioYMD = dayjs(fechaInicial).startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const finYMD = dayjs(fechaFinal).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      const inicioDMY = dayjs(fechaInicial).startOf('day').format('DD-MM-YYYY HH:mm:ss')
      const finDMY = dayjs(fechaFinal).endOf('day').format('DD-MM-YYYY HH:mm:ss')

      const queryExtra = [
        `fechaRegistro>=${inicioYMD}`,
        `fechaRegistro<=${finYMD}`,
        `esSospechoso=true`,
      ].join('&&')
      console.log(query)
      console.log(queryExtra)

      const entidad = {
        codigoSucursal,
        codigoPuntoVenta: 0
      }

      const data = await client.request<{ restPedidoAuditoriaListado: RestPedidoAuditoriaConnection }>(
        RESTPEDIDOAUDITORIALISTADO,
        {
          entidad,
          limit,
          page,
          reverse,
          query: [query, queryExtra].filter(Boolean).join('&&'),
        }
      )
      console.log(data)

      let docs = data.restPedidoAuditoriaListado.docs ?? []
      let pageInfo = data.restPedidoAuditoriaListado.pageInfo

      if (docs.length === 0) {
        const fallbackData = await client.request<{ restPedidoAuditoriaReporteAnomalia: RestPedidoAuditoria[] }>(
          RESTPEDIDOAUDITORIAREPORTEANOMALIA,
          {
            codigoSucursal,
            fechaInicial: inicioYMD,
            fechaFinal: finYMD
          }
        )
        const fallbackDocs = fallbackData.restPedidoAuditoriaReporteAnomalia || []
        docs = fallbackDocs.filter(d => d.esSospechoso)
        pageInfo = {
          totalDocs: docs.length,
          totalPages: 1,
          page: 1,
          limit: docs.length || 10,
          hasNextPage: false,
          hasPrevPage: false,
        } as any
      }

      return {
        docs,
        pageInfo,
      }
    },
    isServerSide: true,
  })

  const pedidosDocs = pedidosAuditoria?.docs ?? []

  const anomalias = useMemo(() => {
    const list: any[] = []
    pedidosDocs.forEach((auditoria: RestPedidoAuditoria) => {
      if (auditoria.esSospechoso) {
        
        // Iteramos los artículos para reportar las causas si son por artículo
        const modis = auditoria.articulos ?? []
        let hasDetalle = false

        modis.forEach(art => {
           const cant = art.articuloPrecio?.cantidad ?? 0
           const cantAnt = art.articuloPrecio?.cantidadAnterior ?? cant
           const precio = art.articuloPrecio?.valor ?? 0
           console.log(art.state)

           const forceIndividualItemListing = auditoria.accion === 'ANULACION' || auditoria.accion === 'CANCELACION' || auditoria.accion === 'MODIFICACION_ARTICULOS'
           if (art.state === 'ELIMINADO' || cant < cantAnt || forceIndividualItemListing) {
               hasDetalle = true
               const resumenPartes = auditoria.resumenCambios?.split('.') || []
               const coincidenciaResumen = art.nombreArticulo 
                 ? resumenPartes.map(s => s.trim()).filter(s => s.toLowerCase().includes(art.nombreArticulo!.toLowerCase())).join('. ')
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
                 descripcion: auditoria.accion !== 'ANULACION' ? (resumenFinal || 'Anomalía en artículo') : (auditoria.motivosSospecha?.join(', ') || 'Anomalía en artículo'),
                 resumenCambios: resumenFinal,
                 motivosSospecha: auditoria.motivosSospecha,
                 accion: auditoria.accion,
                 estadoArticulo: auditoria.accion || 'ACTUALIZACION',
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
                 nombre: auditoria.accion === 'ANULACION' ? 'PEDIDO COMPLETO' : (auditoria.articulos?.map(art => art.nombreArticulo).filter(Boolean).join(', ') || 'PEDIDO COMPLETO'),
                 articuloId: auditoria.pedidoId,
                 cantidad: 1,
                 precio: auditoria.totales?.operacion?.totalFinal || 0,
                 autor: auditoria.usuario,
                 descripcion: auditoria.accion !== 'ANULACION' ? (auditoria.resumenCambios || 'Pedido anómalo') : (auditoria.motivosSospecha?.join(', ') || 'Pedido anómalo'),
                 resumenCambios: auditoria.resumenCambios,
                 motivosSospecha: auditoria.motivosSospecha,
                 accion: auditoria.accion,
                 estadoArticulo: auditoria.accion || 'REVISION',
             })
        }
      }
    })
    return list
  }, [pedidosDocs, stats])

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
