// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * Fragmento de imagenes de cloud
 * @author isi-template
 */
export const imagenCloudFragment = gql`
  fragment imagenCloudFields on ImagenCloud {
    filename
    id
    variants {
      medium
      public
      square
      thumbnail
    }
  }
`
