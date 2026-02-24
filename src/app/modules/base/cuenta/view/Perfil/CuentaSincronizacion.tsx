import { Person } from '@mui/icons-material'
import { Button, Grid } from '@mui/material'
import React, { FunctionComponent } from 'react'

import SimpleCard from '../../../../../base/components/Template/Cards/SimpleCard'
import { H4 } from '../../../../../base/components/Template/Typography'
import { notSuccess } from '../../../../../utils/notification'
import { swalAsyncConfirmDialog, swalException } from '../../../../../utils/swal'
import { apiSincronizarCatalogos } from '../../api/sincronizarCatalogos.api'
import { apiSincronizarCufd } from '../../api/sincronizarCufd.api'

interface OwnProps {}

type Props = OwnProps

/**
 * @author isi-template
 * @param props
 * @constructor
 */
const CuentaSincronizacion: FunctionComponent<Props> = (props) => {
  const fetchSincronizarCatalogos = async () => {
    await swalAsyncConfirmDialog({
      text: 'Confirma que desea realizar la acción, este proceso podria demorar varios minutos',
      preConfirm: async () => {
        return apiSincronizarCatalogos().catch((err) => {
          swalException(err)
          return false
        })
      },
    }).then((resp) => {
      if (resp.isConfirmed) {
        notSuccess('Sincronización realizada correctamente')
      }
    })
  }

  const fetchSincronizarCufd = async () => {
    await swalAsyncConfirmDialog({
      preConfirm: () => {
        return apiSincronizarCufd().catch((err) => {
          swalException(err)
          return false
        })
      },
    }).then((resp) => {
      if (resp.isConfirmed) {
        notSuccess('CUFD se ha sincronizado correctamente')
      }
    })
  }

  return (
    <>
      <SimpleCard title={'SINCRONIZACIÓN DE DATOS'} childIcon={<Person />}>
        <Grid container spacing={2}>
          <Grid
            size={{
              lg: 12,
              md: 12,
              xs: 12,
            }}
          >
            <H4>Sincronización de CÓDIGO ÚNICO DE FACTURACION DIARIA (CUFD)</H4>
            <ol>
              <li>Nos permite poder emitir documentos fiscales durante el día</li>
            </ol>
          </Grid>
          <Grid
            size={{
              lg: 12,
              md: 12,
              xs: 12,
            }}
          >
            <Button variant={'contained'} size={'small'} onClick={fetchSincronizarCufd}>
              EJECUTAR SERVICIO CUFD
            </Button>
          </Grid>

          <Grid
            size={{
              lg: 12,
              md: 12,
              xs: 12,
            }}
          >
            <H4>Sincronización de CATÁLOGOS</H4>
            <ol>
              <li>Sincroniza todos los catalogos y clasificadores del sin.</li>
              <li>
                Este proceso puede demorar varios minutos dependiente de la conexion de internet y la
                diponibilidad de IMPUESTOS NACIONALES.
              </li>
              <li>
                Sincronización de: metodos pago, actividades, tipo punto venta, tipo Emision, producto
                servicio, tipo moneda, actividades por documento sector, tipo de factura, tipo documento
                identidad, motivo anulación, pais.
              </li>
            </ol>
          </Grid>
          <Grid
            size={{
              lg: 12,
              md: 12,
              xs: 12,
            }}
          >
            <Button variant={'contained'} size={'small'} onClick={fetchSincronizarCatalogos}>
              EJECUTAR SERVICIO CATÁLOGOS
            </Button>
          </Grid>
        </Grid>
      </SimpleCard>
    </>
  )
}

export default CuentaSincronizacion
