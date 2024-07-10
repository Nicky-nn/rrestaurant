// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { PuntoVentaProps } from '../../interfaces/puntoVenta'
import { SinActividadesProps } from '../../interfaces/sin.interface'
import { SucursalProps } from '../../interfaces/sucursal'
import { MonedaParamsProps, TipoRepresentacionGrafica } from '../interfaces/base'
import { MyGraphQlError } from '../services/GraphqlError'

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
  usuario: string
  tipo: 'SA' | 'ADMIN' | 'GUEST' | 'USER'
  vigente: string
  tipoRepresentacionGrafica: TipoRepresentacionGrafica
  sucursal: SucursalProps
  puntoVenta: PuntoVentaProps
  actividadEconomica: SinActividadesProps
  moneda: MonedaParamsProps
  monedaTienda: MonedaParamsProps
  razonSocial: string
  miEmpresa: {
    razonSocial: string
    codigoModalidad: number
    codigoAmbiente: number
    fechaValidezToken: string
    tienda: string
    email: string
    emailFake: string
  }
}

export interface UserProps {
  token: string
  refreshToken: string
  perfil: PerfilProps
}

const mutation = gql`
  mutation Login($shop: String!, $email: String!, $password: String!) {
    login(shop: $shop, email: $email, password: $password) {
      token
      refreshToken
      perfil {
        miEmpresa {
          tienda
          razonSocial
          codigoModalidad
          codigoAmbiente
          fechaValidezToken
          email
          emailFake
        }
        usuario
        razonSocial
        nombres
        apellidos
        avatar
        cargo
        ci
        correo
        rol
        sigla
        dominio
        tipo
        vigente
        tipoRepresentacionGrafica
        sucursal {
          codigo
          direccion
          telefono
          departamento {
            codigo
            codigoPais
            sigla
            departamento
          }
          direccion
        }
        puntoVenta {
          codigo
          descripcion
          nombre
          tipoPuntoVenta {
            codigoClasificador
            descripcion
          }
        }
        actividadEconomica {
          codigoCaeb
          descripcion
          tipoActividad
        }
        moneda {
          codigo
          descripcion
          sigla
        }
        monedaTienda {
          codigo
          descripcion
          sigla
        }
      }
    }
  }
`
/**
 * @description Login del usuario
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
