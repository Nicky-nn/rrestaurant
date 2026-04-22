import {
  CancelOutlined,
  DescriptionOutlined,
  ManageAccountsOutlined,
  PrintOutlined,
} from '@mui/icons-material'
import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { FunctionComponent, useMemo, useState } from 'react'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import { FilterTypeMap } from '../../../base/components/Table/castMrtFilters.ts'
import { genMrtQueryPagination } from '../../../base/components/Table/genMrtQueryPagination.ts'
import { MrtDynamicTable } from '../../../base/components/Table/MrtDynamicTable.tsx'
import { MrtTableConfig } from '../../../base/components/Table/mrtTypes.ts'
import { useMrtQuery } from '../../../base/components/Table/useMrtQuery.tsx'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import { useError } from '../../../base/contexts/ErrorProvider'
import useAuth from '../../../base/hooks/useAuth'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { client } from '../client'
import { useRestPedidoFacturaRegistro } from '../mutations/useRestPedidoFacturaRegistro'
import { useRestPedidoFinalizar } from '../mutations/useRestPedidoFinalizar'
import { RESTPEDIDOLISTADO } from '../queries/useRestPedidoListado'
import { restauranteRoutesMap } from '../restauranteRoutes'
import { ArticuloOperacion, RestPedido, RestPedidoConnection, RestPedidoFinalizarInput } from '../types'
import { tableColumns } from './listado/TableRestPedidoHeaders.tsx'
import RrCobroDialog, { PagoRealizado } from './registrar/RrCobroDialog'
import RrGestionPedidoDialog from './registrar/RrGestionPedidoDialog'

