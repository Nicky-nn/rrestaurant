// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Trazabilidad o auditoria del usuario
 * @author isi-template
 */
export const workflowFragment = gql`
  fragment workflowFields on Workflow {
    estadoAnterior
    estadoNuevo
    usuario
    fecha
    comentario
  }
`
