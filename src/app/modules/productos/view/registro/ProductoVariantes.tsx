import { Delete, Edit } from '@mui/icons-material'
import { Box, Grid, IconButton } from '@mui/material'
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { FunctionComponent, useState } from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'

import { numberWithCommas } from '../../../../base/components/MyInputs/NumberInput'
import SimpleCard from '../../../../base/components/Template/Cards/SimpleCard'
import { genReplaceEmpty } from '../../../../utils/helper'
import {
  DcdoProps,
  MuiDisplayColumnDefOptions,
  MuiTableProps,
} from '../../../../utils/muiTable/materialReactTableUtils'
import { notError } from '../../../../utils/notification'
import { swalConfirmDialog } from '../../../../utils/swal'
import {
  PRODUCTO_VARIANTE_INITIAL_VALUES,
  ProductoInputProps,
  ProductoVarianteInputProps,
} from '../../interfaces/producto.interface'
import PrecioInventarioDetalle from './ProductoVariantes/PrecioInventarioDetalle'
import PrecioInventarioVariantesDialog from './ProductoVariantes/PrecioInventarioVariantesDialog'

interface OwnProps {
  form: UseFormReturn<ProductoInputProps>
}

type Props = OwnProps

const ProductoVariantes: FunctionComponent<Props> = (props) => {
  const {
    form: {
      control,
      watch,
      formState: { errors },
    },
  } = props
  const { replace } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'variantes', // unique name for your Field Array
  })
  const [varianteWatch, variantesWatch] = watch(['variante', 'variantes'])
  const varianteUnicaWatch = watch('varianteUnica')

  const [variante, setVariante] = useState<ProductoVarianteInputProps>(
    PRODUCTO_VARIANTE_INITIAL_VALUES,
  )
  const [openDialog, setOpenDialog] = useState(false)

  const columns: MRT_ColumnDef<ProductoVarianteInputProps>[] = [
    {
      accessorKey: 'titulo',
      header: 'Variante',
    },
    {
      accessorKey: 'codigoProducto',
      header: 'Código',
    },
    {
      accessorKey: 'unidadMedida.descripcion',
      header: 'Unidad Medida',
    },
    {
      accessorKey: 'precio',
      header: 'Precio',
      muiTableBodyCellProps: {
        align: 'right',
      },
      Cell: ({ cell }) => {
        return numberWithCommas(genReplaceEmpty(cell.getValue(), 0), {})
      },
    },
  ]

  return (
    <>
      {!varianteUnicaWatch && (
        <>
          <SimpleCard title={'VARIANTES DE PRODUCTO'}>
            <Grid container columnSpacing={3} rowSpacing={{ xs: 2, sm: 2, md: 0, lg: 0 }}>
              <Grid item lg={12} md={12} xs={12}>
                <MaterialReactTable
                  columns={columns}
                  data={variantesWatch || []}
                  enableColumnActions={false}
                  enableColumnFilters={false}
                  localization={MRT_Localization_ES}
                  enablePagination={false}
                  enableSorting={false}
                  state={{
                    density: 'compact',
                  }}
                  muiTableProps={MuiTableProps}
                  displayColumnDefOptions={
                    MuiDisplayColumnDefOptions as DcdoProps<ProductoVarianteInputProps>
                  }
                  enableBottomToolbar={false}
                  enableTopToolbar={false}
                  positionActionsColumn="last"
                  enableRowActions
                  renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                      <IconButton
                        aria-label="delete"
                        color={'primary'}
                        onClick={() => {
                          setVariante(row.original)
                          setOpenDialog(true)
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        color={'error'}
                        onClick={async () => {
                          if (variantesWatch.length > 1) {
                            await swalConfirmDialog({}).then((resp) => {
                              if (resp.isConfirmed) {
                                const newVariantes = variantesWatch.filter(
                                  (v) => v.id !== row.original.id,
                                )
                                replace(newVariantes)
                              }
                            })
                          } else {
                            notError('Debe existe al menos 1 variante de producto')
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                  renderDetailPanel={({ row }) => (
                    <PrecioInventarioDetalle row={row.original} />
                  )}
                />
              </Grid>
            </Grid>
          </SimpleCard>

          <PrecioInventarioVariantesDialog
            variante={variante}
            id={'editVariante'}
            keepMounted={false}
            open={openDialog}
            onClose={(data: ProductoVarianteInputProps | undefined) => {
              if (data) {
                const newVariantes = variantesWatch.map((v) => {
                  if (v.id === data.id) return data
                  return v
                })
                replace(newVariantes)
              }
              setOpenDialog(false)
            }}
          />
        </>
      )}
    </>
  )
}

export default ProductoVariantes
