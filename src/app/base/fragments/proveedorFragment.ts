// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos para los proveedores
 * @author isi-template
 */
export const proveedorFragment = gql`
  fragment proveedorFields on Proveedor {
    _id
    ciudad
    codigo
    contacto
    correo
    direccion
    nombre
    notas
    telefono
    state
  }
`
