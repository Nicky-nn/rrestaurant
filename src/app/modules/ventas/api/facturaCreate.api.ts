// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { ClasificadorProps } from '../../../interfaces'
import { SinActividadesProps } from '../../sin/interfaces/sin.interface'

export interface FacturaProps {
  sinTipoMetodoPago: ClasificadorProps[]
  sinUnidadMedida: ClasificadorProps[]
  sinActividades: SinActividadesProps[]
}

export const FCV_ONLINE = gql`
  mutation FCV_ONLINE($input: FacturaCompraVentaInput!) {
    facturaCompraVentaCreate(input: $input) {
      _id
      state
      numeroFactura
      representacionGrafica {
        pdf
        rollo
        xml
        sin
      }
    }
  }
`
/**
 * @description Registro de una factura a travéz de los servicios isipass
 * @param input
 */
export const fetchFacturaCreate = async (input: any): Promise<FacturaProps> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const data: any = await client.request(FCV_ONLINE, { input })
    return data.facturaCompraVentaCreate
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
