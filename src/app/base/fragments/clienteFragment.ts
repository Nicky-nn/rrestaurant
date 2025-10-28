// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de cliente operación
 * @author isi-template
 */
export const clienteOperacionFragment = gql`
  fragment clienteOperacionFields on ClienteOperacion {
    apellidos
    codigoCliente
    complemento
    creditoMaximo
    creditoMinimo
    direccion
    direccionLaboral
    email
    entidadLaboral
    lineaCredito
    maximoPlazo
    nombres
    numeroDocumento
    razonSocial
    telefono
    tipoDocumentoIdentidad {
      codigoClasificador
      descripcion
    }
  }
`
