// noinspection GraphQLUnresolvedReference

import { QueryKey, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from 'react-toastify'
import { apiActivarCajas } from './aperturaCajaActivo'
import { AperturaInput, CajaProps, CierreInput, EntidadInput, IngresoInput, Modulo, RetiroInput } from '../interfaces/aperturaCaja'
import { apiCajaListado } from './listadoCajaApi'
import { apiTurnoCajaListado } from './listadoTurnoCajaApi'
import { apiAperturaCaja } from './aperturaCajaApi'
import { apiArqueoCaja } from './arqueoCajaApi'
import { apiRetiroCaja } from './retiroCajaApi'
import { apiIngresoCaja } from './ingresoCajaApi'
import { apiCerrarCaja } from './cerrarCajaApi'
import { ArqueoCajaProps, TurnoCajaProps } from '../interfaces/arqueoCaja'

// -----------------------------------------------------------------------------
// HOOKS PARA QUERIES (Consultas de datos)
// -----------------------------------------------------------------------------

/**
 * Hook para verificar si la funcionalidad de cajas está activa.
 */
export const useQueryActivarCajas = (queryKey: QueryKey = []) => {
  const {
    data: isCajasActivas,
    isLoading,
    isError,
    error,
  } = useQuery<boolean, Error>({
    queryKey: ['activarCajas', ...queryKey],
    queryFn: apiActivarCajas,
  })

  return { isCajasActivas, isLoading, isError, error }
}

/**
 * Hook para obtener el listado general de todas las cajas.
 */
export const useQueryCajaListado = (queryKey: QueryKey = [], query?: string) => {
  const {
    data: cajas,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<CajaProps[], Error>({
    queryKey: ['cajaListado', ...queryKey, query], // incluimos query opcional en queryKey
    queryFn: async () => {
      // Llamamos a la API pasando query si existe, sino vacío
      const result = await apiCajaListado(query ?? '')
      return result
    },
    refetchOnWindowFocus: false,
  })

  return { cajas, isLoading, isError, error, refetch }
}

/**
 * Hook para obtener la lista de todos los turnos de caja disponibles.
 */
export const useQueryTurnoCajaListado = (queryKey: QueryKey = []) => {
  const {
    data: turnos,
    isLoading,
    isError,
    error,
  } = useQuery<TurnoCajaProps[], Error>({
    queryKey: ['turnoCajaListado', ...queryKey],
    queryFn: apiTurnoCajaListado,
  })

  return { turnos, isLoading, isError, error }
}

// -----------------------------------------------------------------------------
// HOOKS PARA MUTATIONS (Creación, actualización y eliminación de datos)
// -----------------------------------------------------------------------------

/**
 * Hook para registrar la apertura de una caja.
 */
export const useMutationAperturaCaja = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ArqueoCajaProps,
    any, // <-- cambiar a 'any' para capturar todo el objeto error
    {
      cajaId: string
      entidad: EntidadInput
      input: AperturaInput
      modulo: Modulo
    }
  >({
    mutationFn: ({ cajaId, entidad, input, modulo }) =>
      apiAperturaCaja(cajaId, entidad, input, modulo),
    onSuccess: () => {
      // Invalida la caché del listado de cajas para que se actualice
      queryClient.invalidateQueries({ queryKey: ['cajaListado'] })
    },
    onError: (error: any) => {
      console.error("🔥 Error completo al abrir caja:", error)

      // Extraemos mensaje si existe
      const msg =
        error?.response?.errors?.[0]?.message || error?.message || "Error desconocido"
      // Opcional: mostrar con toast
      toast.error(`Error al abrir caja: ${msg}`)
    },
  })
}


/**
 * Hook para realizar un arqueo de una caja abierta.
 */
export const useMutationArqueoCaja = () => {
  const queryClient = useQueryClient()

  return useMutation<ArqueoCajaProps, Error, { id: string; observacion: string }>({
    mutationFn: ({ id, observacion }) => apiArqueoCaja(id, observacion),
    onSuccess: (data) => {
      // Opcional: puedes actualizar la caché específica de este arqueo
      // o invalidar consultas relacionadas.
      queryClient.invalidateQueries({ queryKey: ['arqueoCaja', data._id] })
    },
  })
}

/**
 * Hook para registrar un retiro de dinero de una caja abierta.
 */
export const useMutationRetiroCaja = () => {
  const queryClient = useQueryClient()

  return useMutation<ArqueoCajaProps, Error, { id: string; inputData: RetiroInput }>({
    mutationFn: ({ id, inputData }) => apiRetiroCaja(id, inputData),
    onSuccess: (data) => {
      // Invalida la caché del arqueo para reflejar el retiro.
      queryClient.invalidateQueries({ queryKey: ['arqueoCaja', data._id] })
    },
  })
}

/**
 * Hook para registrar un ingreso de dinero de una caja abierta.
 */
export const useMutationIngresoCaja = () => {
  const queryClient = useQueryClient()

  return useMutation<ArqueoCajaProps, Error, { id: string; inputData: IngresoInput }>({
    mutationFn: ({ id, inputData }) => apiIngresoCaja(id, inputData),
    onSuccess: (data) => {
      // Invalida la caché del arqueo para reflejar el ingreso.
      queryClient.invalidateQueries({ queryKey: ['arqueoCaja', data._id] })
    },
  })
}

/**
 * Hook para realizar el cierre de una caja abierta.
 */
export const useMutationCerrarCaja = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ArqueoCajaProps,
    Error,
    { id: string; inputData: CierreInput }
  >({
    mutationFn: ({ id, inputData }) =>
      apiCerrarCaja(id, inputData),
    onSuccess: () => {
      // Invalida tanto el listado general de cajas como los detalles
      // del arqueo específico.
      queryClient.invalidateQueries({ queryKey: ['cajaListado'] })
      queryClient.invalidateQueries({ queryKey: ['arqueoCaja'] })
    },
  })
}
