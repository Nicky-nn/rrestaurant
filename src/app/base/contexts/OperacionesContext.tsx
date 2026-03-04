import { useQuery } from '@tanstack/react-query'
import { createContext, ReactNode, useReducer } from 'react'

import { ArticuloMonedaProps } from '../../interfaces/articuloMoneda.ts'
import { KardexPeriodoProps } from '../../interfaces/kardexPeriodo.ts'
import { apiArticuloMoneda } from '../api/apiArticuloMoneda.ts'
import { apiKardexPeriodoActivo } from '../api/apiKardexPeriodoActivo'
import AlertError from '../components/Alert/AlertError.tsx'
import MatxLoading from '../components/Template/MatxLoading/MatxLoading.tsx'

type InitialStateProps = {
  articuloMoneda: ArticuloMonedaProps
  kardexPeriodo: KardexPeriodoProps | null
}
const initialState: InitialStateProps = {
  articuloMoneda: null as any,
  kardexPeriodo: null,
}

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'ARTICULO_MONEDA': {
      const { articuloMoneda } = action.payload

      return {
        ...state,
        articuloMoneda,
      }
    }
    case 'KARDEX_PERIODO': {
      const { kardexPeriodo } = action.payload

      return {
        ...state,
        kardexPeriodo,
      }
    }
    default: {
      return { ...state }
    }
  }
}

const OperacionesContext = createContext({
  ...initialState,
})

export type OperacionesProviderProps = {
  children: ReactNode
}

/**
 * DEfinimos las operaciones que se deben cumplir para iniciar operaciones relacionado a inventarios
 * @param children
 * @constructor
 */
export const OperacionesProvider = ({ children }: OperacionesProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { data: articuloMoneda, isLoading: artMonedaLoading } = useQuery({
    queryKey: ['articuloMoneda'],
    queryFn: async () => {
      const articuloMoneda = await apiArticuloMoneda()
      dispatch({
        type: 'ARTICULO_MONEDA',
        payload: {
          articuloMoneda: articuloMoneda || {},
        },
      })
      return articuloMoneda
    },
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  const { data: kardexPeriodo, isLoading: kardexPeriodoLoading } = useQuery({
    queryKey: ['kardexPeriodo'],
    queryFn: async () => {
      const kardexPeriodo = await apiKardexPeriodoActivo()
      dispatch({
        type: 'KARDEX_PERIODO',
        payload: {
          kardexPeriodo: kardexPeriodo || {},
        },
      })
      return kardexPeriodo
    },
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  if (artMonedaLoading || kardexPeriodoLoading || !state.articuloMoneda || !state.kardexPeriodo) {
    return <MatxLoading />
  }

  if (!articuloMoneda?.monedaPrimaria) {
    return <AlertError tipo={'info'} mensaje={'Requiere que se registre la moneda primaria.'} />
  }

  if (!kardexPeriodo?.codigo) {
    return <AlertError tipo={'info'} mensaje={'Requiere que se registre kardex periodo inicial.'} />
  }

  return (
    <OperacionesContext.Provider
      value={{
        ...state,
      }}
    >
      {children}
    </OperacionesContext.Provider>
  )
}

export default OperacionesContext
