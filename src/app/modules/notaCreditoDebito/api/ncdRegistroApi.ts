import { gql, GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'
import { MyGraphQlError } from '../../../base/services/GraphqlError'
import { NcdProps } from '../interfaces/ncdInterface'

export interface NcdRegistroInputProps {
  facturaCuf: string
  emailCliente: string
  detalle: {
    itemFactura: number
    cantidad: number
  }[]
}

const apiMutation = gql`
  mutation REGISTRO($entidad: EntidadParamsInput, $input: RestNotaCreditoDebitoInput!) {
    restNotaCreditoDebitoRegistro(entidad: $entidad, input: $input) {
      cuf
      state
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
 * @description Registro de una nota de credito debito
 * @param inputProps
 * @param codigoSucursal
 * @param codigoPuntoVenta
 */
export const apiNcdRegistro = async (
  inputProps: NcdRegistroInputProps,
  codigoSucursal: number,
  codigoPuntoVenta: number,
): Promise<NcdProps> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL)
    const token = localStorage.getItem(AccessToken)
    // Set a single header
    client.setHeader('authorization', `Bearer ${token}`)

    const entidad = {
      codigoSucursal,
      codigoPuntoVenta,
    }

    const data: any = await client.request(apiMutation, { entidad, input: inputProps })
    return data.restNotaCreditoDebitoRegistro
  } catch (e: any) {
    throw new MyGraphQlError(e)
  }
}
