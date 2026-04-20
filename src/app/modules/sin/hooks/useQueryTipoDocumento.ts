import { QueryKey } from '@tanstack/query-core'
import { useQuery } from '@tanstack/react-query'

import { fetchSinTipoDocumentoIdentidad } from '../api/sinTipoDocumentoIdentidad.api'
import { SinTipoDocumentoIdentidadProps } from '../interfaces/sin.interface'

/**
 * Hook para listado básico de tipos de producto
 * limit 1000
 */
const useQueryTipoDocumentoIdentidad = (queryKey: QueryKey = []) => {
  const {
    data: tiposDocumentoIdentidad,
    isLoading: tdiLoading,
    isError: tdiIsError,
    error: tdiError,
    isSuccess: tdIsSuccess,
  } = useQuery<SinTipoDocumentoIdentidadProps[], Error>({
    queryKey: ['tipoDocumentoIdentidad', ...queryKey],
    queryFn: async () => {
      const resp = await fetchSinTipoDocumentoIdentidad()
      if (resp.length > 0) {
        return resp
      }
      return []
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
  })

  return { tiposDocumentoIdentidad, tdiLoading, tdiIsError, tdiError, tdIsSuccess }
}

export default useQueryTipoDocumentoIdentidad
