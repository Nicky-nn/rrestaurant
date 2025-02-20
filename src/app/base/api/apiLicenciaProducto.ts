// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { LicenciaProductoProps } from '../interfaces/licenciaProducto'

const query = gql`
  query LICENCIA_PRODUCTOS {
    licenciaProductoListado {
      _id
      tipoProducto
      maximoConexiones
      fechaVencimiento
      delegado
      configuracion
      state
    }
  }
`

interface ApiLicenciaProducto {
  lw: {
    activo: boolean
    licencia: LicenciaProductoProps
  }
  li: {
    activo: boolean
    licencia: LicenciaProductoProps
  }
}

/**
 * Listamos las licencias de productos
 * @param token
 */
export const apiLicenciaProducto = async (
  token: string,
): Promise<ApiLicenciaProducto> => {
  let lw = { activo: false, licencia: {} as LicenciaProductoProps }
  let li = { activo: false, licencia: {} as LicenciaProductoProps }
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query)
    const nData: LicenciaProductoProps[] = data.licenciaProductoListado
    const liw = nData.find((l) => l.tipoProducto === 'WHATSAPP')
    const lii = nData.find((l) => l.tipoProducto === 'IMPRESION')

    if (liw) {
      if (liw.state === 'ACTIVADO') {
        lw = {
          activo: true,
          licencia: liw,
        }
      } else {
        li = {
          activo: false,
          licencia: liw,
        }
      }
    }
    if (lii) {
      if (lii.state === 'ACTIVADO') {
        li = {
          activo: true,
          licencia: lii,
        }
      } else {
        li = {
          activo: false,
          licencia: lii,
        }
      }
    }
    return { lw, li }
  } catch (e: any) {
    return { lw, li }
  }
}
