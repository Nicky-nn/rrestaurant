import { CancelOutlined, DescriptionOutlined, PrintOutlined, ReceiptOutlined } from '@mui/icons-material'
import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { FunctionComponent, useMemo } from 'react'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import { FilterTypeMap } from '../../../base/components/Table/castMrtFilters.ts'
import { genMrtQueryPagination } from '../../../base/components/Table/genMrtQueryPagination.ts'
import { MrtDynamicTable } from '../../../base/components/Table/MrtDynamicTable.tsx'
import { MrtTableConfig } from '../../../base/components/Table/mrtTypes.ts'
import { useMrtQuery } from '../../../base/components/Table/useMrtQuery.tsx'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import useAuth from '../../../base/hooks/useAuth'
import { client } from '../client'
import { RESTPEDIDOLISTADO } from '../queries/useRestPedidoListado'
import { restauranteRoutesMap } from '../restauranteRoutes'
import { ArticuloOperacion, RestPedido, RestPedidoConnection } from '../types'
import { tableColumns } from './listado/TableRestPedidoHeaders.tsx'

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
            return (
              <TableRow key={p.articuloId ?? idx} hover>
                <TableCell>{p.nroItem ?? idx + 1}</TableCell>
                <TableCell>{p.codigoArticulo ?? '-'}</TableCell>
                <TableCell>{p.nombreArticulo ?? '-'}</TableCell>
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
          label: 'Facturar',
          icon: <ReceiptOutlined />,
          onClick: () => {},
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
    </SimpleContainerBox>
  )
}

export default RestGestion
