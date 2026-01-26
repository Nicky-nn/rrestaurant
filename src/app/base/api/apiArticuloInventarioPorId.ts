// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { EntidadInputProps } from '../../interfaces'
import { ArticuloProps } from '../../interfaces/articulo.ts'
import { articuloFragment } from '../fragments/articuloFragment.ts'
import { AccessToken } from '../models/paramsModel.ts'
import { MyGraphQlError } from '../services/GraphqlError.ts'

const query = gql`
  ${articuloFragment}
  query BUSQUEDA_POR_ID(
    $cds: Int!
    $entidad: EntidadParamsInput!
    $verificarPrecio: Boolean = false
    $verificarInventario: Boolean = false
    $id: ID!
  ) {
    articuloInventarioPorId(
      cds: $cds
      entidad: $entidad
      verificarPrecio: $verificarPrecio
      verificarInventario: $verificarInventario
      id: $id
    ) {
      ...ArticuloFields
    }
  }
`

/**
 * Busqueda de un determinado articulo por id
 * @author isi-template
 * @param args
 */
export const apiArticuloInventarioPorId = async (args: {
  entidad: EntidadInputProps
  verificarPrecio: boolean
  verificarInventario: boolean
  id: string
}): Promise<ArticuloProps> => {
  try {
    const { entidad, verificarInventario, verificarPrecio, id } = args
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)

    const cds = parseInt(import.meta.env.ISI_DOCUMENTO_SECTOR.toString(), 10)

    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(query, {
      cds,
      entidad,
      verificarPrecio,
      verificarInventario,
      id,
    })
    return data.articuloInventarioPorId
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
