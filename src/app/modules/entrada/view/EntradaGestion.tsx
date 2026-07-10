import React, { FunctionComponent, useMemo } from 'react'
import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox.tsx'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb.tsx'
import { entradaRoutesMap } from '../entradaRoutes.tsx'
import StackMenu from '../../../base/components/MyMenu/StackMenu.tsx'
import { StackMenuItem } from '../../../base/components/MyMenu/StackMenuItem.tsx'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { HistoryOutlined, NewspaperOutlined } from '@mui/icons-material'
import { MrtDynamicTable } from '../../../base/components/Table/MrtDynamicTable.tsx'
import { entradaColumns } from './listado/entradaColumns.tsx'
import { useEntradaOperaciones } from '../hooks/useEntradaOperaciones.tsx'
import { useWorkflow } from '../../../base/components/Workflow/useWorkflow.tsx'
import { useMrtQuery } from '../../../base/components/Table/useMrtQuery.tsx'
import { genMrtQueryPagination } from '../../../base/components/Table/genMrtQueryPagination.ts'
import { FilterTypeMap } from '../../../base/components/Table/castMrtFilters.ts'
import { EntradaProps } from '../interfaces'
import { MrtTableConfig } from '../../../base/components/Table/mrtTypes.ts'
import { WorkflowDialog } from '../../../base/components/Workflow/WorkflowDialog.tsx'
import { apiEntradaPorCajaListado } from '../api/apiEntradaPorCajaListado.ts'
import EntradaRecepcionDetalle from './listado/EntradaRecepcionDetalle.tsx'

const FILTER_TYPES: FilterTypeMap<EntradaProps> = {
  numeroEntrada: 'number',
}

interface OwnProps {}

type Props = OwnProps

/**
 * Gestion de entradas rapidas
 * @constructor
 */
const EntradaGestion: FunctionComponent<Props> = () => {
  const columns = useMemo(() => entradaColumns, [])
  const { entidad } = useEntradaOperaciones()
  const workflow = useWorkflow()

  /** Fetch de listado de datos, siempre enviar datos de entidad como filtro */
  const listado = useMrtQuery({
    queryKey: ['entrada-rapida-listado'],
    queryFn: async (ctx) => {
      const pgs = genMrtQueryPagination(ctx, {
        filterTypes: FILTER_TYPES,
        filterFields: [
          `sucursal.codigo=${entidad.codigoSucursal}`,
          `puntoVenta.codigo=${entidad.codigoPuntoVenta}`,
        ],
      })
      return apiEntradaPorCajaListado(pgs)
    },
    isServerSide: true,
    queryOptions: {
      enabled: !!entidad,
      refetchOnWindowFocus: false,
    },
  })

  /** Configuraciones para data-table dinamico */
  const config: MrtTableConfig<EntradaProps> = {
    id: 'listado-entradas-rapidas',
    columns,
    showIconRefetch: true,
    showAudit: true,
    rowIconsActions: [
      {
        label: 'Trazabilidad',
        icon: <HistoryOutlined />,
        onClick: ({ row }) => {
          workflow.openWorkflow(row.workflow)
        },
      },
    ],
    renderDetailPanel: (row) => <EntradaRecepcionDetalle row={row} />,
  }

  return (
    <SimpleContainerBox maxWidth={'xl'}>
      <Breadcrumb routeSegments={[entradaRoutesMap.gestion]} />
      <StackMenu asideSidebarFixed>
        <StackMenuItem>
          <Button
            component={Link}
            to={entradaRoutesMap.registro.path}
            variant="contained"
            startIcon={<NewspaperOutlined />}
            color={'primary'}
          >
            Nueva entrada rápida
          </Button>
        </StackMenuItem>
      </StackMenu>

      <MrtDynamicTable config={config} {...listado} />

      <WorkflowDialog {...workflow.dialogProps} />
    </SimpleContainerBox>
  )
}

export default EntradaGestion
