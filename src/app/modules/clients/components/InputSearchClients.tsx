import { PersonAddAlt1, ScreenSearchDesktop } from '@mui/icons-material'
import {
  ButtonGroup,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  useTheme,
} from '@mui/material'
import { Grid } from '@mui/system'
import { FunctionComponent, useCallback, useEffect, useState } from 'react'
import AsyncCreatableSelect from 'react-select/async-creatable'

import { MyInputLabel } from '../../../base/components/MyInputs/MyInputLabel'
import { getSelectStyles } from '../../../base/components/MySelect/selectStyles.tsx'
import useAuth from '../../../base/hooks/useAuth'
import { swalException } from '../../../utils/swal'
import { searchClientsApi } from '../api/searchClients.api'
import useQueryTipoDocumentoIdentidad from '../hooks/useQueryTipoDocumento'
import { ClientApiInputProps, ClientProps } from '../interfaces/client'
import RegisterClientDialog from './RegisterClientDialog'
import SearcListClient from './SearchListClient'

interface InputSearchClientProps {
  value?: ClientProps | null
  withCreditLine: boolean
  onClientSelect: (client: ClientProps | null) => void
  onListShowed: (isShow: boolean) => void
  autoSelectDefaultCode?: string
  editable?: boolean
  onChangeEditable?: (client: ClientApiInputProps | null) => void
  hideLabel?: boolean
}

type Props = InputSearchClientProps

