import { gql, GraphQLClient } from 'graphql-request'
import { PageInfoProps, PageInputProps } from '../../../interfaces'
import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { UsuarioCajaProp } from '../interfaces/envioArqueoCaja'

const query = gql`
  query USUARIOS($limit: Int!, $reverse: Boolean, $page: Int!, $query: String) {
    usuarios(limit: $limit, reverse: $reverse, page: $page, query: $query) {
      docs {
        cargo
        vigente
        restriccionActivo {
          codigoSucursal
          codigoPuntoVenta
        }
        correo
        telefono
        usuario
        usucre
        usumod
        createdAt
        updatedAt
      }
      pageInfo {
        hasNextPage
        hasPrevPage
        totalDocs
        limit
        page
        totalPages
      }
    }
  }
`

interface apiUsuariosResponse {
  docs: UsuarioCajaProp[]
  pageInfo: PageInfoProps
}

export const apiUsuariosListado = async (
  pageInfo: PageInputProps,
): Promise<apiUsuariosResponse> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    //Set a single header
    client.setHeader('Authorization', `Bearer ${token}`)
    const data: any = await client.request(query, { ...pageInfo })
    return data.usuarios
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
