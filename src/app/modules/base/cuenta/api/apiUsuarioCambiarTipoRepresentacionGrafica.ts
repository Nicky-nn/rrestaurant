// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../../base/services/GraphqlError'

const gqlQuery = gql`
  mutation CAMBIAR_TIPO_FACTURACION($tipoRepresentacionGrafica: String!) {
    usuarioCambiarTipoRepresentacionGrafica(
      tipoRepresentacionGrafica: $tipoRepresentacionGrafica
    )
  }
`

interface Props {
  tipoRepresentacionGrafica: string
}

/**
 * @description cambiamos el tipo de representación gráfica
 * @author isi-template
 * @param props
 */
export const apiUsuarioCambiarTipoRepresentacionGrafica = async (
  props: Props,
): Promise<boolean> => {
  try {
    const { tipoRepresentacionGrafica } = props
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(gqlQuery, {
      tipoRepresentacionGrafica,
    })
    return data.usuarioCambiarTipoRepresentacionGrafica
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