const InputSearchClient: FunctionComponent<Props> = ({
  value,
  onClientSelect,
  withCreditLine,
  onListShowed,
  autoSelectDefaultCode,
  editable,
  onChangeEditable,
  hideLabel,
}) => {
  const [client, setClient] = useState<ClientProps | null>(value || null)
  const [openList, setOpenList] = useState(false)
  const [openRegister, setOpenRegister] = useState(false)
  const [editableClient, setEditableClient] = useState<ClientApiInputProps | null>(null)

  const theme = useTheme()
  const { tiposDocumentoIdentidad } = useQueryTipoDocumentoIdentidad()
  const { lw } = useAuth()

  const fetchDefaultClient = useCallback(
    (code: string) => {
      searchClientsApi(code)
        .then((resp) => {
          const found = resp.find((c) => c.codigoCliente === code) || resp[0]
          if (found) {
            setClient(found)
            onClientSelect(found)
          }
        })
        .catch((e) => console.log('Error buscando cliente x defecto', e))
    },
    [onClientSelect],
  )

  useEffect(() => {
    if (value !== undefined) {
      setClient(value)
      if (value === null && autoSelectDefaultCode) {
        fetchDefaultClient(autoSelectDefaultCode)
      }
    }
  }, [value, autoSelectDefaultCode, fetchDefaultClient])

  useEffect(() => {
    if (autoSelectDefaultCode && !value && !client) {
      fetchDefaultClient(autoSelectDefaultCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDefaultClient])

  useEffect(() => {
    if (editable && client) {
      const newVal: ClientApiInputProps = {
        codigoTipoDocumentoIdentidad: Number(client.tipoDocumentoIdentidad?.codigoClasificador) || 1,
        nombres: client.nombres || '',
        apellidos: client.apellidos || '',
        razonSocial: client.razonSocial || '',
        numeroDocumento: client.numeroDocumento || '',
        complemento: client.complemento || '',
        email: client.email || '',
        telefono: client.telefono || '',
      }
      setEditableClient(newVal)
      if (onChangeEditable) onChangeEditable(newVal)
    } else {
      setEditableClient(null)
      if (onChangeEditable) onChangeEditable(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, editable])

  const handleEditableChange = (field: keyof ClientApiInputProps, fieldVal: any) => {
    if (!editableClient) return
    const next = { ...editableClient, [field]: fieldVal }
    setEditableClient(next)
    if (onChangeEditable) onChangeEditable(next)
  }

  const searchClient = async (value: string): Promise<ClientProps[]> => {
    try {
      if (value.length > 2) {
        const resp = await searchClientsApi(value)
        return resp.filter((client) =>
          withCreditLine ? client.lineaCredito : client.lineaCredito == null || !client.lineaCredito,
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
      <Grid container spacing={0.5} sx={{ mt: hideLabel ? 0 : 1, mb: 1 }}>
        <Grid size={10}>
          <FormControl fullWidth>
            {!hideLabel && <MyInputLabel shrink>Búsqueda de cliente</MyInputLabel>}
            <AsyncCreatableSelect<ClientProps>
              styles={{
                ...getSelectStyles(theme, false),
                control: (base: any, state: any) => {
                  const baseStyle = getSelectStyles(theme, false).control
                  return {
                    ...(baseStyle ? baseStyle(base, state) : base),
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? baseStyle
                          ? baseStyle(base, state).backgroundColor
                          : base.backgroundColor
                        : '#ECF3F9',
                  }
                },
              }}
              menuPosition={'fixed'}
              loadOptions={searchClient}
              isClearable={true}
              value={client}
              getOptionValue={(item) => item.codigoCliente}
              getOptionLabel={(item) =>
                item.codigoCliente === 'NUEVO'
                  ? `Nuevo Cliente: ${item.razonSocial || item.numeroDocumento}`
                  : `${item.codigoCliente} - ${item.razonSocial}
                            ${item.nombres || ''} ${item.apellidos || ''}`
              }
              onChange={(resp) => {
                if (resp) {
                  setClient(resp)
                  onClientSelect(resp)
                } else {
                  if (autoSelectDefaultCode) {
                    fetchDefaultClient(autoSelectDefaultCode)
                  } else {
                    setClient(null)
                    onClientSelect(null)
                  }
                }
              }}
              getNewOptionData={(inputValue) => {
                const isNumber = /^\d+$/.test(inputValue.trim())
                return {
                  _id: 'NEW',
                  codigoCliente: 'NUEVO',
                  razonSocial: isNumber ? '' : inputValue.trim(),
                  numeroDocumento: isNumber ? inputValue.trim() : '',
                  nombres: '',
                  apellidos: '',
                  tipoDocumentoIdentidad: {
                    codigoClasificador: 1,
                    descripcion: 'CI - CEDULA DE IDENTIDAD',
                  } as any,
                  email: '',
                  telefono: '',
                } as unknown as ClientProps
              }}
              formatCreateLabel={(inputValue) => `Añadir cliente: "${inputValue}"`}
              noOptionsMessage={({ inputValue }) =>
                inputValue
                  ? 'No se encontraron resultados'
                  : 'Ingrese referencia -> Razón social, código cliente, número de documento.'
              }
              loadingMessage={() => 'Buscando...'}
            />
          </FormControl>
        </Grid>

        <Grid size={2}>
          <ButtonGroup variant="text" aria-label="Opciones de cliente">
            <IconButton
              aria-label="busqueda-cliente"
              sx={{ p: 0.6 }}
              aria-hidden={false}
              onClick={() => {
                setOpenList(true)
                onListShowed(true)
              }}
            >
              <Tooltip title={'Explorar clientes'}>
                <ScreenSearchDesktop />
              </Tooltip>
            </IconButton>
            <IconButton
              aria-label="agregar-cliente"
              sx={{ p: 0.6 }}
              aria-hidden={false}
              onClick={() => {
                setOpenRegister(true)
              }}
            >
              <Tooltip title={'Registrar Nuevo Cliente'}>
                <PersonAddAlt1 />
              </Tooltip>
            </IconButton>
          </ButtonGroup>
        </Grid>
      </Grid>

      {/* Explorador de clientes en Modal */}
      <Dialog open={openList} onClose={() => setOpenList(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 1, minHeight: '65vh' }}>
          <SearcListClient
            onSelectedClient={(client) => {
              setClient(client)
              onClientSelect(client)
              setOpenList(false)
            }}
            withCreditLine={withCreditLine}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Nativo de Registro de Clientes */}
      <RegisterClientDialog
        id="modal-registro"
        open={openRegister}
        onClose={() => {
          setOpenRegister(false)
          // Si registró, idealmente podríamos cargar al último...
          // pero el user ya puede buscarlo en el selector.
        }}
      />

      {/* Formulario Editable Opcional (Simple) */}
      {editable && client && client.codigoCliente !== '00' && editableClient && (
        <Grid container spacing={2} sx={{ mt: 1, px: 0.5 }}>
          {/* Fila 2 (Debajo del select) */}
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Razón Social"
              value={editableClient.razonSocial}
              onChange={(e) => handleEditableChange('razonSocial', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Email"
              value={editableClient.email}
              onChange={(e) => handleEditableChange('email', e.target.value)}
            />
          </Grid>
          {/* Fila 3 Solo si hay licencia de whatsApp */}
          {lw?.activo && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Teléfono"
                value={editableClient.telefono}
                onChange={(e) => handleEditableChange('telefono', e.target.value)}
              />
            </Grid>
          )}
          {/* Fila 4 Solo si está creando un nuevo cliente */}
          {client.codigoCliente === 'NUEVO' && (
            <>
              <Grid size={{ xs: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Número Documento"
                  value={editableClient.numeroDocumento}
                  onChange={(e) => handleEditableChange('numeroDocumento', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Complemento"
                  value={editableClient.complemento}
                  onChange={(e) => handleEditableChange('complemento', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Tipo Documento"
                  value={editableClient.codigoTipoDocumentoIdentidad || 1}
                  onChange={(e) =>
                    handleEditableChange('codigoTipoDocumentoIdentidad', Number(e.target.value))
                  }
                >
                  {tiposDocumentoIdentidad?.map((t) => (
                    <MenuItem key={t.codigoClasificador} value={t.codigoClasificador}>
                      {t.descripcion}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}
        </Grid>
      )}
    </>
  )
}

export default InputSearchClient
