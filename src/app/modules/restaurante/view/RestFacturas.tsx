import { AttachEmail, Delete, ForwardToInboxTwoTone, Preview } from '@mui/icons-material'
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { FunctionComponent, useMemo, useState } from 'react'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import { FilterTypeMap } from '../../../base/components/Table/castMrtFilters.ts'
import { genMrtQueryPagination } from '../../../base/components/Table/genMrtQueryPagination.ts'
import { MrtDynamicTable } from '../../../base/components/Table/MrtDynamicTable.tsx'
import { MrtTableConfig } from '../../../base/components/Table/mrtTypes.ts'
import { useMrtQuery } from '../../../base/components/Table/useMrtQuery.tsx'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import useAuth from '../../../base/hooks/useAuth'
import { apiEstado } from '../../../interfaces/index.ts'
import { client } from '../client'
import { RESTFACTURALISTADO } from '../queries/useRestFacturaListado'
import { restauranteRoutesMap } from '../restauranteRoutes'
import { RestFacturaConnection, SalidaFactura, SalidaFacturaDetalle } from '../types'
import { tableFacturaColumns } from './listado/TableRestFacturaHeaders.tsx'
import RestConsultaFacturaDialog from './RestConsultaFacturaDialog.tsx'
import RestReenviarFacturaDialog from './RestReenviarFacturaDialog.tsx'

const ProductosDetalle = ({ productos }: { productos: SalidaFacturaDetalle[] }) => {
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
            <TableCell align="right">Precio Venta</TableCell>
            <TableCell align="right">Descuento</TableCell>
            <TableCell align="right">Subtotal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productos.map((p, idx) => {
            const cantidad = p.cantidad ?? 0
            const precio = p.precioUnitario ?? 0
            const descuento = p.montoDescuento ?? 0
            const total = p.subTotal ?? cantidad * precio - descuento
            return (
              <TableRow key={idx} hover>
                <TableCell>{p.nroItem ?? idx + 1}</TableCell>
                <TableCell>{p.producto ?? '-'}</TableCell>
                <TableCell>{p.descripcion ?? '-'}</TableCell>
                <TableCell align="right">{cantidad}</TableCell>
                <TableCell align="right">{precio.toFixed(2)}</TableCell>
                <TableCell align="right">{descuento.toFixed(2)}</TableCell>
                <TableCell align="right">{total.toFixed(2)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}

interface RestFacturasComponentProps {}

type Props = RestFacturasComponentProps

const RestFacturas: FunctionComponent<Props> = () => {
  const { user } = useAuth()
  const [factura, setFactura] = useState<SalidaFactura | null>(null)
  const [openReenviarFactura, setOpenReenviarFactura] = useState(false)
  const [openEnviarWhats, setOpenEnviarWhats] = useState(false)
  const [openAnularVenta, setOpenAnularVenta] = useState(false)
  const [openConsultaFactura, setOpenConsultaFactura] = useState(false)

  const columns = useMemo(() => tableFacturaColumns, [])

  const config = useMemo<MrtTableConfig<SalidaFactura>>(
    () => ({
      id: 'listado-rest-facturas',
      columns,
      showIconRefetch: true,
      showAudit: true,
      manualPagination: true,
      rowMenuActions: [
        {
          label: 'Reenviar Factura',
          icon: <AttachEmail />,
          onClick: ({ row }) => {
            setFactura(row)
            setOpenReenviarFactura(true)
          },
        },
        {
          label: 'Enviar por W. A.',
          icon: <ForwardToInboxTwoTone fontSize="inherit" color="success" />,

          onClick: ({ row }) => {
            setFactura(row)
            setOpenEnviarWhats(true)
          },
        },
        {
          label: 'Anular Venta / Factura',
          icon: <Delete />,
          color: 'error',
          onClick: ({ row }) => {
            setFactura(row || null)
            setOpenAnularVenta(true)
          },
          hidden: (row) => [apiEstado.anulado, apiEstado.eliminado].includes(row.state as string),
        },
      ],
      rowIconsActions: [
        {
          label: 'Consulta Venta / Factura',
          color: 'primary',
          onClick: ({ row }) => {
            setFactura(row)
            setOpenConsultaFactura(true)
          },
          icon: <Preview />,
        },
      ],
      renderDetailPanel: (row) => <ProductosDetalle productos={row.detalle ?? []} />,
    }),
    [columns],
  )

  const REST_FACTURAS_FILTER_TYPES: FilterTypeMap<SalidaFactura> = {
    numeroFactura: 'number',
    'cliente.numeroDocumento': 'number',
    fechaEmision: 'date',
  }

  const restFacturas = useMrtQuery({
    queryKey: ['rest-facturas'],
    queryFn: async (ctx) => {
      // Separar el filtro de fecha del resto para construirlo manualmente
      const dateFilter = ctx.columnFilters.find((f) => f.id === 'fechaEmision')
      const ctxSinFecha = {
        ...ctx,
        columnFilters: ctx.columnFilters.filter((f) => f.id !== 'fechaEmision'),
      }

      const { limit, page, reverse, query } = genMrtQueryPagination(ctxSinFecha, {
        filterTypes: REST_FACTURAS_FILTER_TYPES,
      })

      // Filtro por día completo: fechaEmision>=YYYY-MM-DD 00:00:00&&fechaEmision<=YYYY-MM-DD 23:59:59
      const dateVal = dateFilter?.value as string | undefined
      const dateParts: string[] = []
      if (dateVal) {
        dateParts.push(`fechaEmision>=${dateVal} 00:00:00`)
        dateParts.push(`fechaEmision<=${dateVal} 23:59:59`)
      }
      const fullQuery = [query, ...dateParts].filter(Boolean).join('&&')

      const entidad = {
        codigoSucursal: user.sucursal.codigo,
        codigoPuntoVenta: user.puntoVenta.codigo,
      }
      console.log('Query params:', { entidad, limit, page, reverse, query })
      const data = await client.request<{ restFacturaListado: RestFacturaConnection }>(RESTFACTURALISTADO, {
        entidad,
        limit,
        page,
        reverse,
        query: fullQuery,
      })
      const { docs = [], pageInfo } = data.restFacturaListado
      return { docs, pageInfo: pageInfo as Required<typeof pageInfo> }
    },
    isServerSide: true,
  })

  return (
    <SimpleContainerBox>
      <Breadcrumb routeSegments={[restauranteRoutesMap.facturas]} />
      <Box>
        <MrtDynamicTable config={config} {...restFacturas} />
      </Box>

      {/* Dialogos de Acciones */}
      <RestConsultaFacturaDialog
        open={openConsultaFactura}
        onClose={() => setOpenConsultaFactura(false)}
        factura={factura}
      />
      <RestReenviarFacturaDialog
        open={openReenviarFactura}
        onClose={() => setOpenReenviarFactura(false)}
        factura={factura}
      />
    </SimpleContainerBox>
  )
}

export default RestFacturas
