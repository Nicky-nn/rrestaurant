import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import useAuth from '../../../base/hooks/useAuth'
import { getInboxClient } from '../api/inboxClient'

export interface RepartidorDTO {
  id: string
  email: string
  vehiculo: string
  status: string
  esConfiable: boolean
  createdAt: string
  updatedAt: string
}

export const useRepartidoresQuery = (page: number = 1, limit: number = 100) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Queries
  const listRepartidoresQuery = useQuery({
    queryKey: ['listRepartidores', user?.miEmpresa, page, limit],
    queryFn: async () => {
      const shop = typeof user?.miEmpresa === 'string' ? user.miEmpresa : user?.miEmpresa?.tienda || 'sandbox'
      const client = getInboxClient()

      const q = gql`
        query ListRepartidores($shop: String!, $page: Int, $limit: Int) {
          listRepartidores(shop: $shop, page: $page, limit: $limit) {
            repartidores {
              id
              email
              vehiculo
              status
              esConfiable
              createdAt
              updatedAt
            }
            totalCount
            totalPages
            currentPage
          }
        }
      `
      interface ListRepartidoresResponse {
        listRepartidores: {
          repartidores: RepartidorDTO[];
          totalCount: number;
          totalPages: number;
          currentPage: number;
        }
      }
      const data = await client.request<ListRepartidoresResponse>(q, { shop, page, limit })
      return data.listRepartidores
    },
    enabled: !!user,
  })

  // Mutations
  const createRepartidorMutation = useMutation({
    mutationFn: async (input: { email: string; vehiculo: string; esConfiable: boolean }) => {
      const shop = typeof user?.miEmpresa === 'string' ? user.miEmpresa : user?.miEmpresa?.tienda || 'sandbox'
      const client = getInboxClient()

      const m = gql`
        mutation CreateRepartidor($shop: String!, $input: CreateRepartidorInput!) {
          createRepartidor(shop: $shop, input: $input) {
            id
            email
          }
        }
      `
      const data = await client.request<{ createRepartidor: { id: string; email: string } }>(m, { shop, input })
      return data.createRepartidor
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listRepartidores'] })
    },
  })

  const updateRepartidorMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: { vehiculo?: string; status?: string; esConfiable?: boolean } }) => {
      const shop = typeof user?.miEmpresa === 'string' ? user.miEmpresa : user?.miEmpresa?.tienda || 'sandbox'
      const client = getInboxClient()

      const m = gql`
        mutation UpdateRepartidor($shop: String!, $id: ID!, $input: UpdateRepartidorInput!) {
          updateRepartidor(shop: $shop, id: $id, input: $input) {
            id
            email
            status
          }
        }
      `
      const data = await client.request<{ updateRepartidor: { id: string; email: string; status: string } }>(m, { shop, id, input })
      return data.updateRepartidor
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listRepartidores'] })
    },
  })

  const deleteRepartidorMutation = useMutation({
    mutationFn: async (id: string) => {
      const shop = typeof user?.miEmpresa === 'string' ? user.miEmpresa : user?.miEmpresa?.tienda || 'sandbox'
      const client = getInboxClient()

      const m = gql`
        mutation DeleteRepartidor($shop: String!, $id: ID!) {
          deleteRepartidor(shop: $shop, id: $id)
        }
      `
      const data = await client.request<{ deleteRepartidor: boolean }>(m, { shop, id })
      return data.deleteRepartidor
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listRepartidores'] })
    },
  })

  return {
    listRepartidoresQuery,
    createRepartidorMutation,
    updateRepartidorMutation,
    deleteRepartidorMutation,
  }
}
