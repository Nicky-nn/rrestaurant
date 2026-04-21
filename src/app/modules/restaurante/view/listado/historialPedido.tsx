import { JSX } from 'react'
import { DragHandleOutlined } from '@mui/icons-material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { TimelineDot } from '@mui/lab'
import { Box, Paper, Stack, Typography, CircularProgress } from '@mui/material'
import { format, parse } from 'date-fns'

import { useRestPedidoAuditoriaPorPedidoId } from '../../queries/useRestPedidoAuditoriaPorPedidoId'

interface HistorialPedidoProps {
  pedidoId: string
}

const estadoIcono: Record<string, JSX.Element> = {
  CREACION: <NewReleasesIcon />,
  MODIFICACION_ARTICULOS: <DragHandleOutlined />,
  MODIFICACION_FINANCIERA: <DragHandleOutlined />,
  CAMBIO_ESTADO: <DragHandleOutlined />,
  FINALIZACION: <DoneAllIcon />,
  CANCELACION: <CancelIcon />,
  ANULACION: <DeleteIcon />,
  DEFAULT: <FiberManualRecordIcon />,
}

const estadoColor: Record<string, string> = {
  CREACION: 'info.main',
  MODIFICACION_ARTICULOS: 'warning.main',
  MODIFICACION_FINANCIERA: 'warning.main',
  CAMBIO_ESTADO: 'grey.500',
  FINALIZACION: 'success.main',
  CANCELACION: 'error.main',
  ANULACION: 'error.main',
  DEFAULT: 'grey.500',
}

const formatearTextoAccion = (accion: string) => {
  return accion?.replace(/_/g, ' ') || 'DESCONOCIDO'
}

