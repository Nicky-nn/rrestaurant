import { Delete, Edit, MenuOpen } from '@mui/icons-material'
import { Divider, IconButton } from '@mui/material'
import { useConfirm } from 'material-ui-confirm'
import { FunctionComponent } from 'react'

import AuditIconButton from '../../../../base/components/Auditoria/AuditIconButton'
import SimpleMenu, { SimpleMenuItem } from '../../../../base/components/MyMenu/SimpleMenu'
import { MyGraphQlError } from '../../../../base/services/GraphqlError'
import { notError, notSuccess } from '../../../../utils/notification'
import { swalClose, swalException, swalLoading } from '../../../../utils/swal'
import { deleteClients } from '../../api/deleteClient'
import { ClientProps } from '../../interfaces/client'

interface ActionsMenuProps {
  client: ClientProps
  onRefetch: () => void
  onUpdateClient: (client: ClientProps) => void
}

type Props = ActionsMenuProps

const ActionsMenu: FunctionComponent<Props> = ({ client, onRefetch, onUpdateClient }) => {
  const confirm = useConfirm()

  /**
   * Eliminación de un cliente
   * @param codeClients
   */
  const onDelete = async (codeClients: string[]) => {
    try {
      const { confirmed } = await confirm()
      if (!confirmed) return

      swalLoading()
      const response = await deleteClients(codeClients)
      if (response) {
        notSuccess()
        onRefetch()
      }
    } catch (error) {
      if (error instanceof MyGraphQlError) {
        notError(error.message)
      } else {
        swalException(error)
      }
    } finally {
      swalClose()
    }
  }

  return (
    <>
      <SimpleMenu
        menuButton={
          <IconButton>
            <MenuOpen />
          </IconButton>
        }
      >
        <SimpleMenuItem onClick={() => onUpdateClient(client)}>
          <Edit /> Actualizar
        </SimpleMenuItem>
        <Divider />
        <SimpleMenuItem sx={{ color: 'red' }} onClick={() => onDelete([client.codigoCliente])}>
          <Delete /> Eliminar
        </SimpleMenuItem>
      </SimpleMenu>
      <AuditIconButton row={client} />
    </>
  )
}

export default ActionsMenu
