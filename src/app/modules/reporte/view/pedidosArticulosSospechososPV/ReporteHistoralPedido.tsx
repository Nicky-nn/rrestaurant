import { JSX } from 'react'
import { DragHandleOutlined } from '@mui/icons-material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import {
  Box,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip
} from '@mui/material'
import { parse } from 'date-fns'

import { useRestPedidoAuditoriaPorPedidoId } from '../../../restaurante/queries/useRestPedidoAuditoriaPorPedidoId'

interface HistorialPedidoProps {
  pedidoId: string
}

const estadoIcono: Record<string, JSX.Element> = {
  CREACION: <NewReleasesIcon fontSize="small" />,
  MODIFICACION_ARTICULOS: <DragHandleOutlined fontSize="small" />,
  MODIFICACION_FINANCIERA: <DragHandleOutlined fontSize="small" />,
  CAMBIO_ESTADO: <DragHandleOutlined fontSize="small" />,
  FINALIZACION: <DoneAllIcon fontSize="small" />,
  CANCELACION: <CancelIcon fontSize="small" />,
  ANULACION: <DeleteIcon fontSize="small" />,
  DEFAULT: <FiberManualRecordIcon fontSize="small" />,
}

const estadoColor: Record<string, "info" | "warning" | "success" | "error" | "default"> = {
  CREACION: 'info',
  MODIFICACION_ARTICULOS: 'warning',
  MODIFICACION_FINANCIERA: 'warning',
  CAMBIO_ESTADO: 'default',
  FINALIZACION: 'success',
  CANCELACION: 'error',
  ANULACION: 'error',
  DEFAULT: 'default',
}

const formatearTextoAccion = (accion: string) => {
  return accion?.replace(/_/g, ' ') || 'DESCONOCIDO'
}

