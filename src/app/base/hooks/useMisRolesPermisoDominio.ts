import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { apiMisRolesPermisoPorDominio } from '../api/apiRolesPermisoDominio'
import { getDominioFromEnv } from '../../utils/menuPermissionFilter'

// --- La interfaz de retorno se mantiene igual ---
export interface UsePermissionsByDomainState {
  permisos: string[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

export const useMisRolesPermisoDominio = (
  options: { domain?: string; autoLoad?: boolean } = {},
): UsePermissionsByDomainState => {
  const { domain = getDominioFromEnv(), autoLoad = true } = options

  const {
    data: permisos,
    isLoading: loading,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['misPermisos', domain],

    queryFn: () => apiMisRolesPermisoPorDominio(domain),
    enabled: autoLoad,
    initialData: [],
  })

  const refetch = useCallback(() => {
    reactQueryRefetch()
  }, [reactQueryRefetch])

  return {
    permisos: permisos,
    loading: loading,
    error: error ? (error as Error) : null,
    refetch,
  }
}
