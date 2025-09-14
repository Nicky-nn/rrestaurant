// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

const apiQuery = gql`
  query VERIFICAR_DOMINIO($codigo: Int!) {
    verificarDominio(codigo: $codigo)
  }
`

/**
 * @description Verifica si un usuario cuenta con permisos para acceder al sistema. El código que se envia es el codigoDocumento sector
 * @author isi-template
 * @param token
 */
export const apiValidarUsuario = async (token: string): Promise<boolean> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const codigo = parseInt(import.meta.env.ISI_DOCUMENTO_SECTOR.toString(), 10)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)
    const data: any = await client.request(apiQuery, {
      codigo,
    })
    return data.verificarDominio || false
  } catch (e: any) {
    return false
  }
}
