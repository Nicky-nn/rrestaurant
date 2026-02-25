import { gql } from 'graphql-request'

export const CLIENT_FIELDS_FRAGMENT = gql`
  fragment clientFields on Cliente {
    _id
    apellidos
    codigoCliente
    complemento
    email
    nombres
    numeroDocumento
    razonSocial
    codigoExcepcion
    tipoDocumentoIdentidad {
      codigoClasificador
      descripcion
    }
    telefono
    state
    lineaCredito
    creditoMaximo
    creditoMinimo
    direccion
    direccionLaboral
    entidadLaboral
    maximoPlazo
    usucre
    createdAt
    usumod
    UpdatedAt
  }
`
