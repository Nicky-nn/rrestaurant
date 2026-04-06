// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento que nos permite tipar las propiedades de pagina, usado generalmente en listados paginados
 * @author isi-template
 */
export const pageInfoFragment = gql`
  fragment pageInfoFields on PageInfo {
    hasNextPage
    hasPrevPage
    totalDocs
    limit
    page
    totalPages
  }
`
