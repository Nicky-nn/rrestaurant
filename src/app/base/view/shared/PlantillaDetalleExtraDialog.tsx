import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table'
import React, { FunctionComponent, useMemo } from 'react'

import { PlantillaDetalleExtra } from '../../../interfaces'
import { MuiTableNormalOptionsProps } from '../../../utils/muiTable/muiTableNormalOptionsProps'

interface OwnProps {
  id: string
  keepMounted: boolean
  open: boolean
  onClose: (value?: string) => void
  plantillaDetalleExtra: PlantillaDetalleExtra[]
}

type Props = OwnProps

/**
 * Data Table que nos permite seleccionar la plantilla creada desde adm
 * @param props
 * @constructor
 */
const PlantillaDetalleExtraDialog: FunctionComponent<Props> = (props) => {
  const { onClose, keepMounted, open, plantillaDetalleExtra, ...other } = props

  const columns = useMemo<MRT_ColumnDef<PlantillaDetalleExtra>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Titulo',
      },
      {
        accessorKey: 'description',
        header: 'Descripción',
      },
    ],
    [],
  )

  // Creamos la tabla
  const table = useMaterialReactTable({
    ...(MuiTableNormalOptionsProps as MRT_TableOptions<PlantillaDetalleExtra>),
    columns,
    data: plantillaDetalleExtra || [],
    state: {
      density: 'compact',
    },
    initialState: { showColumnFilters: false },
    renderRowActions: ({ row }) => (
      <Button
        variant={'outlined'}
        size={'small'}
        onClick={() => {
          onClose(row.original.content)
        }}
        sx={{ mt: 1, mb: 1 }}
      >
        Seleccionar
      </Button>
    ),
    renderDetailPanel: ({ row }) => (
      <Box sx={{ ml: 2, mr: 2 }}>
        <div dangerouslySetInnerHTML={{ __html: row.original.content }} />
      </Box>
    ),

    enableTopToolbar: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
  })

  return (
    <>
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '90vh' } }}
        maxWidth="md"
        keepMounted={keepMounted}
        open={open}
        {...other}
      >
        <DialogTitle>Seleccionar Plantilla Personalizada</DialogTitle>
        <DialogContent dividers>
          <MaterialReactTable table={table} />
        </DialogContent>
        <DialogActions>
          <Button
            variant={'contained'}
            color={'primary'}
            autoFocus
            onClick={() => onClose()}
            sx={{ mr: 2 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PlantillaDetalleExtraDialog
