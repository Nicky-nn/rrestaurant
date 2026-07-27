import { Block, CheckCircle, Delete, Edit, PersonAddAltSharp, Map } from '@mui/icons-material'
import { Box, Button } from '@mui/material'
import { MRT_ColumnDef } from 'material-react-table'
import React, { useMemo, useState } from 'react'
import Swal from 'sweetalert2'

import StackMenu from '../../../../base/components/MyMenu/StackMenu.tsx'
import { MrtDynamicTable } from '../../../../base/components/Table/MrtDynamicTable'
import { MrtTableConfig } from '../../../../base/components/Table/mrtTypes'
import { SecureComponent } from '../../../../security/withSecurity.tsx'
import { useRepartidoresQuery } from '../../hooks/useRepartidoresQuery'
import RepartidorDialog from './RepartidorDialog'
import DeliveryZonesDialog from './DeliveryZonesDialog'

export interface RepartidorProps {
  id: string
  email: string
  vehiculo: string
  status: string
  esConfiable: boolean
  createdAt: string
  updatedAt: string
}

const RepartidoresTable: React.FC = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(100)

  const { listRepartidoresQuery, deleteRepartidorMutation, updateRepartidorMutation } = useRepartidoresQuery(page, limit)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRepartidor, setEditingRepartidor] = useState<RepartidorProps | null>(null)

  const [isZonesDialogOpen, setIsZonesDialogOpen] = useState(false)

  const handleOpenDialog = (repartidor?: RepartidorProps) => {
    setEditingRepartidor(repartidor || null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      await deleteRepartidorMutation.mutateAsync(id)
      Swal.fire('Eliminado!', 'El repartidor ha sido eliminado.', 'success')
    }
  }

  const columns = useMemo<MRT_ColumnDef<RepartidorProps>[]>(
    () => [
      {
        accessorKey: 'email',
        header: 'Correo Electrónico',
      },
      {
        accessorKey: 'vehiculo',
        header: 'Vehículo',
        filterVariant: 'select',
        filterSelectOptions: ['CAMINANDO', 'BICICLETA', 'MOTO', 'AUTO'],
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        filterVariant: 'select',
        filterSelectOptions: ['PENDIENTE', 'ACTIVO', 'INACTIVO'],
      },
      {
        accessorKey: 'esConfiable',
        header: 'Confiable',
        Cell: ({ cell }) => (cell.getValue() ? 'Sí' : 'No (Pide Código)'),
      },
      {
        accessorKey: 'createdAt',
        header: 'Fecha Registro',
        Cell: ({ cell }) => {
          const val = cell.getValue() as string | number;
          if (!val) return '';
          const date = isNaN(Number(val)) ? new Date(val) : new Date(Number(val));
          return date.toLocaleDateString();
        },
      },
    ],
    [],
  )

  const config = useMemo<MrtTableConfig<RepartidorProps>>(
    () => ({
      id: 'listado-repartidores',
      columns,
      showIconRefetch: true,
      showAudit: true,
      manualPagination: true,
      rowMenuActions: [
        {
          label: 'Activar',
          icon: <CheckCircle />,
          color: 'success',
          onClick: async ({ row }) => {
             await updateRepartidorMutation.mutateAsync({ id: row.id, input: { status: 'ACTIVO' } });
             Swal.fire('Activado', 'El repartidor ha sido activado', 'success');
          },
          hidden: (row) => row.status === 'ACTIVO',
        },
        {
          label: 'Suspender',
          icon: <Block />,
          color: 'warning',
          onClick: async ({ row }) => {
             await updateRepartidorMutation.mutateAsync({ id: row.id, input: { status: 'INACTIVO' } });
             Swal.fire('Suspendido', 'El repartidor ha sido suspendido', 'success');
          },
          hidden: (row) => row.status === 'INACTIVO' || row.status === 'PENDIENTE',
        },
        {
          label: 'Eliminar',
          icon: <Delete />,
          color: 'error',
          onClick: async ({ row }) => {
            await handleDelete(row.id)
          },
        },
      ],
      rowIconsActions: [
        {
          label: 'Editar',
          icon: <Edit />,
          onClick: ({ row }) => {
            handleOpenDialog(row)
          },
        },
      ],
    }),
    [columns, updateRepartidorMutation]
  )

  return (
    <>
      <SecureComponent action="GESTION_ECOMMERCE">
        <StackMenu asideSidebarFixed>
          <Button
            size={'small'}
            variant="contained"
            onClick={() => handleOpenDialog()}
            startIcon={<PersonAddAltSharp />}
            color={'primary'}
          >
            Nuevo Repartidor
          </Button>
          <Button
            size={'small'}
            variant="outlined"
            onClick={() => setIsZonesDialogOpen(true)}
            startIcon={<Map />}
            color={'secondary'}
            sx={{ ml: 2 }}
          >
            Configurar Zonas de Entrega
          </Button>
        </StackMenu>
      </SecureComponent>

      <Box mt={2}>
        <MrtDynamicTable
          config={config}
          data={{
            docs: listRepartidoresQuery.data?.repartidores || [],
            pageInfo: {
              totalDocs: listRepartidoresQuery.data?.totalCount || 0,
              totalPages: listRepartidoresQuery.data?.totalPages || 0,
              page: listRepartidoresQuery.data?.currentPage || 1,
              limit,
              hasNextPage: false,
              hasPrevPage: false,
            },
          }}
          isLoading={listRepartidoresQuery.isLoading}
          isFetching={listRepartidoresQuery.isFetching}
          refetch={listRepartidoresQuery.refetch}
          state={{}}
          onStateChange={{}}
        />
      </Box>

      <RepartidorDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        repartidor={editingRepartidor}
      />

      {isZonesDialogOpen && (
        <DeliveryZonesDialog
          open={isZonesDialogOpen}
          onClose={() => setIsZonesDialogOpen(false)}
        />
      )}
    </>
  )
}

export default RepartidoresTable

