// =======================================
// Query para arqueo activo de usuario
// =======================================

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { AperturaCajaActivo } from '../interfaces/arqueoCaja'
import { getClient } from './client'

const APERTURA_CAJA_ACTIVO = gql`
  query APERTURA_CAJA_ACTIVO(
    $usuario: String!
    $codigoSucursal: Int = 0
    $codigoPuntoVenta: Int = 0
    $modulo: String = "REST"
  ) {
    aperturaCajaActivo(
      usuario: $usuario
      input: { codigoPuntoVenta: $codigoPuntoVenta, codigoSucursal: $codigoSucursal, modulo: $modulo }
    ) {
      _id
      cajaId
      cajaCodigo
      modulo
      representacionGrafica {
        rollo
      }
      state
      supervisor
      turnoCaja {
        _id
        nombre
        horaInicio
        horaCierre
      }
      moneda {
        codigo
        sigla
        descripcion
      }
      usuario
      usuariosCaja
      usuarioApertura
      responsables
    }
  }
`

/**
 * Verifica si la funcionalidad de cajas está activa en el sistema.
 */
export const apiActivarCajas = async (): Promise<boolean> => {
  const query = gql`
    query ACTIVAR_CAJAS {
      activarCajas
    }
  `
  try {
    const client = getClient()
    const data: any = await client.request(query)
    return data.activarCajas
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}

// =======================================
// Query para arqueo activo de usuario
// =======================================

export const obtenerArqueoActivo = async (
  usuario: string,
  codigoSucursal: number = 0,
  codigoPuntoVenta: number = 0,
): Promise<AperturaCajaActivo | null> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)

    const variables = { usuario, codigoSucursal, codigoPuntoVenta }
    const data: any = await client.request(APERTURA_CAJA_ACTIVO, variables)

    return data.aperturaCajaActivo ?? null
  } catch (error: any) {
    console.error('Error al obtener arqueo activo:', error)
    throw new MyGraphQlError(error)
  }
}