export const HistorialPedido = ({
  pedidoId,
}: HistorialPedidoProps) => {
  const { data: historial = [], isLoading } = useRestPedidoAuditoriaPorPedidoId({ pedidoId })

  const numeroPedido = historial.length > 0 ? historial[0].numeroPedido : undefined

  // Sort descending (newest first) using fechaRegistro DD/MM/YYYY HH:MM:SS
  const sortedHistorial = [...historial].sort((a, b) => {
    if (!a.fechaRegistro || !b.fechaRegistro) return 0
    try {
      const da = parse(a.fechaRegistro, 'dd/MM/yyyy HH:mm:ss', new Date())
      const db = parse(b.fechaRegistro, 'dd/MM/yyyy HH:mm:ss', new Date())
      return db.getTime() - da.getTime()
    } catch {
      return 0
    }
  })

  // We fallback to general order props if step details are missing
  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ padding: 2 }}>
      {numeroPedido && (
        <Typography variant="h6" gutterBottom>
          Historial del Pedido #{numeroPedido}
        </Typography>
      )}

      {/* Historial general con timeline de pedidos */}
      <Box
        sx={{
          minWidth: 'md',
          margin: '0 auto',
          overflowX: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            px: 2,
            width: 'fit-content',
          }}
        >
          {sortedHistorial.map((h, idx) => {
            const accionType = h.accion || 'DEFAULT'
            const color = estadoColor[accionType] || estadoColor['DEFAULT']
            const icono = estadoIcono[accionType] || estadoIcono['DEFAULT']
            // Al estar ordenado de más nuevo a más viejo, el paso cronológicamente anterior está en idx + 1
            const pasoAnterior = idx < sortedHistorial.length - 1 ? sortedHistorial[idx + 1] : null
            const articulos = h.articulos || []

            // Find items that were present in previous step but missing now (ELIMINADOS)
            const eliminados = pasoAnterior?.articulos?.filter(
              (prevArt) => !articulos.some((currArt) => currArt.nroItem === prevArt.nroItem)
            ) || []

            // Combine both currently present and eliminated items for the step UI
            const allItemsForStep = [...articulos, ...eliminados]

            return (
              <Box
                key={idx}
                sx={{
                  position: 'relative',
                  minWidth: 320,
                  maxWidth: 320,
                  textAlign: 'center',
                }}
              >
                {/* Punto del estado superior */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                  }}
                >
                  <TimelineDot sx={{ bgcolor: color, color: 'white' }}>{icono}</TimelineDot>
                </Box>

                {/* Línea horizontal entre timelines */}
                {idx < sortedHistorial.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      left: '50%',
                      right: '-60%', // Extiende la línea hacia el siguiente nodo
                      height: 2,
                      bgcolor: 'grey.300',
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Contenido */}
                <Paper
                  elevation={1}
                  sx={{
                    mt: 4.5,
                    p: 2,
                    pt: 4,
                    borderTop: `4px solid ${color}`,
                    position: 'relative',
                    minHeight: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatearTextoAccion(accionType)}
                  </Typography>
                  <Typography variant="body2" mb={2} color="text.secondary">
                    {h.resumenCambios || 'Cambio en el pedido'}
                  </Typography>

                  {/* ——— Artículos con mini–timeline de estados ——— */}
                  <Stack spacing={2} mb={2}>
                    {allItemsForStep.map((articulo, i) => {
                      const isEliminado = eliminados.some((eli) => eli.nroItem === articulo.nroItem)
                      
                      let colorEstado = 'grey.500'
                      let iconoEstado = <FiberManualRecordIcon />
                      let textoEstado = 'MANTENIDO'
                      
                      let cantidadActual = articulo.articuloPrecio?.cantidad ?? 0
                      let cantidadAnterior = 0
                      let mostrarCambio = false

                      if (isEliminado) {
                        // This item was in previous step but not here
                        cantidadActual = 0
                        cantidadAnterior = articulo.articuloPrecio?.cantidad ?? 0
                        mostrarCambio = true
                      } else {
                        // Find this item in the previous step
                        const prevArticulo = pasoAnterior?.articulos?.find(
                          (a) => a.nroItem === articulo.nroItem
                        )
                        if (prevArticulo) {
                          cantidadAnterior = prevArticulo.articuloPrecio?.cantidad ?? 0
                          if (cantidadAnterior !== cantidadActual) {
                            mostrarCambio = true
                          }
                        } else {
                          // It's entirely new in this step
                          cantidadAnterior = 0
                          mostrarCambio = true
                        }
                      }

                      if (isEliminado) {
                        iconoEstado = <DeleteIcon />
                        colorEstado = 'error.main'
                        textoEstado = 'ELIMINADO'
                      } else if (mostrarCambio) {
                        if (cantidadActual > cantidadAnterior) {
                          iconoEstado = cantidadAnterior === 0 ? <NewReleasesIcon /> : <AddCircleIcon />
                          colorEstado = cantidadAnterior === 0 ? 'info.main' : 'warning.main'
                          textoEstado = cantidadAnterior === 0 ? 'AGREGADO' : 'AUMENTADO'
                        } else if (cantidadActual < cantidadAnterior) {
                          iconoEstado = <RemoveCircleIcon />
                          colorEstado = 'error.light'
                          textoEstado = 'DISMINUIDO'
                        }
                      } else if (accionType === 'CANCELACION' || accionType === 'ANULACION') {
                        iconoEstado = estadoIcono[accionType]
                        colorEstado = 'error.main'
                        textoEstado = accionType
                      } else if (accionType === 'FINALIZACION') {
                        iconoEstado = <DoneAllIcon />
                        colorEstado = 'success.main'
                        textoEstado = 'FINALIZADO'
                      }

                      return (
                        <Paper
                          key={i}
                          elevation={1}
                          sx={{
                            p: 1,
                            bgcolor: 'background.paper',
                            position: 'relative',
                            overflow: 'visible',
                            minHeight: 56,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              position: 'relative',
                              px: 2,
                            }}
                          >
                            <TimelineDot
                              sx={{
                                bgcolor: colorEstado,
                                color: 'white',
                                zIndex: 1,
                                boxShadow: 2,
                                width: 36,
                                height: 36,
                                flexShrink: 0,
                                '& svg': { fontSize: 20 },
                              }}
                            >
                              {iconoEstado}
                            </TimelineDot>

                            <Stack sx={{ ml: 1, textAlign: 'left' }} spacing={0.2}>
                              <Typography variant="body2" fontWeight={500}>
                                {articulo.nombreArticulo}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{ color: colorEstado, textTransform: 'uppercase', fontWeight: 'bold' }}
                              >
                                {textoEstado} {mostrarCambio && !isEliminado ? `(${cantidadAnterior} → ${cantidadActual})` : ''}
                                {isEliminado ? `(Era: ${cantidadAnterior})` : ''}
                              </Typography>
                            </Stack>
                          </Box>
                        </Paper>
                      )
                    })}
                    
                    {allItemsForStep.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No hay artículos registrados.
                      </Typography>
                    )}
                  </Stack>

                  {/* Fecha y autor */}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', pt: 2 }}>
                    <span style={{ display: 'block', fontWeight: 'bold' }}>{h.usuario ?? 'Sistema'}</span>
                    <span style={{ display: 'block' }}>
                      {h.fechaRegistro ?? 'Fecha desconocida'}
                    </span>
                  </Typography>
                </Paper>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

