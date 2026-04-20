import { QueryKey } from '@tanstack/query-core'
import { useQuery } from '@tanstack/react-query'

import { fetchSinActividades } from '../api/sinActividadEconomica.api'
import { SinActividadesProps } from '../interfaces/sin.interface'

/**
 * Hook para listado básico de tipos de producto
 * limit 1000
 */
const useQueryActividades = (queryKey: QueryKey = []) => {
  const {
    data: actividades,
    isLoading: actLoading,
    isError: actIsError,
    error: actError,
  } = useQuery<SinActividadesProps[], Error>({
    queryKey: ['actividades', ...queryKey],
    queryFn: async () => {
      const resp = await fetchSinActividades()
      if (resp.length > 0) {
        return resp
      }
      return []
    },
  })

  return { actividades, actLoading, actIsError, actError }
}

export default useQueryActividades
