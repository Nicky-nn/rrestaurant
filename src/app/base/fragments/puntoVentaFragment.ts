// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de factura punto de venta
 * @author isi-template
 */
export const facturaPuntoVentaFragment = gql`
  fragment facturaPuntoVentaFields on OrgFacturaPuntoVenta {
    codigo
    descripcion
    nombre
    tipoPuntoVenta {
      codigoClasificador
      descripcion
    }
  }
`

/**
 * Fragmento de campos de punto de venta
 * @author isi-template
 */
export const puntoVentaFrament = gql`
  fragment puntoVentaFragment on PuntoVenta {
    codigo
    descripcion
    nombre
    tipoPuntoVenta {
      codigoClasificador
      descripcion
    }
  }
`
