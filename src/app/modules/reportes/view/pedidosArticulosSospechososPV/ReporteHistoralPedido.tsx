import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { amber } from '@mui/material/colors'
import { useTheme } from '@mui/material/styles'

import { numberWithCommas } from '../../../../base/components/MyInputs/NumberInput'
import { useAdaptiveColor } from '../../../../base/hooks/useAdaptiveColor'
import { ArticuloOperacion, HistorialArticuloOperacion } from '../../../restaurante'

type HistorialPedidoProps = {
  montoTotal: number
  productos: ArticuloOperacion[]
  historial: HistorialArticuloOperacion[]
  numeroPedido: number | string
  fecha: string
  autor: string
}

const EstadoChip = ({ estado }: { estado: string }) => {
  const theme = useTheme()

  const estadoColor: Record<string, string> = {
    NUEVO: theme.palette.info.main,
    ELABORADO: theme.palette.success.main,
    ELIMINADO: theme.palette.error.main,
  }

  const backgroundColor = estadoColor[estado] ?? '#ccc'

  return (
    <Chip
      label={estado}
      size="small"
      sx={{
        backgroundColor,
        color: '#fff',
        fontWeight: 'bold',
      }}
    />
  )
}

export const HistorialPedido = ({
  montoTotal,
  historial,
  productos,
  numeroPedido,
  fecha,
  autor,
}: HistorialPedidoProps) => {
  type Fila = {
    nombreArticulo: string
    cantidadInicial: number
    moneda: string
    precioInicial: number
    estadoInicial: string
    cantidadFinal: number
    precioFinal: number
    estadoFinal: string
    montoTotal: number
    fecha: string
    autor: string
  }

  const adaptiveColor = useAdaptiveColor()

  const productosPorCodigo = new Map(productos.map((p) => [p.codigoArticulo || '', p]))

  const operacionesPorArticulo = new Map<
    string,
    { nombreArticulo: string; ops: (typeof historial)[0]['articuloOperacion'] }
  >()

  historial.forEach((registro) => {
    registro.articuloOperacion.forEach((op) => {
      const key = op.codigoArticulo || ''
      if (!operacionesPorArticulo.has(key)) {
        operacionesPorArticulo.set(key, {
          nombreArticulo: op.nombreArticulo || '',
          ops: [],
        })
      }
      operacionesPorArticulo.get(key)!.ops.push({
        ...op,
      })
    })
  })

  const filas: Fila[] = []

  const ultimaFechaHistorial =
    historial.slice().sort((a, b) => (b.nro ?? 0) - (a.nro ?? 0))[0]?.fecha ?? ''

  operacionesPorArticulo.forEach(({ nombreArticulo, ops }) => {
    if (ops.length === 0) return

    const primera = ops[0]
    const productoActual = productosPorCodigo.get(primera.codigoArticulo || '')
    const ultima = ops[ops.length - 1]
    const cantidadInicial = ultima.articuloPrecio?.cantidad ?? 1

    const moneda =
      primera.articuloPrecio?.monedaPrecio?.moneda?.sigla ??
      primera.articuloPrecio?.moneda?.sigla ??
      productoActual?.articuloPrecio?.monedaPrecio?.moneda?.sigla ??
      productoActual?.articuloPrecio?.moneda?.sigla ??
      '-'

    const precioInicial = primera.articuloPrecio?.monedaPrecio?.precioBase ?? primera.articuloPrecio?.valor ?? 0
    const estadoInicial = primera.state

    const cantidadFinal =
      productoActual?.state === 'ELIMINADO' || ultima.state === 'ELIMINADO'
        ? 0
        : (productoActual?.articuloPrecio?.cantidad ?? 1)
    const precioFinal = productoActual?.articuloPrecio?.monedaPrecio?.precio ?? productoActual?.articuloPrecio?.valor ?? 0
    const estadoFinal = ultima.state

    filas.push({
      nombreArticulo,
      cantidadInicial,
      moneda,
      precioInicial,
      estadoInicial,
      cantidadFinal,
      precioFinal,
      estadoFinal,
      montoTotal,
      autor,
      fecha: ultimaFechaHistorial ?? fecha,
    })
  })

  const hayCambios = filas.some(
    (item) =>
      item.precioInicial !== item.precioFinal ||
      item.cantidadInicial !== item.cantidadFinal,
  )

  return hayCambios ? (
    <Box>
      <TableContainer component={Paper} elevation={3}>
        <Table size="small">
          <TableHead
            sx={{
              backgroundColor: (theme) => theme.palette.primary.main,
              color: (theme) => theme.palette.common.white,
            }}
          >
            <TableRow
              sx={{
                '& th': {
                  color: (theme) => theme.palette.common.white,
                  fontWeight: 'bold',
                  padding: '8px',
                },
              }}
            >
              <TableCell align="left" sx={{ width: 65, minWidth: 60 }}>
                Pedido
              </TableCell>
              <TableCell align="left" sx={{ width: 200, minWidth: 150 }}>
                Artículo
              </TableCell>
              <TableCell align="left" sx={{ width: 90, minWidth: 80 }}>
                Cant. Inicial
              </TableCell>
              <TableCell align="right" sx={{ width: 120, minWidth: 100 }}>
                Precio Inicial
              </TableCell>
              <TableCell align="left" sx={{ width: 100, minWidth: 80 }}>
                Estado Inicial
              </TableCell>
              <TableCell align="left" sx={{ width: 86, minWidth: 80 }}>
                Cant. Final
              </TableCell>
              <TableCell align="right" sx={{ width: 120, minWidth: 100 }}>
                Precio Final
              </TableCell>
              <TableCell align="center" sx={{ width: 100, minWidth: 80 }}>
                Estado Final
              </TableCell>
              <TableCell align="left" sx={{ width: 80, minWidth: 60 }}>
                Moneda
              </TableCell>
              <TableCell align="right" sx={{ width: 140, minWidth: 100 }}>
                Total Recibido
              </TableCell>
              <TableCell align="right" sx={{ width: 140, minWidth: 100 }}>
                Total Esperado
              </TableCell>
              <TableCell align="left" sx={{ width: 100, minWidth: 90 }}>
                Autor
              </TableCell>
              <TableCell align="left" sx={{ width: 130, minWidth: 100 }}>
                Fecha
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filas.map((item, index) => {
              const precioDiferente = item.precioInicial !== item.precioFinal
              const cantidadDiferente = item.cantidadInicial !== item.cantidadFinal

              return (
                <TableRow key={index} sx={{ padding: '8px' }}>
                  <TableCell>{numeroPedido}</TableCell>
                  <TableCell>{item.nombreArticulo}</TableCell>

                  <TableCell
                    align="right"
                    sx={cantidadDiferente ? { backgroundColor: adaptiveColor(amber[100]) } : {}}
                  >
                    {item.cantidadInicial}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={precioDiferente ? { backgroundColor: adaptiveColor(amber[100]) } : {}}
                  >
                    {numberWithCommas(item.precioInicial, '-')}
                  </TableCell>

                  <TableCell align="center">
                    <EstadoChip estado={item.estadoInicial} />
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={cantidadDiferente ? { backgroundColor: adaptiveColor(amber[100]) } : {}}
                  >
                    {item.cantidadFinal}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={precioDiferente ? { backgroundColor: adaptiveColor(amber[100]) } : {}}
                  >
                    {numberWithCommas(item.precioFinal, '-')}
                  </TableCell>

                  <TableCell align="center">
                    <EstadoChip estado={item.estadoFinal} />
                  </TableCell>
                  <TableCell align="center">{item.moneda}</TableCell>

                  <TableCell
                    align="right"
                    sx={
                      precioDiferente || cantidadDiferente
                        ? { backgroundColor: adaptiveColor(amber[100]) }
                        : {}
                    }
                  >
                    {numberWithCommas(item.precioFinal * item.cantidadFinal, '-')}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={
                      precioDiferente || cantidadDiferente
                        ? { backgroundColor: adaptiveColor(amber[100]) }
                        : {}
                    }
                  >
                    {numberWithCommas(item.precioInicial * item.cantidadInicial, '-')}
                  </TableCell>

                  <TableCell>{item.autor}</TableCell>
                  <TableCell>{item.fecha}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  ) : null
}
