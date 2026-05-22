import { Box, Button } from '@mui/material'
import { FunctionComponent, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import { FilterTypeMap } from '../../../base/components/Table/castMrtFilters'
import { genMrtQueryPagination } from '../../../base/components/Table/genMrtQueryPagination'
import { MrtDynamicTable } from '../../../base/components/Table/MrtDynamicTable'
import { MrtTableConfig } from '../../../base/components/Table/mrtTypes'
import { useMrtQuery } from '../../../base/components/Table/useMrtQuery'

import { DocumentScanner, FileOpen, LayersClear, PictureAsPdf } from '@mui/icons-material'
import StackMenu from '../../../base/components/MyMenu/StackMenu'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import { useSecurity } from '../../../base/contexts/SecurityContext'
import useAuth from '../../../base/hooks/useAuth'
import { apiEstado } from '../../../interfaces'
import { SecureComponent } from '../../../security'
import { getEntidadInput } from '../../../utils/getEntidadInput'
import { openInNewTab } from '../../../utils/helper'
import { client } from '../client'
import { ncdGestionRoutesMap } from '../notaCreditoDebitoRoutes'
import { RESTNOTACREDITODEBITOLISTADO } from '../queries/useRestNotaCreditoDebitoListado'
import { NotaCreditoDebito, RestNotaCreditoDebitoConnection } from '../types'
import AnularNcdDialog from './Listado/AnularNcdDialog'
import { notaCreditoColumns } from './Listado/notaCreditoColumns'

interface NCDGestionProps {}

const NCDGestion: FunctionComponent<NCDGestionProps> = () => {
  const columns = useMemo(() => notaCreditoColumns, [])
  const { hasActionPermission } = useSecurity()
  const [openAnularNcd, setOpenAnularNcd] = useState<{
    open: boolean
    row: NotaCreditoDebito | null
  }>({ open: false, row: null })
  const { user } = useAuth()
  const entidad = useMemo(() => getEntidadInput(user), [user])

  const config = useMemo<MrtTableConfig<NotaCreditoDebito>>(
    () => ({
      id: 'listado-ncd',
      columns,
      manualPagination: true,
      rowMenuActions: [
        {
          label: 'Anular Documento',
          icon: <LayersClear />,
          onClick: ({ row }) => {
            setOpenAnularNcd({
              open: true,
              row: row,
            })
          },
          disabled: (row) => row.state !== apiEstado.validada || !hasActionPermission('ANULAR_DOCUMENTO'),
        },
        {
          label: 'Pdf Medio Oficio',
          icon: <PictureAsPdf />,
          onClick: ({ row }) => {
            if (row.representacionGrafica?.pdf) openInNewTab(row.representacionGrafica.pdf)
          },
          disabled: (row) => !hasActionPermission('VER_PDF_MEDIO_OFICIO'),
        },
        {
          label: 'Xml',
          icon: <FileOpen />,
          onClick: ({ row }) => {
            if (row.representacionGrafica?.xml) openInNewTab(row.representacionGrafica.xml)
          },
          disabled: (row) => !hasActionPermission('VER_XML'),
        },
        {
          label: 'Url S.I.N.',
          icon: <FileOpen />,
          onClick: ({ row }) => {
            if (row.representacionGrafica?.sin) openInNewTab(row.representacionGrafica.sin)
          },
          disabled: (row) => !hasActionPermission('VER_URL_SIN'),
        },
      ],
      rowIconsActions: [],
      showAudit: true,
      showIconRefetch: true,
    }),
    [columns],
  )

  const NCD_FILTER_TYPES: FilterTypeMap<NotaCreditoDebito> = {
    numeroFactura: 'number',
    numeroNotaCreditoDebito: 'number',
    cuf: 'string',
    state: 'string',
  }

  const ncdQuery = useMrtQuery({
    queryKey: ['notaCreditoDebitoListado'],
    queryFn: async (ctx) => {
      const pgs = genMrtQueryPagination(ctx, { filterTypes: NCD_FILTER_TYPES })
      const { limit, page, reverse, query } = pgs

      const response = await client.request<{
        restNotaCreditoDebitoListado: RestNotaCreditoDebitoConnection
      }>(RESTNOTACREDITODEBITOLISTADO, {
        limit,
        page,
        reverse,
        query,
        entidad,
      })
      const { docs = [], pageInfo } = response.restNotaCreditoDebitoListado
      return { docs, pageInfo: pageInfo as Required<typeof pageInfo> }
    },
    isServerSide: true,
  })
  const { refetch } = ncdQuery

  return (
    <>
      <SimpleContainerBox>
        <Breadcrumb routeSegments={[ncdGestionRoutesMap.ncdGestion]} />

        <SecureComponent action={'NUEVA_NOTA'}>
          <StackMenu asideSidebarFixed>
            <Button
              component={RouterLink}
              size={'small'}
              variant="contained"
              to={ncdGestionRoutesMap.ncdRegistro.path}
              startIcon={<DocumentScanner />}
              color={'primary'}
            >
              {ncdGestionRoutesMap.ncdRegistro.name}
            </Button>
          </StackMenu>
        </SecureComponent>
        <Box>
          <MrtDynamicTable config={config} {...ncdQuery} />
        </Box>
      </SimpleContainerBox>
      <AnularNcdDialog
        keepMounted
        factura={openAnularNcd.row!}
        id={'anularFactura'}
        open={openAnularNcd.open}
        onClose={async (resp: boolean) => {
          setOpenAnularNcd({
            open: false,
            row: null,
          })
          if (resp) {
            await refetch()
          }
        }}
      />
    </>
  )
}

export default NCDGestion
