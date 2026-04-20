import { JSX } from 'react'
import { DragHandleOutlined } from '@mui/icons-material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import { TimelineDot } from '@mui/lab'
import { Box, Paper, Stack, Typography } from '@mui/material'
import { format, parse } from 'date-fns'

import { ArticuloOperacion, HistorialArticuloOperacion } from '../../types'

interface HistorialPedidoProps {
  productos: ArticuloOperacion[]
  historial: HistorialArticuloOperacion[]
  numeroPedido?: string | number
  fecha?: string
  autor?: string
}

type Estado = 'ELABORADO' | 'NUEVO' | 'ELIMINADO' | 'ACTUALIZADO'

const estadoIcono: Record<Estado, JSX.Element> = {
  ELABORADO: <DoneAllIcon />,
  NUEVO: <NewReleasesIcon />,
  ELIMINADO: <DeleteIcon />,
  ACTUALIZADO: <DragHandleOutlined />,
}

const estadoColor: Record<Estado, string> = {
  ELABORADO: 'success.main',
  NUEVO: 'info.main',
  ELIMINADO: 'error.main',
  ACTUALIZADO: 'grey.500',
}

export const HistorialPedido = ({
  historial,
  numeroPedido,
  fecha,
  autor,
  productos,
}: HistorialPedidoProps) => {
  console.log('DATOS DEL HISTORIAL RECIBIDOS:', historial)
  console.log('PRODUCTOS DEL PEDIDO:', productos)
  const sortedHistorial = [...historial].sort((a, b) => (a.nro ?? 0) - (b.nro ?? 0))

  const parsedDate = fecha ? parse(fecha, 'dd/MM/yyyy HH:mm', new Date()) : null
  const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate.getTime())

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
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            py: 6,
            px: 2,
            flexDirection: 'row-reverse',
            width: 'fit-content',
          }}
        >
          {sortedHistorial.map((h, idx) => {
            const operaciones = h.articuloOperacion || []
            const primerEstado = operaciones[0]?.state || 'NUEVO'
            const color = estadoColor[primerEstado as Estado] || 'grey.500'
            const icono = estadoIcono[primerEstado as Estado] || <FiberManualRecordIcon />

            return (
              <Box
                key={h.nro}
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
                  <TimelineDot sx={{ bgcolor: color, color: 'white' }}>
                    {icono}
                  </TimelineDot>
                </Box>

                {/* Línea horizontal entre timelines */}
                {idx < sortedHistorial.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      left: '-60%',
                      right: '55%',
                      height: 2,
                      bgcolor: 'grey.400',
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
                    minHeight: 260, // 🔹 alto mínimo consistente
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="subtitle1">Pedido {(h.nro ?? 0).toFixed(1)}</Typography>
                  <Typography variant="body2" mb={1}>
                    Actualización del pedido
                  </Typography>

                  {/* ——— Artículos con mini–timeline de estados ——— */}
                  <Stack spacing={2} mb={2}>
                    {operaciones.map((articulo, i) => {
                      let colorEstado =
                        estadoColor[articulo.state as Estado] || 'grey.500'
                      let iconoEstado = estadoIcono[articulo.state as Estado] || (
                        <FiberManualRecordIcon />
                      )

                      // Mirar el pedido siguiente
                      const siguiente = sortedHistorial[idx + 1]
                      const cambiaEstado =
                        siguiente &&
                        siguiente.articuloOperacion.some(
                          (a) => a.nombreArticulo === articulo.nombreArticulo,
                        )

                      // Comparar cantidades si el estado es ACTUALIZADO o si hay cambio de estado
                      let textoEstado = articulo.state.toUpperCase() // por defecto
                      if (articulo.state === 'ACTUALIZADO' || cambiaEstado) {
                        let cantidadAnterior: number | undefined
                        let invertirDiferencia = false

                        if (siguiente) {
                          // Buscar cantidad en siguiente historial
                          const mismoArticuloAnterior = siguiente.articuloOperacion.find(
                            (a) => a.codigoArticulo === articulo.codigoArticulo,
                          )
                          if (mismoArticuloAnterior) {
                            cantidadAnterior =
                              mismoArticuloAnterior.articuloPrecio.cantidad
                          }
                        }

                        if (cantidadAnterior === undefined) {
                          // Si no hay siguiente historial, usar cantidad actual del producto
                          const productoActual = productos.find(
                            (a) => a.codigoArticulo === articulo.codigoArticulo,
                          )
                          if (productoActual) {
                            cantidadAnterior = productoActual.articuloPrecio.cantidad
                            invertirDiferencia = true
                          }
                        }

                        if (cantidadAnterior !== undefined) {
                          let diferencia =
                            articulo.articuloPrecio.cantidad - cantidadAnterior
                          if (invertirDiferencia) diferencia = -diferencia

                          if (diferencia > 0) {
                            iconoEstado = <AddCircleIcon />
                            colorEstado = 'warning.main'
                            textoEstado = 'AUMENTADO'
                          } else if (diferencia < 0) {
                            iconoEstado = <RemoveCircleIcon />
                            colorEstado = 'red'
                            textoEstado = 'DISMINUIDO'
                          }
                        }
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
                            {/* Conector sólo si cambia de estado */}
                            {cambiaEstado && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '30%',
                                  left: 0,
                                  width: '100%',
                                  height: 2,
                                  bgcolor: colorEstado,
                                  transform: 'translateY(-50%)',
                                  zIndex: 0,
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: '-12px',
                                    top: '-6px',
                                    border: '6px solid transparent',
                                    borderRightColor: colorEstado,
                                  },
                                }}
                              />
                            )}

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
                                color={colorEstado}
                                sx={{ textTransform: 'uppercase' }}
                              >
                                {textoEstado}
                              </Typography>

                              <Typography variant="caption" color="text.secondary">
                                {h.fecha ?? fecha ?? 'Fecha desconocida'}
                              </Typography>
                            </Stack>
                          </Box>
                        </Paper>
                      )
                    })}
                  </Stack>

                  {/* Fecha y autor */}
                  <Typography variant="caption" color="text.secondary">
                    <span style={{ display: 'block' }}>{autor ?? 'Sistema'}</span>
                    <span style={{ display: 'block' }}>
                      {isValidDate
                        ? format(parsedDate, 'dd/MM/yyyy HH:mm')
                        : 'Fecha desconocida'}
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
