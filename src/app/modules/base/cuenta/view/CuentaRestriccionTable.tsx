import { Storefront } from '@mui/icons-material'
import {
  Alert,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent } from 'react'

import AlertError from '../../../../base/components/Alert/AlertError'
import AlertLoading from '../../../../base/components/Alert/AlertLoading'
import useAuth from '../../../../base/hooks/useAuth'
import { notSuccess } from '../../../../utils/notification'
import { swalAsyncConfirmDialog, swalException } from '../../../../utils/swal'
import { apiUsuarioRestriccion } from '../api/usuarioRestriccion.api'
import { apiUsuarioActualizarRestriccion } from '../api/usuarioRestriccionActualizar.api'
import { UsuarioSucursalRestriccionProps } from '../interfaces/restriccion.interface'

interface OwnProps {}

type Props = OwnProps

/**
 * @description Formulario para cambiar de sucursal y punto de venta activo, una vez realizado el click
 * el sistema se reinicia, cargando el nuevo perfilProps
 * @author isi-template
 * @param props
 * @constructor
 */
const CuentaRestriccionTable: FunctionComponent<Props> = (props) => {
  const { user } = useAuth()
  const {
    data: restriccion,
    isError,
    error,
    isLoading,
  } = useQuery<UsuarioSucursalRestriccionProps[]>({
    queryKey: ['restriccionUsuario'],
    queryFn: async () => {
      const resp = await apiUsuarioRestriccion()
      return resp.sucursales
    },
    refetchInterval: false,
  })

  const changePuntoVenta = async (codigoSucursal: number, codigoPuntoVenta: number) => {
    await swalAsyncConfirmDialog({
      text: `¿Cambiar a la Sucursal <strong>${codigoSucursal}</strong> / Punto Venta <strong>${codigoPuntoVenta}</strong>?`,
      preConfirm: async () => {
        return apiUsuarioActualizarRestriccion({
          codigoSucursal,
          codigoPuntoVenta,
        }).catch((err) => {
          swalException(err)
          return false
        })
      },
    }).then((resp) => {
      if (resp.isConfirmed) {
        notSuccess()
        setTimeout(() => {
          window.location.reload()
        }, 1)
      }
    })
  }

  if (isLoading) return <AlertLoading />

  if (isError) return <AlertError mensaje={error && error.message} />

  return (
    <>
      {restriccion &&
        restriccion!.map((res) => (
          <React.Fragment key={res.codigo}>
            <Alert color={'info'}>
              <Typography>
                <strong>SUCURSAL {res.codigo}</strong> / {res.departamento.departamento} -{' '}
                {res.municipio} / {res.direccion} / {res.telefono}
              </Typography>
            </Alert>
            <Divider />

            <MenuList>
              {res.puntosVenta.length > 0 ? (
                res.puntosVenta.map(
                  (pv) =>
                    !(
                      user.sucursal.codigo === res.codigo &&
                      user.puntoVenta.codigo === pv.codigo
                    ) && (
                      <MenuItem
                        key={pv.codigo}
                        onClick={() => changePuntoVenta(res.codigo, pv.codigo)}
                      >
                        <ListItemIcon>
                          <Storefront fontSize="small" color={'info'} />
                        </ListItemIcon>
                        <ListItemText>
                          <strong>Suc. {res.codigo}</strong> /{' '}
                          <strong>PUNTO VENTA {pv.codigo}</strong> / {pv.nombre} /{' '}
                          {pv.tipoPuntoVenta.descripcion}
                        </ListItemText>
                      </MenuItem>
                    ),
                )
              ) : (
                <Alert title={'Ya se encuentra en el punto de venta activo'} />
              )}
            </MenuList>
          </React.Fragment>
        ))}
    </>
  )
}

export default CuentaRestriccionTable
