import { Home } from '@mui/icons-material'
import React, { FunctionComponent } from 'react'

import SimpleCard from '../../../../../base/components/Template/Cards/SimpleCard'
import { H4 } from '../../../../../base/components/Template/Typography'
import useAuth from '../../../../../base/hooks/useAuth'

interface OwnProps {}

type Props = OwnProps

/**
 * @author isi-template
 * @param props
 * @constructor
 */
const CuentaSucursal: FunctionComponent<Props> = (props) => {
  const { user } = useAuth()
  return (
    <>
      <SimpleCard
        title={'SUCURSAL / PUNTO VENTA / ACTIVIDAD ECONÓMICA'}
        childIcon={<Home />}
      >
        <div className="responsive-table" style={{ marginBottom: 25 }}>
          <H4>SUCURSAL</H4>
          <table>
            <thead>
              <tr>
                <th style={{ width: 150 }}>CÓDIGO</th>
                <th>DIRECCIÓN</th>
                <th>TELEFONO</th>
                <th>DEPARTAMENTO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label={'CÓDIGO'}>{user.sucursal.codigo}</td>
                <td data-label={'DIRECCIÓN'}>{user.sucursal.direccion}</td>
                <td data-label={'TELEFONO'}>{user.sucursal.telefono}</td>
                <td data-label={'DEPARTAMENTO'}>
                  {user.sucursal.departamento.departamento}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="responsive-table" style={{ marginBottom: 25 }}>
          <H4>PUNTO VENTA</H4>
          <table>
            <thead>
              <tr>
                <th style={{ width: 150 }}>CÓDIGO</th>
                <th>NOMBRE</th>
                <th>TIPO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label={'CÓDIGO'}>{user.puntoVenta.codigo}</td>
                <td data-label={'NOMBRE'}>{user.puntoVenta.nombre}</td>
                <td data-label={'TIPO'}>{user.puntoVenta.tipoPuntoVenta.descripcion}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="responsive-table" style={{ marginBottom: 25 }}>
          <H4>ACTIVIDAD ECONÓMICA</H4>
          <table>
            <thead>
              <tr>
                <th style={{ width: 150 }}>CÓDIGO CAEB</th>
                <th>DESCRIPCIÓN</th>
                <th>TIPO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label={'CÓDIGO CAEB'}>{user.actividadEconomica.codigoCaeb}</td>
                <td data-label={'DESCRIPCIÓN'}>{user.actividadEconomica.descripcion}</td>
                <td data-label={'TIPO'}>{user.actividadEconomica.tipoActividad}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SimpleCard>
    </>
  )
}

export default CuentaSucursal
