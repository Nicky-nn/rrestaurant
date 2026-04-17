import { CancelOutlined, DescriptionOutlined, PrintOutlined, ReceiptOutlined } from '@mui/icons-material'
import { Box, Button, Chip, Typography, Modal, TextField, Grid, FormControlLabel, Checkbox } from '@mui/material'
import { FunctionComponent, useMemo, useState } from 'react'

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
import { MRT_ColumnDef } from 'material-react-table'
import { HistorialPedido } from './listado/historialPedido.tsx'
import { ModalAnularPedido } from './gestion/ModalAnularPedido.tsx'
import ModalPedidoFacturar from './gestion/ModalPedidoFacturar.tsx'

const ProductosDetalle = ({ productos }: { productos: ArticuloOperacion[] }) => {
  const totalGeneral = useMemo(() => {
    return productos.reduce((acc, p) => {
      const cantidad = p.articuloPrecio?.cantidad ?? 0
      const precio = p.articuloPrecio?.valor ?? 0
      const descuento = p.articuloPrecio?.descuento ?? 0
      return acc + (cantidad * precio - descuento)
    }, 0)
  }, [productos])

  const columns = useMemo<MRT_ColumnDef<ArticuloOperacion>[]>(
    () => [
      {
        id: 'nroItem',
        header: '#',
        size: 50,
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: 'codigoArticulo',
        header: 'Cód. Artículo',
      },
      {
        accessorKey: 'nombreArticulo',
        header: 'Artículo',
      },
      {
        accessorFn: (row) => row.articuloPrecio?.cantidad ?? 0,
        id: 'cantidad',
        header: 'Cantidad',
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
      },
      {
        accessorFn: (row) => (row.articuloPrecio?.valor ?? 0).toFixed(2),
        id: 'precio',
        header: 'Precio',
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
      },
      {
        accessorFn: (row) => (row.articuloPrecio?.descuento ?? 0).toFixed(2),
        id: 'descuento',
        header: 'Descuento',
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
      },
      {
        accessorFn: (row) => row.cortesia,
        id: 'cortesia',
        header: 'Cortesía',
        Cell: ({ cell }) => (
          cell.getValue() ? (
            <Chip size="small" label="Sí" color="success" />
          ) : (
            <Chip size="small" label="No" variant="outlined" />
          )
        ),
        Footer: () => <Typography variant="subtitle2" fontWeight="bold">Total General</Typography>,
      },
      {
        accessorFn: (row) => {
          const cantidad = row.articuloPrecio?.cantidad ?? 0
          const precio = row.articuloPrecio?.valor ?? 0
          const descuento = row.articuloPrecio?.descuento ?? 0
          return cantidad * precio - descuento
        },
        id: 'total',
        header: 'Total',
        Cell: ({ cell }) => Number(cell.getValue() ?? 0).toFixed(2),
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
        muiTableFooterCellProps: { align: 'right' },
        Footer: () => (
          <Typography variant="subtitle2" fontWeight="bold">
            {totalGeneral.toFixed(2)}
          </Typography>
        ),
      },
    ],
    [totalGeneral]
  )

  const config = useMemo<MrtTableConfig<ArticuloOperacion>>(
    () => ({
      id: 'detalle-productos',
      columns,
      manualPagination: false,
      additionalOptions: {
        enablePagination: false,
        enableBottomToolbar: false,
        enableTopToolbar: false,
        enableSorting: false,
        enableColumnActions: false,
        enableColumnFilters: false,
        enableGlobalFilter: false,
        muiTablePaperProps: {
          elevation: 0,
          sx: { borderRadius: 0, border: 'none', background: 'transparent' }
        }
      }
    }),
    [columns]
  )

  if (!productos.length) return <Typography variant="body2">Sin productos</Typography>
  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <MrtDynamicTable config={config} data={productos} />
    </Box>
  )
}

const DetallePedidoWrapper = ({ row }: { row: RestPedido }) => {
  const [showHistory, setShowHistory] = useState(false)
  const users = useAuth()
  const isAdmin=users.user.rol ==='ADMINISTRADOR'
  const hasHistory = row.historial && row.historial.length > 0 && isAdmin
  
  return (
    <Box sx={{ width: '100%' }}>
      {hasHistory && (
        <Box sx={{ p: 1, pb: 0, display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
          <Button variant="outlined" size="small" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
          </Button>
        </Box>
      )}
      {showHistory ? (
        <HistorialPedido
          historial={row.historial ?? []}
          productos={row.productos ?? []}
          numeroPedido={row.numeroPedido}
          fecha={row.fechaDocumento}
          autor={row.usucre}
        />
      ) : (
        <ProductosDetalle productos={row.productos ?? []} />
      )}
    </Box>
  )
}

interface RestGestionComponentProps {}

type Props = RestGestionComponentProps

type ItemAnular = ArticuloOperacion & { selected: boolean; restoreStock: boolean }

const RestGestion: FunctionComponent<Props> = () => {
  const { user } = useAuth()

  const [pedidoAAnular, setPedidoAAnular] = useState<RestPedido | null>(null)
  const [openAnularModal, setOpenAnularModal] = useState(false)

  const [pedidoAFacturar, setPedidoAFacturar] = useState<RestPedido | null>(null)
  const [openFacturarModal, setOpenFacturarModal] = useState(false)

  const handleCloseAnularModal = () => {
    setOpenAnularModal(false)
    setPedidoAAnular(null)
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
          label: 'Facturar',
          icon: <ReceiptOutlined />,
          onClick: ({ row }) => {
            setPedidoAFacturar(row)
            setOpenFacturarModal(true)
          },
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
          onClick: ({ row }) => {
            setPedidoAAnular(row)
            setOpenAnularModal(true)
          },
        },
      ],
      renderDetailPanel: (row) => <DetallePedidoWrapper row={row} />,
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
    queryKey: ['gestionFacturas'],
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
    <>
      <SimpleContainerBox>
        <Breadcrumb routeSegments={[restauranteRoutesMap.gestion]} />
        <Box>
          <MrtDynamicTable config={config} {...restGestion} />
        </Box>
      </SimpleContainerBox>

      <ModalAnularPedido
        open={openAnularModal}
        pedido={pedidoAAnular}
        onClose={handleCloseAnularModal}
        onSuccess={() => restGestion.refetch()}
      />
      <ModalPedidoFacturar
        open={openFacturarModal}
        pedido={pedidoAFacturar}
        onClose={() => {
          setOpenFacturarModal(false)
          setPedidoAFacturar(null)
        }}
        onSuccess={() => restGestion.refetch()}
      />
    </>
  )
}

export default RestGestion

