import { ScreenSearchDesktop } from '@mui/icons-material'
import { ButtonGroup, FormControl, IconButton, Tooltip, useTheme } from '@mui/material'
import { Grid } from '@mui/system'
import { FunctionComponent, useState } from 'react'
import AsyncSelect from 'react-select/async'

import { MyInputLabel } from '../../../base/components/MyInputs/MyInputLabel'
import { reactSelectStyle } from '../../../base/components/MySelect/ReactSelect'
import { swalException } from '../../../utils/swal'
import { searchClientsApi } from '../api/searchClients.api'
import { ClientProps } from '../interfaces/client'
import SearcListClient from './SearchListClient'
import { getSelectStyles } from '../../../base/components/MySelect/selectStyles.tsx'

interface InputSearchClientProps {
  withCreditLine: boolean
  onClientSelect: (client: ClientProps | null) => void
  onListShowed: (isShow: boolean) => void
}

type Props = InputSearchClientProps

const InputSearchClient: FunctionComponent<Props> = ({
  onClientSelect,
  withCreditLine,
  onListShowed,
}) => {
  const [client, setClient] = useState<ClientProps | null>(null)
  const [openList, setOpenList] = useState(false)

  const theme = useTheme()

  const searchClient = async (value: string): Promise<ClientProps[]> => {
    try {
      if (value.length > 2) {
        const resp = await searchClientsApi(value)
        return resp.filter((client) =>
          withCreditLine
            ? client.lineaCredito
            : client.lineaCredito == null || !client.lineaCredito,
        )
      }
      return []
    } catch (e: any) {
      swalException(e)
      return []
    }
  }

  return (
    <>
      <Grid container spacing={0.5} sx={{ my: 1 }}>
        <Grid size={11}>
          <FormControl fullWidth>
            <MyInputLabel shrink>Busqueda de clientes</MyInputLabel>
            <AsyncSelect<ClientProps>
              styles={getSelectStyles(theme, false)}
              menuPosition={'fixed'}
              loadOptions={searchClient}
              isClearable={true}
              value={client}
              getOptionValue={(item) => item.codigoCliente}
              getOptionLabel={(item) =>
                `${item.codigoCliente} - ${item.razonSocial} 
                            ${item.nombres || ''} ${item.apellidos || ''}`
              }
              onChange={(resp) => {
                if (resp) {
                  setClient(resp)
                  onClientSelect(resp)
                } else {
                  setClient(null)
                  onClientSelect(null)
                }
              }}
              noOptionsMessage={() =>
                'Ingrese referencia -> Razón social, código cliente, número de documento.'
              }
              loadingMessage={() => 'Buscando...'}
            />
          </FormControl>
        </Grid>

        <Grid size={1}>
          <ButtonGroup variant="text" aria-label="Opciones de cliente">
            <IconButton
              aria-label="busqueda-cliente"
              sx={{ p: 0.6 }}
              aria-hidden={false}
              onClick={() => {
                setOpenList(!openList)
                onListShowed(!openList)
              }}
            >
              <Tooltip title={'Explorar clientes'}>
                <ScreenSearchDesktop fontSize="large" />
              </Tooltip>
            </IconButton>
          </ButtonGroup>
        </Grid>

        <Grid size={12}>
          {openList && (
            <SearcListClient
              onSelectedClient={(client) => {
                setClient(client)
                onClientSelect(client)
                setOpenList(false)
              }}
              withCreditLine={withCreditLine}
            />
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default InputSearchClient
