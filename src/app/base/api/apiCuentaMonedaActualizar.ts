// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { MonedaParamsProps } from '../interfaces/base'
import { AccessToken } from '../models/paramsModel'
import { MyGraphQlError } from '../services/GraphqlError'

const queryGql = gql`
  mutation CAMBIAR_MONEDA_SISTEMA($codigoMoneda: Int!) {
    cuentaCambiarMoneda(codigoMoneda: $codigoMoneda) {
      codigo
      sigla
      descripcion
    }
  }
`

/**
 * @description Listado de monedas
 */
export const apiCuentaMonedaActualizar = async (props: {
  codigoMoneda: number
}): Promise<MonedaParamsProps> => {
  try {
    const { codigoMoneda } = props
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(queryGql, { codigoMoneda })
    return data.cuentaCambiarMoneda
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
