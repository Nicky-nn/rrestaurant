import { FileOpen, PictureAsPdf } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import React, { FunctionComponent, useMemo } from 'react'

import { FilterTypeMap } from '../../../../base/components/Table/castMrtFilters'
import { genMrtQueryPagination } from '../../../../base/components/Table/genMrtQueryPagination'
import { MrtDynamicTable } from '../../../../base/components/Table/MrtDynamicTable'
import { MrtTableConfig } from '../../../../base/components/Table/mrtTypes'
import { useMrtQuery } from '../../../../base/components/Table/useMrtQuery'
import useAuth from '../../../../base/hooks/useAuth'
import { openInNewTab } from '../../../../utils/helper'
import { fetchFacturaListado } from '../../../ventas/api/factura.listado.api'
import { FacturaProps } from '../../../ventas/interfaces/factura'
import { NcdFacturaColumns } from '../Listado/NcdFacturaColumns'

interface OwnProps {
  id: string
  keepMounted: boolean
  open: boolean
  onClose: (value?: FacturaProps) => void
}

type Props = OwnProps

const FACTURA_FILTER_TYPES: FilterTypeMap<FacturaProps> = {
  numeroFactura: 'number',
  'cliente.razonSocial': 'string',
  'cliente.numeroDocumento': 'string',
  cuf: 'string',
  state: 'string',
}

/**
 * @description Dialogo para seleccionar la factura original
 * @param props
 * @constructor
 */
const NcdFacturaOriginalDialog: FunctionComponent<Props> = (props) => {
  const {
    user: { sucursal, puntoVenta },
  } = useAuth()

  const entidad = {
    codigoSucursal: sucursal.codigo,
    codigoPuntoVenta: puntoVenta.codigo,
  }
  const { onClose, open, ...other } = props

  const handleCancel = () => {
    onClose()
  }

  const setNotaCreditoDebito = (factura: FacturaProps) => {
    onClose(factura)
  }

  const columns = useMemo(() => NcdFacturaColumns, [])

  const config = useMemo<MrtTableConfig<FacturaProps>>(
    () => ({
      id: 'listado-facturas-originales',
      columns,
      manualPagination: true,
      rowMenuActions: [
        {
          label: 'Pdf Medio Oficio',
          icon: <PictureAsPdf />,
          onClick: ({ row }) => {
            openInNewTab(row.representacionGrafica.pdf)
          },
        },
        {
          label: 'Xml',
          icon: <FileOpen />,
          onClick: ({ row }) => {
            openInNewTab(row.representacionGrafica.xml)
          },
        },
        {
          label: 'Url S.I.N.',
          icon: <FileOpen />,
          onClick: ({ row }) => {
            openInNewTab(row.representacionGrafica.sin)
          },
        },
      ],
      rowActions: [
        {
          id: 'seleccionar',
          render: ({ row }) => (
            <Button
              size={'small'}
              variant={'contained'}
              color={'info'}
              onClick={() => setNotaCreditoDebito(row)}
            >
              Seleccionar
            </Button>
          ),
        },
      ],
      showAudit: false,
      showIconRefetch: true,
    }),
    [columns]
  )

  const facturaQuery = useMrtQuery({
    queryKey: ['NcdGestionFacturas'],
    queryFn: async (ctx) => {
      const pgs = genMrtQueryPagination(ctx, {
        filterTypes: FACTURA_FILTER_TYPES,
        filterFields: ['state=VALIDADA'],
      })
      pgs.limit = 5
      pgs.page = 1
      return await fetchFacturaListado(pgs, entidad)
    },
    isServerSide: true,
  })

  return (
    <>
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: 650 } }}
        maxWidth="lg"
        open={open}
        {...other}
      >
        <DialogTitle>Seleccione su factura</DialogTitle>
        <DialogContent dividers>
          <MrtDynamicTable config={config} {...facturaQuery} />
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            color={'error'}
            size={'small'}
            variant={'contained'}
            onClick={handleCancel}
            sx={{ mr: 2 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default NcdFacturaOriginalDialog
