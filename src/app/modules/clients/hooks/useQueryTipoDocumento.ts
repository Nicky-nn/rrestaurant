import { QueryKey, useQuery } from '@tanstack/react-query'

import { SinTipoDocumentoIdentidadProps } from '../../../interfaces/sin.interface'
import { fetchSinDocuments } from '../api/fetchSinDocuments'

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
      const { sinTipoDocumentoIdentidad } = await fetchSinDocuments()
      const resp = sinTipoDocumentoIdentidad
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
