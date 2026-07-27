import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql, GraphQLClient } from 'graphql-request'

const getInboxClient = () => {
  const token = localStorage.getItem('accessToken') || ''
  let rawUrl =
    import.meta.env.VITE_ISI_API_INBOX_URL || import.meta.env.ISI_API_INBOX_URL || 'http://localhost:4000/api'
  if (rawUrl.startsWith('/')) {
    rawUrl = window.location.origin + rawUrl
  }
  return new GraphQLClient(rawUrl, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

const CHANGE_ORDER_STATUS_MUTATION = gql`
  mutation CAMBIAR_ESTADO($id: String!, $status: EstadoInbox!, $shop: String!) {
    changeOrderStatus(id: $id, status: $status, shop: $shop) {
      success
      message
      orderId
      order
    }
  }
`

interface ChangeOrderStatusInput {
  id: string
  status: 'PENDIENTE' | 'PREPARANDO' | 'LISTO_PARA_RECOGER' | 'ESPERANDO_DELIVERY' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO'
  shop: string
}

export const useChangeOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, shop }: ChangeOrderStatusInput) => {
      const client = getInboxClient()
      const data: any = await client.request(CHANGE_ORDER_STATUS_MUTATION, { id, status, shop })
      return data?.changeOrderStatus
    },
    onSuccess: () => {
      // Invalidate the orders list so it fetches the new status
      queryClient.invalidateQueries({ queryKey: ['listOrders'] })
    },
  })
}
