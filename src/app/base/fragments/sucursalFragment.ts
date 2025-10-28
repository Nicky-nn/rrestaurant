// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de sucursal factura
 * @author isi-template
 */
export const facturaSucursalFragment = gql`
  fragment facturaSucursalFields on OrgFacturaSucursal {
    codigo
    direccion
    municipio
    telefono
  }
`

/**
 * Fragmento de campos de sucursal
 * @author isi-template
 */
export const sucursalFragment = gql`
  fragment sucursalFields on Sucursal {
    codigo
    direccion
    integracionSiat
    municipio
    departamento {
      codigo
      codigoPais
      departamento
      sigla
    }
    telefono
  }
`
