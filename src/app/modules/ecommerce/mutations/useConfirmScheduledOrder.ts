import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { getInboxClient } from '../api/inboxClient'

const CONFIRM_SCHEDULED_ORDER_MUTATION = gql`
  mutation ConfirmScheduledOrder($orderId: String!) {
    confirmScheduledOrder(orderId: $orderId) {
      success
      message
      orderId
      nroPedido
      order
    }
  }
`

export const useConfirmScheduledOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      const client = getInboxClient()
      const data: any = await client.request(CONFIRM_SCHEDULED_ORDER_MUTATION, { orderId })
      return data?.confirmScheduledOrder
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listOrders'] })
      queryClient.invalidateQueries({ queryKey: ['listScheduledOrders'] })
    },
  })
}
