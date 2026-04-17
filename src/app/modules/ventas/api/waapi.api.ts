import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'

export interface Waapi {
  _id: string
  codigoSucursal: number
  codigoPuntoVenta: number
  mensaje: string
  mediaName: string
  mediaUrl: string
  codigoArea: string
  telefono: string
  glosa: string
  waapiStatus: string
  state: string
  usucre: string
  usumod: string
  createdAt: string
  updatedAt: string
}

// Fragmento único
const fieldsFragment = gql`
  fragment FIELDS on Waapi {
    _id
    codigoSucursal
    codigoPuntoVenta
    mensaje
    mediaName
    mediaUrl
    codigoArea
    telefono
    glosa
    waapiStatus
    state
    usucre
    usumod
    createdAt
    updatedAt
  }
`

// Consultas y mutaciones
const listadoWaapiQuery = gql`
  query LISTADO($limit: Int!) {
    waapiListado(limit: $limit) {
      docs {
        ...FIELDS
      }
    }
  }
  ${fieldsFragment}
`

const enviarArchivoMutation = gql`
  mutation ENVIAR_ARCHIVO($entidad: EntidadParamsInput!, $input: WaapiEnviarUrlInput!) {
    waapiEnviarUrl(entidad: $entidad, input: $input) {
      ...FIELDS
    }
  }
  ${fieldsFragment}
`

/**
 * @description Listado completo de Waapi con límite
 * @param limit Número máximo de resultados a obtener
 */
export const apiListadoWaapi = async (limit: number): Promise<Waapi[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(listadoWaapiQuery, { limit })
    return data.waapiListado.docs
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}

/**
 * @description Enviar archivo a través de Waapi
 * @param params Parámetros necesarios para enviar el archivo
 */
export const apiEnviarArchivo = async (params: {
  entidad: {
    codigoSucursal: number
    codigoPuntoVenta: number
  }
  input: {
    codigoArea: string
    mensaje: string
    nombre: string
    telefono: string
    url: string
  }
}): Promise<Waapi> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(enviarArchivoMutation, params)
    return data.waapiEnviarUrl
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
