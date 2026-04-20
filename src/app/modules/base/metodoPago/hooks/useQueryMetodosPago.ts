import { QueryKey } from '@tanstack/query-core'
import { useQuery } from '@tanstack/react-query'

import { apiMetodosPago } from '../api/metodosPago.api'
import { MetodoPagoProp } from '../interfaces/metodoPago'

/**
 * Hook para listado de métodos de págo
 * limit 1000
 */
const useQueryMetodosPago = (queryKey: QueryKey = []) => {
  const {
    data: metodosPago,
    isLoading: mpLoading,
    isError: mpIsError,
    error: mpError,
  } = useQuery<MetodoPagoProp[], Error>({
    queryKey: ['metodosPago', ...queryKey],
    queryFn: async () => {
      const resp = await apiMetodosPago()
      if (resp.length > 0) {
        return resp
      }
      return []
    },
  })

  return { metodosPago, mpLoading, mpIsError, mpError }
}

export default useQueryMetodosPago
