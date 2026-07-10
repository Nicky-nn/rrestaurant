import { Box, Grid, IconButton, InputAdornment, Typography } from '@mui/material'
import { Receipt, Search } from '@mui/icons-material'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_RowSelectionState,
  MRT_TableOptions,
} from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { FormTextField } from '../../../../base/components/Form'
import { numberWithCommas } from '../../../../base/components/MyInputs/NumberInput'
import SimpleCard from '../../../../base/components/Template/Cards/SimpleCard'
import { MuiTableBasicOptionsProps } from '../../../../utils/muiTable/materialReactTableUtils'
import { NcdInputProps } from '../../types'
import { SalidaFactura, SalidaFacturaDetalle } from '../../../restaurante/types'
import NcdFacturaOriginalDialog from './NcdFacturaOriginalDialog'

interface OwnProps {
  form: UseFormReturn<NcdInputProps>
}

type Props = OwnProps

const NcdFacturaOriginal: FunctionComponent<Props> = (props) => {
  const {
    form: { setValue, getValues },
  } = props

  const [openDialog, setOpenDialog] = useState(false)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const [, setSelectedRows] = useState([])

  const columns = useMemo<MRT_ColumnDef<SalidaFacturaDetalle>[]>(
    () => [
      {
        accessorKey: 'nroItem',
        header: 'Nro. Item',
        size: 50,
      },
      {
        accessorKey: 'cantidad',
        header: 'Cantidad',
        size: 80,
        muiTableBodyCellProps: {
          align: 'right',
        },
        Cell: ({ cell }) => <span>{numberWithCommas(cell.getValue<number>(), {})}</span>,
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        minSize: 300,
        maxSize: 800,
        size: 100,
      },
      {
        accessorKey: 'montoDescuento',
        header: 'Descuento',
        size: 100,
        muiTableBodyCellProps: {
          align: 'right',
        },
        Cell: ({ cell }) => <span>{numberWithCommas(cell.getValue<number>(), {})}</span>,
      },
      {
        accessorKey: 'precioUnitario',
        header: 'Precio Unitario',
        size: 100,
        muiTableBodyCellProps: {
          align: 'right',
        },
        Cell: ({ cell }) => <span>{numberWithCommas(cell.getValue<number>(), {})}</span>,
      },
      {
        accessorKey: 'subTotal',
        header: 'Sub Total',
        size: 100,
        muiTableBodyCellProps: {
          align: 'right',
        },
        Cell: ({ cell }) => <span>{numberWithCommas(cell.getValue<number>(), {})}</span>,
      },
    ],
    [],
  )

  useEffect(() => {
    setSelectedRows([])
    setValue('detalleFactura', [])
  }, [])

  useEffect(() => {
    if (rowSelection) {
      const p = Object.keys(rowSelection)
      if (p.length > 0) {
        const pvs = (getValues('detalle') || []).filter((i) => p.includes(i.nroItem?.toString() || ''))
        if (pvs.length > 0) {
          const currentDetalleFactura = getValues('detalleFactura') || []
          const detalle = pvs.map((d: SalidaFacturaDetalle) => {
            const existingItem = currentDetalleFactura.find((cd) => cd.nroItem === d.nroItem)
            return {
              nroItem: d.nroItem || 0,
              cantidadOriginal: d.cantidad || 0,
              cantidad: existingItem ? existingItem.cantidad : d.cantidad || 0,
              descripcion: d.descripcion || '',
              montoDescuento: d.montoDescuento || 0,
              precioUnitario: d.precioUnitario || 0,
              subTotal: d.subTotal || 0,
            }
          })
          setValue('detalleFactura', detalle)
        } else {
          setValue('detalleFactura', [])
        }
      } else {
        setValue('detalleFactura', [])
      }
    }
  }, [rowSelection])

  return (
    <>
      <SimpleCard
        title={
          <Box display="flex" alignItems="center">
            <Receipt sx={{ mr: 1 }} />
            DATOS DE LA FACTURA ORIGINAL
          </Box>
        }
      >
        <Grid container spacing={3}>
          <Grid size={{ lg: 3, md: 4, xs: 12 }}>
            <FormTextField
              name="numeroFactura"
              label="Número Factura / Buscar"
              value={getValues('numeroFactura')}
              autoComplete="off"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" color="primary" onClick={() => setOpenDialog(true)}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ lg: 3, md: 3, xs: 12 }}>
            <FormTextField
              name="fechaEmision"
              label="Fecha Emisión"
              value={getValues('fechaEmision')}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid size={{ lg: 6, md: 5, xs: 12 }}>
            <FormTextField
              name="razonSocial"
              label="Razón Social"
              value={getValues('razonSocial')}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid size={{ lg: 12, md: 12, xs: 12 }}>
            <FormTextField
              name="facturaCuf"
              label="Código Control (C.U.F.)"
              value={getValues('facturaCuf')}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid size={{ lg: 12, md: 12, xs: 12 }}>
            <Typography gutterBottom variant={'subtitle1'}>
              Seleccione los items a ser devueltos
            </Typography>
            <MaterialReactTable
              {...(MuiTableBasicOptionsProps as MRT_TableOptions<SalidaFacturaDetalle>)}
              columns={columns}
              data={getValues('detalle') || []}
              localization={MRT_Localization_ES}
              enableBottomToolbar={false}
              state={{
                rowSelection,
                density: 'comfortable',
              }}
              enableTopToolbar={false}
              enableRowSelection
              onRowSelectionChange={setRowSelection}
              getRowId={(row) => row.nroItem?.toString() || ''}
              muiTableBodyRowProps={({ row }) => ({
                onClick: row.getToggleSelectedHandler(),
                sx: {
                  cursor: 'pointer',
                },
              })}
            />
          </Grid>
        </Grid>
      </SimpleCard>
      <>
        <NcdFacturaOriginalDialog
          id={'ncdFacturaOriginalDialogSeleccion'}
          keepMounted={true}
          open={openDialog}
          onClose={(value?: SalidaFactura) => {
            setOpenDialog(false)
            if (value) {
              setValue('numeroFactura', value.numeroFactura?.toString() || '')
              setValue('fechaEmision', value.fechaEmision || '')
              setValue('razonSocial', value.cliente?.razonSocial || '')
              setValue('facturaCuf', value.cuf || '')
              setValue('detalleFactura', [])
              setValue('detalle', value.detalle || [])
              setSelectedRows([])
            }
          }}
        />
      </>
    </>
  )
}

export default NcdFacturaOriginal
