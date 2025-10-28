// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de campos de kardex periodo
 * @author isi-template
 */
export const kardexPeriodoFragment = gql`
  fragment kardexPeriodoFields on KardexPeriodo {
    codigo
    descripcion
    # documentoSector: SinTipoDocumentoSector
    state
  }
`
