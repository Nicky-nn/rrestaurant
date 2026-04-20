import { QueryKey } from '@tanstack/query-core'
import { useQuery } from '@tanstack/react-query'

import { apiSinActividadesPorDocumentoSector } from '../api/sinActividadesPorDocumentoSector'
import { SinActividadesDocumentoSectorProps } from '../interfaces/sin.interface'

/**
 * Hook para listado básico de tipos de producto
 * limit 1000
 */
const useQueryActividadesPorDocumentoSector = (queryKey: QueryKey = []) => {
  const {
    data: actividades,
    isLoading: actLoading,
    isError: actIsError,
    error: actError,
  } = useQuery<SinActividadesDocumentoSectorProps[], Error>({
    queryKey: ['actividadesPorDocumentoSector', ...queryKey],
    queryFn: async () => {
      const resp = await apiSinActividadesPorDocumentoSector()
      if (resp.length > 0) {
        return resp
      }
      return []
    },
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    refetchInterval: false,
  })

  return { actividades, actLoading, actIsError, actError }
}

export default useQueryActividadesPorDocumentoSector
