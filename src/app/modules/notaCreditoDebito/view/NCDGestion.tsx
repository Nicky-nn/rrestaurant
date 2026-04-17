import { Box, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import React, { FunctionComponent, useMemo, useState } from 'react'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import { FilterTypeMap } from '../../../base/components/Table/castMrtFilters'
import { genMrtQueryPagination } from '../../../base/components/Table/genMrtQueryPagination'
import { MrtDynamicTable } from '../../../base/components/Table/MrtDynamicTable'
import { MrtTableConfig } from '../../../base/components/Table/mrtTypes'
import { useMrtQuery } from '../../../base/components/Table/useMrtQuery'

import { client } from '../client'
import {
  RESTNOTACREDITODEBITOLISTADO,
  RestNotaCreditoDebitoListadoVariables,
} from '../queries/useRestNotaCreditoDebitoListado'
import { NotaCreditoDebito, RestNotaCreditoDebitoConnection } from '../types'
import { notaCreditoColumns } from './Listado/notaCreditoColumns'
import { Code, DocumentScanner, FileOpen, LayersClear, PictureAsPdf } from '@mui/icons-material'
import { apiEstado } from '../../../interfaces'
import StackMenu from '../../../base/components/MyMenu/StackMenu'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import notaCreditoDebitoRoutes, { ncdGestionRoutesMap } from '../notaCreditoDebitoRoutes'
import AnularNcdDialog from './Listado/AnularNcdDialog'
import { NcdProps } from '../interfaces/ncdInterface'
import { apiNotasCreditoDebito } from '../api/ncd.api'
import { getEntidadInput } from '../../../utils/getEntidadInput'
import useAuth from '../../../base/hooks/useAuth'
import { openInNewTab } from '../../../utils/helper'

interface NCDGestionProps {}

const NCDGestion: FunctionComponent<NCDGestionProps> = () => {
  const columns = useMemo(() => notaCreditoColumns, [])
const [openAnularNcd, setOpenAnularNcd] = useState<{
    open: boolean
    row: NcdProps | null
  }>({ open: false, row: null })
  const { user } = useAuth()
  const entidad = useMemo(() => getEntidadInput(user), [user])
  
  const config = useMemo<MrtTableConfig<NcdProps >>(
    () => ({
      id: 'listado-ncd',
      columns,
      manualPagination: true,
      rowMenuActions: [
        {
            label: 'Anular Documento',
            icon: <LayersClear/ >,
            onClick: ({row}) => {
            setOpenAnularNcd({
              open: true,
              row: row,
            })
          },
            disabled: (row) => row.state !== apiEstado.validada            
        },
        {
            label: 'Pdf Medio Oficio',
            icon: <PictureAsPdf/ >,
            onClick: ({row}) => {
                openInNewTab(row.representacionGrafica.pdf)
            }            
        },
        {
            label: 'Xml',
            icon: <FileOpen/ >,
            onClick: ({row}) => {
                openInNewTab(row.representacionGrafica.xml)
            }            
        },
        {
            label: 'Url S.I.N.',
            icon: <FileOpen/ >,
            onClick: ({row}) => {
                openInNewTab(row.representacionGrafica.sin)
            }           
        }
      ],
      rowIconsActions: [],
      showAudit:true,
      showIconRefetch: true,
    }),
    [columns]
  )

  const NCD_FILTER_TYPES: FilterTypeMap<NcdProps> = {
    numeroFactura: 'number',
    numeroNotaCreditoDebito: 'number',
    cuf: 'string',
    state: 'string',
  }

  const ncdQuery = useMrtQuery({
    queryKey: ['notaCreditoDebitoListado'],
    queryFn: async (ctx) => {
      const pgs = genMrtQueryPagination(ctx, { filterTypes: NCD_FILTER_TYPES })
      
      return await apiNotasCreditoDebito(pgs,entidad.codigoPuntoVenta,entidad.codigoSucursal)
    },
    isServerSide: true,
  })
  const { refetch } = ncdQuery

  return (
     <>
    <SimpleContainerBox>
              <Breadcrumb routeSegments={[ncdGestionRoutesMap.ncdGestion]} />
        
      <StackMenu asideSidebarFixed>
        <Button
          component={RouterLink}
          size={'small'}
          variant="contained"
          to={ncdGestionRoutesMap.ncdRegistro.path}
          startIcon={<DocumentScanner  />}
          color={'primary'}
        >
          {ncdGestionRoutesMap.ncdRegistro.name}
        </Button>
      </StackMenu>
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
