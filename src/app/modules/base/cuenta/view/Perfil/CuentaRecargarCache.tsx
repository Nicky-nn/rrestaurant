import { Person } from '@mui/icons-material'
import { Button, Grid } from '@mui/material'
import React, { FunctionComponent } from 'react'

import SimpleCard from '../../../../../base/components/Template/Cards/SimpleCard'
import { H4 } from '../../../../../base/components/Template/Typography'
import { notSuccess } from '../../../../../utils/notification'
import { swalAsyncConfirmDialog, swalException } from '../../../../../utils/swal'
import { apiUsuarioVaciarCache } from '../../api/usuarioVaciarCache.api'

interface OwnProps {}

type Props = OwnProps

/**
 * @author isi-template
 * @param props
 * @constructor
 */
const CuentaRecargarCache: FunctionComponent<Props> = (props) => {
  const handleVaciarCache = async () => {
    await swalAsyncConfirmDialog({
      preConfirm: async () => {
        return apiUsuarioVaciarCache().catch((err) => {
          swalException(err)
          return false
        })
      },
    }).then((resp) => {
      if (resp.isConfirmed) {
        notSuccess('Recarga de cache exitosa')
      }
    })
  }
  return (
    <>
      <SimpleCard title={'RECARGAR CACHE'} childIcon={<Person />}>
        <Grid container spacing={2}>
          <Grid
            size={{
              lg: 12,
              md: 12,
              xs: 12,
            }}
          >
            <H4>Ventajas de realizar este proceso</H4>
            <ol>
              <li>Eliminar datos temporales que consumen espacio en memoria</li>
              <li>Mejorar el rendimiento de consultas y envio de datos</li>
              <li>Ejecutar la acción no hará que pierda la sesión</li>
            </ol>
          </Grid>
          <Grid
            size={{
              lg: 12,
              md: 12,
              xs: 12,
            }}
          >
            <Button variant={'contained'} onClick={handleVaciarCache}>
              EJECUTAR SERVICIO
            </Button>
          </Grid>
        </Grid>
      </SimpleCard>
    </>
  )
}

export default CuentaRecargarCache
