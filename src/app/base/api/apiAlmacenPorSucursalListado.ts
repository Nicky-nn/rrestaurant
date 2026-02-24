// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AlmacenProps } from '../../interfaces/almacen.ts'
import { almacenFragment } from '../fragments/almacenFragment.ts'
import { facturaSucursalFragment } from '../fragments/sucursalFragment.ts'
import { AccessToken } from '../models/paramsModel.ts'
import { MyGraphQlError } from '../services/GraphqlError.ts'

const gqlQuery = gql`
  ${facturaSucursalFragment}
  ${almacenFragment}
  query ALMACEN_POR_SUCURSAL($codigoSucursal: Int!) {
    almacenPorSucursalListado(codigoSucursal: $codigoSucursal) {
      ...almacenFields
    }
  }
`

/**
 * Obtiene la lista de almacenes por sucursal
 * @author isi-template
 * @param codigoSucursal
 */
export const apiAlmacenPorSucursalListado = async (codigoSucursal: number): Promise<AlmacenProps[]> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    client.setHeader('authorization', `Bearer ${token}`)
    const data: any = await client.request(gqlQuery, { codigoSucursal })
    return data.almacenPorSucursalListado
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
