import { Add, Close, Delete, Edit } from '@mui/icons-material'
import { Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { MRT_ColumnDef } from 'material-react-table'
import { FunctionComponent, useMemo, useState } from 'react'

import { MrtDynamicTable } from '../../../../base/components/Table/MrtDynamicTable'
import useAuth from '../../../../base/hooks/useAuth'
import { notSuccess } from '../../../../utils/notification'
import { swalClose, swalConfirmDialog, swalException, swalLoading } from '../../../../utils/swal'
import { useImpresoraEliminar } from '../../mutations/useImpresoraEliminar'
import { useImpresoraPorSucursal } from '../../queries/useImpresoraPorSucursal'
import { Impresora } from '../../types'
import ImpresoraFormDialog from './ImpresoraFormDialog'

interface Props {
  open: boolean
  onClose: () => void
}

const GestionImpresorasDialog: FunctionComponent<Props> = ({ open, onClose }) => {
  const { user } = useAuth()

  const {
    data: impresoras = [],
    isLoading,
    isFetching,
    refetch,
  } = useImpresoraPorSucursal({
    codigoSucursal: user?.sucursal?.codigo || 0,
  })

  const impresorasReversed = useMemo(() => {
    return impresoras ? [...impresoras].reverse() : []
  }, [impresoras])

  const { mutateAsync: eliminarImpresora } = useImpresoraEliminar()

  const [openForm, setOpenForm] = useState(false)
  const [impresoraEditar, setImpresoraEditar] = useState<Impresora | null>(null)

  const handleCreate = () => {
    setImpresoraEditar(null)
    setOpenForm(true)
  }

  const handleEdit = (imp: Impresora) => {
    setImpresoraEditar(imp)
    setOpenForm(true)
  }

  const handleDelete = async (imp: Impresora) => {
    if (!imp._id) return

    const confirm = await swalConfirmDialog({
      title: '¿Eliminar impresora?',
      text: `¿Estás seguro de que deseas eliminar la impresora "${imp.nombre}"? Esta acción no se puede deshacer.`,
    })
    if (!confirm.isConfirmed) return

    swalLoading()
    try {
      await eliminarImpresora({ id: imp._id })
      await refetch()
      swalClose()
      notSuccess('Impresora eliminada correctamente')
    } catch (e) {
      swalException(e)
    }
  }

  const columns = useMemo<MRT_ColumnDef<Impresora>[]>(
    () => [
      { accessorKey: 'nombre', header: 'Nombre', size: 150 },
      { accessorKey: 'descripcion', header: 'Descripción', size: 200 },
      { accessorKey: 'atributo1', header: 'Atributo 1', size: 150 },
      { accessorKey: 'atributo2', header: 'Atributo 2', size: 150 },
    ],
    [],
  )

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Gestión de Impresoras
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ height: 500 }}>
          <MrtDynamicTable<Impresora>
            config={{
              id: 'tabla-gestion-impresoras',
              columns,
              showIconRefetch: true,
              renderTopToolbarCustomActions: () => (
                <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleCreate}>
                  Agregar Impresora
                </Button>
              ),
              rowMenuActions: [
                {
                  label: 'Editar',
                  icon: <Edit fontSize="small" />,
                  onClick: ({ row }) => handleEdit(row),
                  color: 'primary',
                },
                {
                  label: 'Eliminar',
                  icon: <Delete fontSize="small" />,
                  onClick: ({ row }) => handleDelete(row),
                  color: 'error',
                },
              ],
            }}
            data={impresorasReversed}
            isLoading={isLoading}
            isFetching={isFetching}
            refetch={async () => void refetch()}
          />
        </DialogContent>
      </Dialog>

      {openForm && (
        <ImpresoraFormDialog
          open={openForm}
          impresora={impresoraEditar}
          onClose={(success) => {
            setOpenForm(false)
            if (success) {
              refetch()
            }
          }}
        />
      )}
    </>
  )
}

export default GestionImpresorasDialog
