import { createContext, ReactNode, useEffect, useReducer } from 'react'

import { apiActivarCajas, obtenerArqueoActivo } from '../../modules/cajas/api/aperturaCajaActivo'
import { AperturaCajaActivo } from '../../modules/cajas/interfaces/arqueoCaja'
import AlertError from '../components/Alert/AlertError'
import MatxLoading from '../components/Template/MatxLoading/MatxLoading'
import useAuth from '../hooks/useAuth'

type InitialStateProps = {
  inicio: boolean
  cajaActiva: boolean
  aperturaCajaActivo: AperturaCajaActivo | null
}

const initialState: InitialStateProps = {
  inicio: false,
  cajaActiva: false,
  aperturaCajaActivo: null,
}

type Action =
  | { type: 'ACTIVAR_CAJAS'; payload: { cajaActiva: boolean } }
  | { type: 'APERTURA_CAJA_ACTIVO'; payload: { aperturaCajaActivo: AperturaCajaActivo | null } }

const reducer = (state: InitialStateProps, action: Action): InitialStateProps => {
  switch (action.type) {
    case 'ACTIVAR_CAJAS':
      return { ...state, cajaActiva: action.payload.cajaActiva, inicio: true }
    case 'APERTURA_CAJA_ACTIVO':
      return { ...state, aperturaCajaActivo: action.payload.aperturaCajaActivo, inicio: true }
    default:
      return state
  }
}

const CajasContext = createContext({
  ...initialState,
  refetchCajas: () => Promise.resolve(),
  refetchArqueoActivo: () => Promise.resolve(),
})

export interface CajasProviderProps {
  children: ReactNode
}

/**
 * Provider para manejar operaciones de cajas y arqueo activo
 */
export const CajasProvider = ({ children }: CajasProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const {
    user: { usuario, sucursal, puntoVenta },
  } = useAuth()

  // Consulta si las cajas están activas
  const cajaActiva = async () => apiActivarCajas().catch(() => false)
  const arqueoActivo = async () =>
    obtenerArqueoActivo(usuario, sucursal.codigo, puntoVenta.codigo).catch(() => null)

  const refetchCajas = async () => {
    const cajaActivaResult = await cajaActiva()
    dispatch({ type: 'ACTIVAR_CAJAS', payload: { cajaActiva: cajaActivaResult } })
  }

  const refetchArqueoActivo = async () => {
    const arqueoActivoResult = await arqueoActivo()
    dispatch({ type: 'APERTURA_CAJA_ACTIVO', payload: { aperturaCajaActivo: arqueoActivoResult } })
  }

  useEffect(() => {
    ;(async () => {
      const cajaActivaResult = await cajaActiva()
      const arqueoActivoResult = await arqueoActivo()
      dispatch({ type: 'ACTIVAR_CAJAS', payload: { cajaActiva: cajaActivaResult } })
      dispatch({ type: 'APERTURA_CAJA_ACTIVO', payload: { aperturaCajaActivo: arqueoActivoResult } })
    })()
  }, [])

  // Loading global
  if (!state.inicio) {
    return <MatxLoading />
  }

  // Alertas si no hay caja activa
  if (!cajaActiva) {
    return (
      <AlertError tipo="info" mensaje="No hay cajas activas. Por favor activa una caja para continuar." />
    )
  }

  return (
    <CajasContext.Provider
      value={{
        ...state,
        refetchCajas,
        refetchArqueoActivo,
      }}
    >
      {children}
    </CajasContext.Provider>
  )
}

export default CajasContext
