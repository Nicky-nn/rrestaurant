import { CancelOutlined, DescriptionOutlined, PrintOutlined, ReceiptOutlined } from '@mui/icons-material'
import { Box, Button, Chip, Typography } from '@mui/material'
import { FunctionComponent, useMemo, useState } from 'react'
import { MRT_ColumnDef } from 'material-react-table'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox.tsx'
import { FilterTypeMap } from '../../../base/components/Table/castMrtFilters.ts'
import { genMrtQueryPagination } from '../../../base/components/Table/genMrtQueryPagination.ts'
import { MrtDynamicTable } from '../../../base/components/Table/MrtDynamicTable.tsx'
import { MrtTableConfig } from '../../../base/components/Table/mrtTypes.ts'
import { useMrtQuery } from '../../../base/components/Table/useMrtQuery.tsx'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb.tsx'
import useAuth from '../../../base/hooks/useAuth.ts'
import { client } from '../client/index.ts'
import { restauranteRoutesMap } from '../restauranteRoutes.tsx'

import { RESTFACTURALISTADO } from '../../ventas/queries/useRestFacturaListado.ts'
import { RestFacturaConnection, SalidaFactura, SalidaFacturaDetalle } from '../../ventas/types/index.ts'
import { tableFacturaColumns } from './listado/TableRestFacturaHeaders.tsx'



interface RestFacturasComponentProps {}

type Props = RestFacturasComponentProps

const RestFacturas: FunctionComponent<Props> = () => {
  const { user } = useAuth()

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
          label: 'Ver Factura',
          icon: <ReceiptOutlined />,
          onClick: () => {},
        },
        {
          label: 'Anular',
          icon: <CancelOutlined />,
          color: 'error' as const,
          onClick: () => {},
        },
      ],
    }),
    [columns],
  )

  const REST_GESTION_FILTER_TYPES: FilterTypeMap<SalidaFactura> = {
    numeroFactura: 'number',
    cuf: 'string',
    'cliente.numeroDocumento': 'number',
    fechaEmision: 'date',
  }

  const restFacturas = useMrtQuery({
    queryKey: ['gestionFacturas',columns],
    queryFn: async (ctx) => {
      // Separar el filtro de fecha del resto para construirlo manualmente
      const dateFilter = ctx.columnFilters.find((f) => f.id === 'fechaEmision')
      const ctxSinFecha = {
        ...ctx,
        columnFilters: ctx.columnFilters.filter((f) => f.id !== 'fechaEmision'),
      }

      const { limit, page, reverse, query } = genMrtQueryPagination(ctxSinFecha, {
        filterTypes: REST_GESTION_FILTER_TYPES,
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
    </SimpleContainerBox>
  )
}

export default RestFacturas