const ProductosDetalle = ({ productos }: { productos: ArticuloOperacion[] }) => {
  if (!productos.length) return <Typography variant="body2">Sin productos</Typography>
  return (
    <Box sx={{ p: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell>#</TableCell>
            <TableCell>Cód. Artículo</TableCell>
            <TableCell>Artículo</TableCell>
            <TableCell align="right">Cantidad</TableCell>
            <TableCell align="right">Precio</TableCell>
            <TableCell align="right">Descuento</TableCell>
            <TableCell align="center">Cortesía</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productos.map((p, idx) => {
            const cantidad = p.articuloPrecio?.cantidad ?? 0
            const precio = p.articuloPrecio?.valor ?? 0
            const descuento = p.articuloPrecio?.descuento ?? 0
            const total = cantidad * precio - descuento
            const mods = (p as any).modificadores ?? []
            return (
              <>
                <TableRow key={p.articuloId ?? idx} hover>
                  <TableCell>{p.nroItem ?? idx + 1}</TableCell>
                  <TableCell>{p.codigoArticulo ?? '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ fontWeight: 600 }}>{p.nombreArticulo ?? '-'}</Box>
                    {mods.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {mods.map((m: any, mi: number) => (
                          <Chip
                            key={mi}
                            label={`${m.articuloPrecio?.cantidad > 1 ? `${m.articuloPrecio.cantidad}x ` : ''}${m.nombreArticulo ?? m.codigoArticulo ?? '?'}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.68rem' }}
                          />
                        ))}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="right">{cantidad}</TableCell>
                  <TableCell align="right">{precio.toFixed(2)}</TableCell>
                  <TableCell align="right">{descuento.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    {p.cortesia ? (
                      <Chip size="small" label="Sí" color="success" />
                    ) : (
                      <Chip size="small" label="No" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">{total.toFixed(2)}</TableCell>
                </TableRow>
              </>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}

interface RestGestionComponentProps {}

type Props = RestGestionComponentProps

const RestGestion: FunctionComponent<Props> = () => {
  const { user } = useAuth()
  const { showError } = useError()

  const { mutateAsync: finalizarPedido, isPending: isFinalizarPending } = useRestPedidoFinalizar()
  const { mutateAsync: facturarPedido, isPending: isFacturarPending } = useRestPedidoFacturaRegistro()
  const isPending = isFinalizarPending || isFacturarPending

  const [selectedPedido, setSelectedPedido] = useState<RestPedido | null>(null)
  const [openCobro, setOpenCobro] = useState(false)
  const [openGestion, setOpenGestion] = useState(false)
  const [pedidoGestion, setPedidoGestion] = useState<RestPedido | null>(null)
  const [pagosRealizados, setPagosRealizados] = useState<PagoRealizado[]>([])
  const [descuento, setDescuento] = useState(0)
  const [giftcard, setGiftcard] = useState(0)

  const subtotal = useMemo(() => {
    if (!selectedPedido) return 0
    // Si hay productos calculamos desde ellos, si no usamos montoTotal del pedido (caso FINALIZADO)
    const productosTotal = (selectedPedido.productos ?? []).reduce((acc, p) => {
      if (p.cortesia) return acc
      const precio = p.articuloPrecio?.valor ?? 0
      const cantidad = p.articuloPrecio?.cantidad ?? 1
      let sub = precio * cantidad
      ;(p as any).modificadores?.forEach((m: any) => {
        sub += (m.articuloPrecio?.valor ?? 0) * (m.articuloPrecio?.cantidad ?? 1)
      })
      return acc + sub
    }, 0)
    return productosTotal > 0 ? productosTotal : (selectedPedido.montoTotal ?? 0)
  }, [selectedPedido])

  const totalAPagar = Math.max(0, subtotal - descuento - giftcard)

  const formatTarjeta = (num?: string): string => {
    if (!num) return '0000000000000000'
    const clean = num.replace(/\D/g, '')
    if (clean.length === 16) return clean
    if (clean.length <= 4) return clean.padStart(16, '0')
    return clean.substring(0, 4) + '0'.repeat(8) + clean.substring(clean.length - 4)
  }

  const handleAbrirFacturar = (pedido: RestPedido) => {
    setSelectedPedido(pedido)
    // Recuperar pagos ya realizados si el pedido está FINALIZADO
    const pagosExistentes: PagoRealizado[] = (pedido.metodoPagoVenta ?? []).map((mp, i) => ({
      id: `existing-${i}`,
      metodoId: mp.metodoPago?.codigoClasificador ?? 1,
      metodoNombre: mp.metodoPago?.descripcion ?? 'Efectivo',
      monto: mp.monto ?? 0,
    }))
    setPagosRealizados(pagosExistentes)
    setDescuento(0)
    setGiftcard(0)
    setOpenCobro(true)
  }

  const handleFinalizar = async (metodoDefectoId?: number, metodoDefectoNombre?: string) => {
    if (!selectedPedido?._id) return
    const pagosFinales = pagosRealizados.length
      ? pagosRealizados
      : [
          {
            id: 'def',
            metodoId: metodoDefectoId || 1,
            metodoNombre: metodoDefectoNombre || 'Efectivo',
            monto: totalAPagar,
          },
        ]
    try {
      await finalizarPedido({
        id: selectedPedido._id,
        entidad: { codigoSucursal: user.sucursal.codigo, codigoPuntoVenta: user.puntoVenta.codigo },
        cliente: {
          codigoCliente: selectedPedido.cliente?.codigoCliente || '00',
          razonSocial: selectedPedido.cliente?.razonSocial || 'Sin Razón Social',
        },
        input: {
          codigoMoneda: user.moneda?.codigo || 1,
          montoTotal: totalAPagar,
          usuario: user.correo || '',
          codigoMetodoPago: pagosFinales[0].metodoId,
        } as RestPedidoFinalizarInput & { codigoMetodoPago: number },
        metodoPagoVenta: pagosFinales.map((p) => ({ codigoMetodoPago: p.metodoId, monto: p.monto })),
      })
      setOpenCobro(false)
      setSelectedPedido(null)
      setPagosRealizados([])
      restGestion.refetch()
    } catch (error) {
      showError(new MyGraphQlError(error as Error))
    }
  }

  const handleFacturar = async (
    metodoDefectoId?: number,
    metodoDefectoNombre?: string,
    inputNumeroTarjeta?: string,
  ) => {
    if (!selectedPedido?._id) return

    const pagosFinales = pagosRealizados.length
      ? pagosRealizados
      : [
          {
            id: 'def',
            metodoId: metodoDefectoId || 1,
            metodoNombre: metodoDefectoNombre || 'Efectivo',
            monto: totalAPagar,
            numeroTarjeta: inputNumeroTarjeta,
          },
        ]

    if (pagosRealizados.length) {
      const totalPagado = pagosRealizados.reduce((a, p) => a + p.monto, 0)
      if (totalPagado < totalAPagar) {
        showError(new Error('El monto pagado es menor al total.'))
        return
      }
    }

    try {
      // Solo finalizar si aún no está FINALIZADO
      if (selectedPedido.state !== 'FINALIZADO') {
        await finalizarPedido({
          id: selectedPedido._id,
          entidad: { codigoSucursal: user.sucursal.codigo, codigoPuntoVenta: user.puntoVenta.codigo },
          cliente: {
            codigoCliente: selectedPedido.cliente?.codigoCliente || '00',
            razonSocial: selectedPedido.cliente?.razonSocial || 'Sin Razón Social',
          },
          input: {
            codigoMoneda: user.moneda?.codigo || 1,
            montoTotal: totalAPagar,
            usuario: user.correo || '',
            codigoMetodoPago: pagosFinales[0].metodoId,
            numeroTarjeta:
              pagosFinales[0].metodoId === 2 ? formatTarjeta(pagosFinales[0].numeroTarjeta) : undefined,
          } as RestPedidoFinalizarInput & { codigoMetodoPago: number; numeroTarjeta?: string },
          metodoPagoVenta: pagosFinales.map((p) => ({ codigoMetodoPago: p.metodoId, monto: p.monto })),
        })
      }

      await facturarPedido({
        entidad: { codigoSucursal: user.sucursal.codigo, codigoPuntoVenta: user.puntoVenta.codigo },
        cliente: {
          codigoCliente: selectedPedido.cliente?.codigoCliente || '00',
          razonSocial: selectedPedido.cliente?.razonSocial || 'Sin Razón Social',
          email: selectedPedido.cliente?.email,
          telefono: selectedPedido.cliente?.telefono,
        },
        numeroPedido: selectedPedido.numeroPedido || 0,
        input: {
          codigoMoneda: user.moneda?.codigo || 1,
          codigoMetodoPago: pagosFinales[0].metodoId,
          numeroTarjeta:
            pagosFinales[0].metodoId === 2 ? formatTarjeta(pagosFinales[0].numeroTarjeta) : undefined,
          tipoCambio: user.moneda?.tipoCambio || 1,
          usuario: user.correo || '',
        },
      })

      setOpenCobro(false)
      setSelectedPedido(null)
      setPagosRealizados([])
      restGestion.refetch()
    } catch (error) {
      showError(new MyGraphQlError(error as Error))
    }
  }

  const columns = useMemo(() => tableColumns, [])

  const config = useMemo<MrtTableConfig<RestPedido>>(
    () => ({
      id: 'listado-rest-gestion',
      columns,
      showIconRefetch: true,
      showAudit: true,
      manualPagination: true,
      rowMenuActions: [
        {
          label: 'Gestionar',
          icon: <ManageAccountsOutlined />,
          onClick: ({ row }) => {
            if (row.state === 'COMPLETADO') {
              setPedidoGestion(row)
              setOpenGestion(true)
            } else {
              handleAbrirFacturar(row)
            }
          },
          disabled: (row) => row.tipoDocumento !== 'NOTA_VENTA',
        },
        {
          label: 'Generar Comanda',
          icon: <PrintOutlined />,
          onClick: () => {},
        },
        {
          label: 'Generar E. de Cuenta',
          icon: <DescriptionOutlined />,
          onClick: () => {},
        },
        {
          label: 'Anular',
          icon: <CancelOutlined />,
          color: 'error' as const,
          onClick: () => {},
        },
      ],
      renderDetailPanel: (row) => <ProductosDetalle productos={row.productos ?? []} />,
    }),
    [columns],
  )

  const REST_GESTION_FILTER_TYPES: FilterTypeMap<RestPedido> = {
    numeroOrden: 'number',
    numeroPedido: 'number',
    nroDocumento: 'number',
    'cliente.numeroDocumento': 'number',
    fechaDocumento: 'date',
  }

  const restGestion = useMrtQuery({
    queryKey: ['rest-gestion'],
    queryFn: async (ctx) => {
      // Separar el filtro de fecha del resto para construirlo manualmente
      const dateFilter = ctx.columnFilters.find((f) => f.id === 'fechaDocumento')
      const ctxSinFecha = {
        ...ctx,
        columnFilters: ctx.columnFilters.filter((f) => f.id !== 'fechaDocumento'),
      }

      const { limit, page, reverse, query } = genMrtQueryPagination(ctxSinFecha, {
        filterTypes: REST_GESTION_FILTER_TYPES,
      })

      // Filtro por día completo: fechaDocumento>=YYYY-MM-DD 00:00:00&&fechaDocumento<=YYYY-MM-DD 23:59:59
      const dateVal = dateFilter?.value as string | undefined
      const dateParts: string[] = []
      if (dateVal) {
        dateParts.push(`fechaDocumento>=${dateVal} 00:00:00`)
        dateParts.push(`fechaDocumento<=${dateVal} 23:59:59`)
      }
      const fullQuery = [query, ...dateParts].filter(Boolean).join('&&')

      const entidad = {
        codigoSucursal: user.sucursal.codigo,
        codigoPuntoVenta: user.puntoVenta.codigo,
      }
      console.log('Query params:', { entidad, limit, page, reverse, query })
      const data = await client.request<{ restPedidoListado: RestPedidoConnection }>(RESTPEDIDOLISTADO, {
        entidad,
        limit,
        page,
        reverse,
        query: fullQuery,
      })
      const { docs = [], pageInfo } = data.restPedidoListado
      return { docs, pageInfo: pageInfo as Required<typeof pageInfo> }
    },
    isServerSide: true,
  })

  return (
    <SimpleContainerBox>
      <Breadcrumb routeSegments={[restauranteRoutesMap.gestion]} />
      <Box>
        <MrtDynamicTable config={config} {...restGestion} />
      </Box>

      <RrGestionPedidoDialog
        open={openGestion}
        onClose={() => {
          setOpenGestion(false)
          restGestion.refetch()
        }}
        pedido={pedidoGestion}
      />

      <RrCobroDialog
        open={openCobro}
        onClose={() => {
          setOpenCobro(false)
          restGestion.refetch()
        }}
        isProcessing={isPending}
        subtotal={subtotal}
        descuento={descuento}
        giftcard={giftcard}
        onDescuentoChange={setDescuento}
        onGiftcardChange={setGiftcard}
        totalAPagar={totalAPagar}
        pagosRealizados={pagosRealizados}
        onAddPago={(metodoId, metodoNombre, monto, numeroTarjeta) =>
          setPagosRealizados((prev) => [
            ...prev,
            { id: Date.now().toString(), metodoId, metodoNombre, monto, numeroTarjeta },
          ])
        }
        onRemovePago={(id) => setPagosRealizados((prev) => prev.filter((p) => p.id !== id))}
        onFinalizar={selectedPedido?.state === 'COMPLETADO' ? handleFinalizar : undefined}
        onFacturar={handleFacturar}
        clienteInfo={
          selectedPedido?.cliente && selectedPedido.cliente.codigoCliente !== '00'
            ? `${selectedPedido.cliente.razonSocial || ''} - ${selectedPedido.cliente.numeroDocumento || ''}`
            : undefined
        }
      />
    </SimpleContainerBox>
  )
}

export default RestGestion
