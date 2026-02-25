import { DeleteForever, Edit, PersonAddAltSharp } from '@mui/icons-material'
import { Box, Button } from '@mui/material'
import { useConfirm } from 'material-ui-confirm'
import { FunctionComponent, useMemo, useState } from 'react'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import { ContentConfirmMessage } from '../../../base/components/Dialog/ContentConfirmMessage.tsx'
import StackMenu from '../../../base/components/MyMenu/StackMenu.tsx'
import { FilterTypeMap } from '../../../base/components/Table/castMrtFilters.ts'
import { genMrtQueryPagination } from '../../../base/components/Table/genMrtQueryPagination.ts'
import { MrtDynamicTable } from '../../../base/components/Table/MrtDynamicTable.tsx'
import { MrtTableConfig } from '../../../base/components/Table/mrtTypes.ts'
import { useMrtQuery } from '../../../base/components/Table/useMrtQuery.tsx'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import { notSuccess } from '../../../utils/notification.ts'
import { swalClose, swalException, swalLoading } from '../../../utils/swal.ts'
import { apiClienteListado } from '../api/apiClienteListado.ts'
import { deleteClients } from '../api/deleteClient.ts'
import { clientsRoutesMap } from '../clientsRoutes'
import RegisterClientDialog from '../components/RegisterClientDialog.tsx'
import { ClientProps } from '../interfaces/client.ts'
import { tableColumns } from './ListClients/TableClientsHeaders.tsx'
import UpdateClientDialog from './Update/UpdateClientDialog.tsx'

interface ClientsProps {}

type Props = ClientsProps

const Clients: FunctionComponent<Props> = () => {
  const confirm = useConfirm()

  const [openClienteRegistro, setOpenClienteRegistro] = useState(false)
  const [openClienteUpdate, setOpenClienteUpdate] = useState(false)
  const [clientArg, setClientArg] = useState<ClientProps | null>(null)
  const [clientIs99001, setClientIs99001] = useState(false)

  const columns = useMemo(() => tableColumns, [])

  /**
   * Eliminación de un cliente
   * @param codeClients
   * @param refetch
   */
  const onDelete = async (codeClients: string[], refetch: () => Promise<any>) => {
    const { confirmed } = await confirm({
      content: (
        <ContentConfirmMessage
          title={'Eliminar'}
          description={`Esta punto de eliminar al cliente ${codeClients[0]}`}
          type={'error'}
        />
      ),
    })
    if (!confirmed) return

    swalLoading()
    const response = await deleteClients(codeClients).catch((e) => {
      swalException(e)
      return null
    })
    if (response) {
      swalClose()
      notSuccess()
      await refetch()
    }
  }

  const config = useMemo<MrtTableConfig<ClientProps>>(
    () => ({
      id: 'listado-clientes',
      columns,
      showIconRefetch: true,
      showAudit: true,
      manualPagination: true,
      rowMenuActions: [
        {
          label: 'Eliminar',
          icon: <DeleteForever />,
          color: 'error',
          onClick: async ({ row, refetch }) => {
            await onDelete([row.codigoCliente], refetch)
          },
        },
      ],
      rowIconsActions: [
        {
          label: 'Editar',
          icon: <Edit />,
          onClick: ({ row }) => {
            const is99001 =
              (row.codigoExcepcion ?? 0) > 0 ||
              row.numeroDocumento === '99001' ||
              /^[A-Z]{5,}$/.test(row.codigoCliente ?? '')
            setClientIs99001(is99001)
            setClientArg(row)
            setOpenClienteUpdate(true)
          },
        },
      ],
    }),
    [],
  )

  // Mapa de filtros para el sistema de filtros inteligentes
  const CLIENT_FILTER_TYPES: FilterTypeMap<ClientProps> = {
    lineaCredito: 'boolean', // Convertirá "true" -> true
    telefono: 'string', // Convertirá "25" -> 25
    numeroDocumento: 'string',
  }

  const clientes = useMrtQuery({
    queryKey: ['clients'],
    queryFn: async (ctx) => {
      const pgs = genMrtQueryPagination(ctx, { filterTypes: CLIENT_FILTER_TYPES })
      return await apiClienteListado(pgs)
    },
    isServerSide: true,
  })

  return (
    <SimpleContainerBox>
      <Breadcrumb routeSegments={[clientsRoutesMap.clients]} />

      <StackMenu asideSidebarFixed>
        <Button
          size={'small'}
          variant="contained"
          onClick={() => setOpenClienteRegistro(true)}
          startIcon={<PersonAddAltSharp />}
          color={'primary'}
        >
          Nuevo Cliente
        </Button>
      </StackMenu>
      <Box>
        <MrtDynamicTable config={config} {...clientes} />
      </Box>

      <RegisterClientDialog
        id={'clienteRegistroDialog'}
        open={openClienteRegistro}
        onClose={async (isRegisterSuccess) => {
          setOpenClienteRegistro(false)
          if (isRegisterSuccess) {
            await clientes.refetch()
          }
        }}
      />

      <UpdateClientDialog
        id={'updateRegistroDialgo'}
        open={openClienteUpdate}
        client={clientArg}
        is99001={clientIs99001}
        onClose={async (isUpdateSuccess) => {
          setOpenClienteUpdate(false)
          setClientArg(null)
          setClientIs99001(false)
          if (isUpdateSuccess) {
            await clientes.refetch()
          }
        }}
      />
    </SimpleContainerBox>
  )
}

export default Clients