export const ReporteHistorialPedido = ({
  pedidoId,
}: HistorialPedidoProps) => {
  const { data: historial = [], isLoading } = useRestPedidoAuditoriaPorPedidoId({ pedidoId })

  const numeroPedido = historial.length > 0 ? historial[0].numeroPedido : undefined

  // Ordenar cronológicamente (más antiguo primero) para leer los cambios en orden como una bitácora
  const sortedHistorial = [...historial].sort((a, b) => {
    if (!a.fechaRegistro || !b.fechaRegistro) return 0
    try {
      const da = parse(a.fechaRegistro, 'dd/MM/yyyy HH:mm:ss', new Date())
      const db = parse(b.fechaRegistro, 'dd/MM/yyyy HH:mm:ss', new Date())
      return da.getTime() - db.getTime()
    } catch {
      return 0
    }
  })

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ padding: 1 }}>

      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ minWidth: 140, fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ minWidth: 110, fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell sx={{ minWidth: 170, fontWeight: 'bold' }}>Acción Ejecutada</TableCell>
              <TableCell sx={{ minWidth: 200, fontWeight: 'bold' }}>Resumen Automático</TableCell>
              <TableCell sx={{ minWidth: 250, fontWeight: 'bold' }}>Puntos Críticos Detectados</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedHistorial.map((h, idx) => {
              const accionType = h.accion || 'DEFAULT'
              const chipColor = estadoColor[accionType] || 'default'
              const icono = estadoIcono[accionType] || estadoIcono['DEFAULT']
              
              const pasoAnterior = idx > 0 ? sortedHistorial[idx - 1] : null
              const articulos = h.articulos || []

              // Encontrar artículos que estaban antes pero ya no están ahora
              const eliminados = pasoAnterior?.articulos?.filter(
                (prevArt) => !articulos.some((currArt) => currArt.nroItem === prevArt.nroItem)
              ) || []

              // Consolidar artículos actuales más los eliminados en este paso para recorrerlos todos juntos
              const allItemsForStep = [...articulos, ...eliminados]

              const itemsCriticos: JSX.Element[] = []

              let huboCambiosCriticos = false

              allItemsForStep.forEach((articulo) => {
                const isAnulacionOCancelacion = accionType === 'ANULACION' || accionType === 'CANCELACION'
                const isEliminado = isAnulacionOCancelacion || eliminados.some((eli) => eli.nroItem === articulo.nroItem)
                
                let cantidadActual = articulo.articuloPrecio?.cantidad ?? 0
                let cantidadAnterior = 0
                let cambioDetectado = false

                if (isEliminado) {
                  cantidadActual = 0
                  const prevArticulo = pasoAnterior?.articulos?.find(a => a.nroItem === articulo.nroItem)
                  cantidadAnterior = prevArticulo ? (prevArticulo.articuloPrecio?.cantidad ?? 0) : (articulo.articuloPrecio?.cantidad ?? 0)
                  cambioDetectado = true
                } else {
                  // Buscar el artículo en el paso anterior para comparar
                  const prevArticulo = pasoAnterior?.articulos?.find(
                    (a) => a.nroItem === articulo.nroItem
                  )
                  if (prevArticulo) {
                    cantidadAnterior = prevArticulo.articuloPrecio?.cantidad ?? 0
                    if (cantidadAnterior !== cantidadActual) {
                      cambioDetectado = true
                    }
                  } else {
                    // Es totalmente nuevo en este paso
                    cantidadAnterior = 0
                    cambioDetectado = true
                  }
                }

                if (isEliminado) {
                  huboCambiosCriticos = true
                  let textoEliminado = 'Fue eliminado'
                  if (accionType === 'ANULACION') textoEliminado = 'Fue anulado'
                  if (accionType === 'CANCELACION') textoEliminado = 'Fue cancelado'

                  itemsCriticos.push(
                    <Typography key={articulo.nroItem} variant="body2" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DeleteIcon fontSize="inherit" /> <strong>{articulo.nombreArticulo}</strong>: {textoEliminado} (Antes: {cantidadAnterior})
                    </Typography>
                  )
                } else if (cambioDetectado) {
                  huboCambiosCriticos = true
                  if (cantidadActual > cantidadAnterior) {
                    const isNew = cantidadAnterior === 0;
                    itemsCriticos.push(
                      <Typography key={articulo.nroItem} variant="body2" sx={{ color: isNew ? 'info.main' : 'warning.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                         <AddCircleIcon fontSize="inherit" /> 
                         <strong>{articulo.nombreArticulo}</strong>: {isNew ? `Se agregó (${cantidadActual})` : `Aumentó la cantidad (${cantidadAnterior} → ${cantidadActual})`}
                      </Typography>
                    )
                  } else if (cantidadActual < cantidadAnterior) {
                    itemsCriticos.push(
                      <Typography key={articulo.nroItem} variant="body2" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RemoveCircleIcon fontSize="inherit" /> <strong>{articulo.nombreArticulo}</strong>: Disminuyó la cantidad ({cantidadAnterior} → {cantidadActual})
                      </Typography>
                    )
                  }
                } else {
                  itemsCriticos.push(
                    <Typography key={articulo.nroItem} variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FiberManualRecordIcon fontSize="inherit" sx={{ fontSize: 10 }} /> <strong>{articulo.nombreArticulo}</strong>: Mantenido ({cantidadActual})
                    </Typography>
                  )
                }
              })

              return (
                <TableRow key={idx} hover>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    {h.fechaRegistro ?? '-'}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {h.usuario ?? 'Sistema'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Chip 
                      icon={icono} 
                      label={formatearTextoAccion(accionType)} 
                      color={chipColor} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                     {h.resumenCambios || <Typography variant="caption" color="text.secondary">Sin detalles</Typography>}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                     {!huboCambiosCriticos && allItemsForStep.length > 0 && (
                       <Typography variant="body2" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                         <DoneAllIcon fontSize="inherit" /> Sin cambios críticos de artículos.
                       </Typography>
                     )}
                     {itemsCriticos.length > 0 ? (
                       <Stack spacing={0.5}>
                         {itemsCriticos}
                       </Stack>
                     ) : (
                       <Typography variant="caption" color="text.secondary">
                         No hay artículos registrados.
                       </Typography>
                     )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
