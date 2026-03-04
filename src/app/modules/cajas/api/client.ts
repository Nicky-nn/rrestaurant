// src/api/graphql/client.ts
import { GraphQLClient } from 'graphql-request'

import { AccessToken } from '../../../base/models/paramsModel'

export const getClient = (tokenOverride?: string) => {
  const url = import.meta.env.ISI_API_URL
  const client = new GraphQLClient(url)
  const token = tokenOverride ?? localStorage.getItem(AccessToken) ?? ''
  if (token) client.setHeader('authorization', `Bearer ${token}`)
  return client
}
