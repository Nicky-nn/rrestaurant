import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'

import { SinUnidadMedidaProps } from '../../../interfaces/sin.interface.ts'
import { apiSinUnidadMedidaListado } from '../../api/apiSinUnidadesMedidaListado.ts'

interface Props {
  enabled?: boolean
  [key: string]: unknown
}

const QUERY_KEY = 'sinUnidadesMedida'

/**
 * Hook de listado de sin unidades de medida
 * @param enabled
 * @param otrosParams
 * @param queryOptions
 * @author isi-template
 */
export const useSinUnidadesMedidaQuery = (
  { enabled = true, ...otrosParams }: Props = {},
  queryOptions?: Omit<UseQueryOptions<SinUnidadMedidaProps[], Error>, 'queryKey' | 'queryFn'>,
) => {
  const queryClient = useQueryClient()

  const query = useQuery<SinUnidadMedidaProps[], Error>({
    queryKey: [QUERY_KEY, otrosParams],
    queryFn: async () => apiSinUnidadMedidaListado(),
    enabled: enabled,
    ...queryOptions,
  })

  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })

  return {
    ...query,
    unidadesMedida: query.data ?? [],
    invalidateAll,
  }
}
