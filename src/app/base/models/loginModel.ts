// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { PuntoVentaProps } from '../../interfaces/puntoVenta'
import { SinActividadesProps } from '../../interfaces/sin.interface'
import { SucursalProps } from '../../interfaces/sucursal'
import { MonedaParamsProps, TipoRepresentacionGrafica } from '../interfaces/base'
import { PerfilFragment } from '../interfaces/session'
import { MyGraphQlError } from '../services/GraphqlError'

/**
 * @author isi-template
 */
export interface PerfilProps {
  nombres: string
  apellidos: string
  avatar: string
  cargo: string
  ci: string
  correo: string
  rol: string
  sigla: string
  dominio: string[]
  tipo: 'SA' | 'ADMIN' | 'GUEST' | 'USER'
  vigente: string // SI, NO
  actividadEconomica: SinActividadesProps
  sucursal: SucursalProps
  puntoVenta: PuntoVentaProps
  moneda: MonedaParamsProps
  monedaTienda: MonedaParamsProps
  modificarMontos: boolean
  razonSocial: string
  miEmpresa: {
    tienda: string
    codigoModalidad: number
    codigoAmbiente: number
    razonSocial: string
    fechaValidezToken: string
    email: string
    emailFake: string
    denominacion: string
    nit: string
  }
  tipoRepresentacionGrafica: TipoRepresentacionGrafica
  usuario: string
  integracionSiat: boolean
}

/**
 * @author isi-template
 */
export interface UserProps {
  token: string
  refreshToken: string
  perfil: PerfilProps
}

const mutation = gql`
  ${PerfilFragment}
  mutation Login($shop: String!, $email: String!, $password: String!) {
    login(shop: $shop, email: $email, password: $password) {
      token
      refreshToken
      perfil {
        ...PerfilField
      }
    }
  }
`
/**
 * @description Login del usuario
 * @author isi-template
 * @param shop
 * @param email
 * @param password
 */
export const loginModel = async (
  shop: string,
  email: string,
  password: string,
): Promise<UserProps> => {
  try {
    const variables = { shop, email, password }
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    // Set a single header
    // client.setHeader('authorization', 'Bearer MY_TOKEN')
    const data: any = await client.request(mutation, variables)
    return data.login
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
