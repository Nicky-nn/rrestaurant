import { Print } from '@mui/icons-material'
import { Alert, AlertTitle, Button, Link, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import { useQuery } from '@tanstack/react-query'
import { FunctionComponent, useEffect, useState } from 'react'
import { createFilter } from 'react-select'

import { apiListarImpresoras } from '../../../base/api/apiImpresoras'
import FormSelect from '../../../base/components/Form/FormSelect'
import SimpleCard from '../../../base/components/Template/Cards/SimpleCard'
import useAuth from '../../../base/hooks/useAuth'
import {
  decodePrintParams,
  deleteNamePrinter,
  getNamePrinter,
  setNamePrinter,
} from '../../../utils/licenciaHelper'
import { notSuccess } from '../../../utils/notification'
import { swalClose, swalLoading } from '../../../utils/swal'

interface OwnProps {}

type Props = OwnProps

/**
 * Componente que nos ayuda a la configuración de la impresoras
 * @author isi-template
 * @param props
 * @constructor
 */
const ConfiguracionImpresoras: FunctionComponent<Props> = (props) => {
  const [impresora, setImpresora] = useState<{ name: string } | null>(null)
  const [nombrePrinter, setNombrePrinter] = useState<string | null>(getNamePrinter())

  const { li } = useAuth()

  const {
    data: impresoras,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['impresoras'],
    queryFn: async () => {
      const params = decodePrintParams(li.licencia.parametros)
      const resp = await apiListarImpresoras(params.host)
      swalClose()
      return resp
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    refetchOnReconnect: false,
    retry: 1,
  })

  useEffect(() => {
    const name = getNamePrinter()
    if (name) {
      setImpresora({ name })
      setNombrePrinter(name)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      swalClose()
    }
  }, [isLoading])

  if (!li.activo) {
    return (
      <>
        <SimpleCard title={'Configuración de impresora'}>
          <Alert severity="warning">
            <AlertTitle>No cuenta con una licencia de impresión activa</AlertTitle>
            <ul>
              <li>
                Para poder usar las funciones de impresion automática, debe solicitar licencia con su
                proveedor de sistema.
              </li>
            </ul>
          </Alert>
        </SimpleCard>
      </>
    )
  }

  return (
    <>
      <SimpleCard title={'Configuración de impresora'}>
        {error && (
          <Alert severity={'error'} sx={{ mb: 2 }}>
            {error.message}
            <ul>
              <li>
                Verifique que la aplicación{' '}
                <Link href={'https://github.com/integrate-bolivia/isi-imp/releases'} target={'_blank'}>
                  Isi-Print
                </Link>{' '}
                este correctamente instalado y en ejecución.
              </li>
            </ul>
          </Alert>
        )}
        <Typography sx={{ display: 'flex', mb: 2 }}>
          <Print color="primary" sx={{ mr: 1 }} />
          <strong>IMPRESORAS</strong>
        </Typography>

        {nombrePrinter && (
          <>
            <Alert severity={'info'} sx={{ mb: 2 }}>
              <Typography gutterBottom>
                Actualmente las impresiones están asociadas a la impresora <strong>{nombrePrinter}</strong>
              </Typography>
              <Button
                variant={'text'}
                size={'small'}
                sx={{ ml: -0.5 }}
                onClick={() => {
                  deleteNamePrinter()
                  setImpresora(null)
                  setNombrePrinter(null)
                }}
              >
                Eliminar Asociación
              </Button>
            </Alert>
          </>
        )}

        <FormSelect<{ name: string }>
          options={impresoras || []}
          value={impresora}
          isSearchable={true}
          getOptionLabel={(value) => `${value.name}`}
          filterOption={createFilter({ ignoreAccents: false })}
          getOptionValue={(value) => value.name}
          isDisabled={impresoras?.length == 0}
          isLoading={isLoading}
          onChange={(value) => {
            if (value) setImpresora(value)
          }}
        />

        <Grid container sx={{ mt: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button
            loading={isLoading}
            sx={{ mr: 0.5 }}
            onClick={async () => {
              swalLoading()
              await refetch()
            }}
          >
            Escanear impresoras
          </Button>

          <Button
            variant="contained"
            sx={{ ml: 0.5 }}
            disabled={impresora == null}
            onClick={() => {
              if (impresora) {
                setNombrePrinter(impresora?.name)
                setNamePrinter(impresora?.name)
                notSuccess(`Se estableció ${impresora.name} como impresora por defecto.`)
              }
            }}
          >
            Guardar impresora
          </Button>
        </Grid>
      </SimpleCard>
    </>
  )
}

export default ConfiguracionImpresoras
